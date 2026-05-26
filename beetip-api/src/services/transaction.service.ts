import { eq } from "drizzle-orm";
import db from "../db.js";
import { usersTable } from "../db/schema.js";
import { executeTransaction } from "./transaction-strategies.js";

export async function deposit(userId: string, amount: number) {
  return await db.transaction(async (tx) => {
    const txRecord = await executeTransaction(tx, "DEPOSIT", userId, amount);

    const [user] = await tx
      .select({ balance: usersTable.balance })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    return {
      message: "Deposit successful",
      transaction: txRecord,
      new_balance: Number(user.balance),
    };
  });
}
