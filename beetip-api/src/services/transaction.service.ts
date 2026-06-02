import { eq, desc, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import db from "../db.js";
import { transactionsTable, usersTable } from "../db/schema.js";
import { BadRequestError } from "../errors/bad-request.error.js";

type DrizzleTx = Parameters<Parameters<NodePgDatabase["transaction"]>[0]>[0];

type TransactionResult = {
  id: string;
  userId: string;
  type: string;
  amount: number;
  createdAt: string;
};

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

export async function processTransaction(
  tx: DrizzleTx,
  type: string,
  userId: string,
  amount: number,
  orderId?: string,
) {
  if (type === "DEPOSIT") {
    await increaseBalance(tx, userId, amount);
    return await createTransactionRecord(tx, userId, "DEPOSIT", amount);
  }

  if (type === "PAYMENT") {
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
  }

  if (type === "EARNING") {
    await increaseBalance(tx, userId, amount);
    return await createTransactionRecord(tx, userId, "EARNING", amount, orderId);
  }

  throw new BadRequestError(`Unknown transaction type: ${type}`);
}

export async function deposit(userId: string, amount: number) {
  return await db.transaction(async (tx) => {
    const txRecord = await processTransaction(tx, "DEPOSIT", userId, amount);

    const [user] = await tx
      .select({ balance: usersTable.balance })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    return {
      message: "Deposit successful",
      transaction: txRecord,
      newBalance: Number(user.balance),
    };
  });
}

export async function listUserTransactions(userId: string) {
  const rows = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.userId, userId))
    .orderBy(desc(transactionsTable.createdAt));

  return {
    transactions: rows.map((row) => ({
      id: row.id,
      type: row.type,
      amount: Number(row.amount),
      createdAt: row.createdAt.toISOString(),
    })),
    total: rows.length,
  };
}
