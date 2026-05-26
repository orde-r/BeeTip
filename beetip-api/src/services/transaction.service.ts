import { eq, sql } from "drizzle-orm";
import db from "../db.js";
import { usersTable, transactionsTable } from "../db/schema.js";
import type { TransactionDTO } from "../dtos/transaction.dto.js";

function toTransactionDTO(row: typeof transactionsTable.$inferSelect): TransactionDTO {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    createdAt: row.createdAt.toISOString(),
  };
}

export async function deposit(userId: string, amount: number) {
  return await db.transaction(async (tx) => {
    await tx
      .update(usersTable)
      .set({
        balance: sql`${usersTable.balance} + ${amount.toFixed(2)}::numeric`,
      })
      .where(eq(usersTable.id, userId));

    const [txRecord] = await tx
      .insert(transactionsTable)
      .values({
        userId,
        type: "DEPOSIT",
        amount: amount.toFixed(2),
      })
      .returning();

    const [user] = await tx
      .select({ balance: usersTable.balance })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    return {
      message: "Deposit successful",
      transaction: toTransactionDTO(txRecord),
      new_balance: Number(user.balance),
    };
  });
}
