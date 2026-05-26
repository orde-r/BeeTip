import { eq, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { usersTable, transactionsTable } from "../db/schema.js";
import { BadRequestError } from "../errors/bad-request.error.js";

// Strategy Design Pattern
/* Each transaction type (DEPOSIT, PAYMENT, EARNING) has different business logic
(who gets debited/credited, validation rules). Instead of a monolithic function
with branching logic, each type is handled by a dedicated strategy. */

type DrizzleTx = Parameters<Parameters<NodePgDatabase["transaction"]>[0]>[0];

type TransactionResult = {
  id: string;
  userId: string;
  type: string;
  amount: number;
  createdAt: string;
};

type TransactionStrategy = (
  tx: DrizzleTx,
  userId: string,
  amount: number,
  orderId?: string,
) => Promise<TransactionResult>;

async function createTransactionRecord(
  tx: DrizzleTx,
  userId: string,
  type: string,
  amount: number,
  orderId?: string,
): Promise<TransactionResult> {
  const [record] = await tx
    .insert(transactionsTable)
    .values({
      userId,
      orderId,
      type,
      amount: amount.toFixed(2),
    })
    .returning();

  return {
    id: record.id,
    userId: record.userId,
    type: record.type,
    amount: Number(record.amount),
    createdAt: record.createdAt.toISOString(),
  };
}

async function increaseBalance(tx: DrizzleTx, userId: string, amount: number) {
  await tx
    .update(usersTable)
    .set({
      balance: sql`${usersTable.balance} + ${amount.toFixed(2)}::numeric`,
    })
    .where(eq(usersTable.id, userId));
}

async function decreaseBalance(tx: DrizzleTx, userId: string, amount: number) {
  await tx
    .update(usersTable)
    .set({
      balance: sql`${usersTable.balance} - ${amount.toFixed(2)}::numeric`,
    })
    .where(eq(usersTable.id, userId));
}

export const transactionStrategies: Record<string, TransactionStrategy> = {
  DEPOSIT: async (tx, userId, amount) => {
    await increaseBalance(tx, userId, amount);
    return await createTransactionRecord(tx, userId, "DEPOSIT", amount);
  },

  PAYMENT: async (tx, userId, amount, orderId) => {
    const [user] = await tx
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .for("update")
      .limit(1);

    if (!user || Number(user.balance) < amount) {
      throw new BadRequestError("Insufficient balance");
    }

    await decreaseBalance(tx, userId, amount);
    return await createTransactionRecord(tx, userId, "PAYMENT", amount, orderId);
  },

  EARNING: async (tx, userId, amount, orderId) => {
    await increaseBalance(tx, userId, amount);
    return await createTransactionRecord(tx, userId, "EARNING", amount, orderId);
  },
};

export async function executeTransaction(
  tx: DrizzleTx,
  type: string,
  userId: string,
  amount: number,
  orderId?: string,
) {
  const strategy = transactionStrategies[type];
  if (!strategy) {
    throw new BadRequestError(`Unknown transaction type: ${type}`);
  }
  return await strategy(tx, userId, amount, orderId);
}
