import { eq, asc } from "drizzle-orm";
import db from "../db.js";
import { messagesTable, ordersTable } from "../db/schema.js";
import type { MessageDTO } from "../dtos/message.dto.js";
import { NotFoundError } from "../errors/not-found.error.js";
import { ForbiddenError } from "../errors/forbidden.error.js";

function toMessageDTO(row: typeof messagesTable.$inferSelect): MessageDTO {
  return {
    id: row.id,
    orderId: row.orderId,
    senderId: row.senderId,
    content: row.content,
    timestamp: row.createdAt.toISOString(),
  };
}

export async function validateUserInOrder(orderId: string, userId: string) {
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  if (order.buyerId !== userId && order.kurirId !== userId) {
    throw new ForbiddenError("You are not a participant in this order");
  }

  return order;
}

export async function getOrderMessages(orderId: string, userId: string) {
  await validateUserInOrder(orderId, userId);

  const rows = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.orderId, orderId))
    .orderBy(asc(messagesTable.createdAt));

  return {
    messages: rows.map(toMessageDTO),
  };
}

export async function saveMessage(orderId: string, senderId: string, content: string) {
  await validateUserInOrder(orderId, senderId);

  const [newMessage] = await db
    .insert(messagesTable)
    .values({
      orderId,
      senderId,
      content,
    })
    .returning();

  return toMessageDTO(newMessage);
}
