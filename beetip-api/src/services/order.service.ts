import crypto from "crypto";
import { eq, and, or, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import db from "../db.js";
import { ordersTable, usersTable } from "../db/schema.js";
import type { OrderDTO } from "../dtos/order.dto.js";
import { NotFoundError } from "../errors/not-found.error.js";
import { BadRequestError } from "../errors/bad-request.error.js";
import { ForbiddenError } from "../errors/forbidden.error.js";
import { processTransaction } from "./transaction.service.js";

const buyerUsers = alias(usersTable, "buyer_users");
const kurirUsers = alias(usersTable, "kurir_users");

function toOrderDTO(
  row: typeof ordersTable.$inferSelect,
  buyerEmail: string | null = null,
  kurirEmail: string | null = null,
): OrderDTO {
  return {
    id: row.id,
    buyerId: row.buyerId,
    buyerEmail,
    kurirId: row.kurirId ?? null,
    kurirEmail,
    fromLocation: row.fromLocation,
    toLocation: row.toLocation,
    itemDesc: row.itemDesc,
    itemPrice: row.itemPrice ? Number(row.itemPrice) : null,
    receiptImageUrl: row.receiptImageUrl ?? null,
    deliveryFee: Number(row.deliveryFee),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function getOrderOrThrow(order: typeof ordersTable.$inferSelect | undefined) {
  if (!order) throw new NotFoundError("Order not found");
  return order;
}

function generateSecurityCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function validateOrderAction(
  status: string,
  action: string,
  userId: string,
  buyerId: string,
  kurirId: string | null,
): string {
  const isBuyer = userId === buyerId;
  const isKurir = kurirId !== null && userId === kurirId;

  if (status === "PENDING" && action === "accept") {
    if (isBuyer) throw new ForbiddenError("Cannot accept your own order");
    return "ACCEPTED";
  }

  if (status === "PENDING" && action === "cancel") {
    if (!isBuyer) throw new ForbiddenError("Only the buyer can perform this action");
    return "CANCELLED";
  }

  if (status === "ACCEPTED" && action === "price") {
    if (!isKurir) throw new ForbiddenError("Only the assigned kurir can perform this action");
    return "PRICED";
  }

  if (status === "ACCEPTED" && action === "cancel") {
    if (!isBuyer && !isKurir) throw new ForbiddenError("You are not a participant in this order");
    return "CANCELLED";
  }

  if (status === "PRICED" && action === "pay") {
    if (!isBuyer) throw new ForbiddenError("Only the buyer can perform this action");
    return "PAID";
  }

  if (status === "PRICED" && action === "cancel") {
    if (!isBuyer && !isKurir) throw new ForbiddenError("You are not a participant in this order");
    return "CANCELLED";
  }

  if (status === "PAID" && action === "complete") {
    if (!isKurir) throw new ForbiddenError("Only the assigned kurir can perform this action");
    return "COMPLETED";
  }

  if (["PENDING", "ACCEPTED", "PRICED", "PAID"].includes(status)) {
    throw new BadRequestError(`Action '${action}' is not allowed when order is '${status}'`);
  }

  throw new BadRequestError(`No actions available for status '${status}'`);
}

export async function createOrder(buyerId: string, fromLocation: string, toLocation: string, itemDesc: string) {
  const [newOrder] = await db
    .insert(ordersTable)
    .values({
      buyerId,
      fromLocation,
      toLocation,
      itemDesc,
    })
    .returning();

  return {
    message: "Order created successfully",
    order: await getOrderDTOById(newOrder.id),
  };
}

export async function listAvailableOrders() {
  const rows = await db
    .select({
      order: ordersTable,
      buyerEmail: buyerUsers.email,
      kurirEmail: kurirUsers.email,
    })
    .from(ordersTable)
    .leftJoin(buyerUsers, eq(ordersTable.buyerId, buyerUsers.id))
    .leftJoin(kurirUsers, eq(ordersTable.kurirId, kurirUsers.id))
    .where(eq(ordersTable.status, "PENDING"));

  return {
    orders: rows.map((row) =>
      toOrderDTO(row.order, row.buyerEmail, row.kurirEmail),
    ),
    total: rows.length,
  };
}

async function getParticipantEmails(buyerId: string, kurirId: string | null) {
  const userIds = kurirId ? [buyerId, kurirId] : [buyerId];
  const rows = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
    })
    .from(usersTable)
    .where(or(...userIds.map((userId) => eq(usersTable.id, userId))));

  return {
    buyerEmail: rows.find((row) => row.id === buyerId)?.email ?? null,
    kurirEmail: kurirId
      ? rows.find((row) => row.id === kurirId)?.email ?? null
      : null,
  };
}

async function getOrderDTOById(orderId: string) {
  const [row] = await db
    .select({
      order: ordersTable,
      buyerEmail: buyerUsers.email,
      kurirEmail: kurirUsers.email,
    })
    .from(ordersTable)
    .leftJoin(buyerUsers, eq(ordersTable.buyerId, buyerUsers.id))
    .leftJoin(kurirUsers, eq(ordersTable.kurirId, kurirUsers.id))
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  if (!row) throw new NotFoundError("Order not found");
  return toOrderDTO(row.order, row.buyerEmail, row.kurirEmail);
}

export async function listUserOrders(userId: string) {
  const rows = await db
    .select({
      order: ordersTable,
      buyerEmail: buyerUsers.email,
      kurirEmail: kurirUsers.email,
    })
    .from(ordersTable)
    .leftJoin(buyerUsers, eq(ordersTable.buyerId, buyerUsers.id))
    .leftJoin(kurirUsers, eq(ordersTable.kurirId, kurirUsers.id))
    .where(or(eq(ordersTable.buyerId, userId), eq(ordersTable.kurirId, userId)))
    .orderBy(desc(ordersTable.createdAt));

  return {
    orders: rows.map((row) =>
      toOrderDTO(row.order, row.buyerEmail, row.kurirEmail),
    ),
    total: rows.length,
  };
}

export async function getOrderById(orderId: string, userId: string) {
  const [row] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  const order = getOrderOrThrow(row);

  if (order.buyerId !== userId && order.kurirId !== userId) {
    throw new ForbiddenError("You are not a participant in this order");
  }

  return {
    order: await getOrderDTOById(order.id),
  };
}

export async function acceptOrder(orderId: string, kurirId: string) {
  const [row] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  const order = getOrderOrThrow(row);
  validateOrderAction(order.status, "accept", kurirId, order.buyerId, order.kurirId);

  const [updated] = await db
    .update(ordersTable)
    .set({
      kurirId,
      status: "ACCEPTED",
      updatedAt: new Date(),
    })
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.status, "PENDING")))
    .returning();

  if (!updated) {
    throw new BadRequestError("Order was already accepted by someone else");
  }

  return {
    message: "Order accepted successfully",
    order: await getOrderDTOById(updated.id),
  };
}

export async function uploadPrice(
  orderId: string,
  userId: string,
  itemPrice: number,
  receiptImageUrl?: string,
) {
  const [row] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  const order = getOrderOrThrow(row);
  validateOrderAction(order.status, "price", userId, order.buyerId, order.kurirId);

  const [updated] = await db
    .update(ordersTable)
    .set({
      itemPrice: itemPrice.toFixed(2),
      receiptImageUrl: receiptImageUrl ?? order.receiptImageUrl ?? null,
      status: "PRICED",
      updatedAt: new Date(),
    })
    .where(eq(ordersTable.id, orderId))
    .returning();

  return {
    message: "Price updated successfully",
    order: await getOrderDTOById(updated.id),
  };
}

export async function cancelOrder(orderId: string, userId: string) {
  const [row] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  const order = getOrderOrThrow(row);
  validateOrderAction(order.status, "cancel", userId, order.buyerId, order.kurirId);
  const isAssignedKurir = order.kurirId === userId;

  if ((order.status === "ACCEPTED" || order.status === "PRICED") && isAssignedKurir) {
    const [updated] = await db
      .update(ordersTable)
      .set({
        kurirId: null,
        itemPrice: null,
        receiptImageUrl: null,
        securityCode: null,
        status: "PENDING",
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, orderId))
      .returning();

    return {
      message: "Order returned to available pool",
      order: await getOrderDTOById(updated.id),
    };
  }

  const [updated] = await db
    .update(ordersTable)
    .set({
      status: "CANCELLED",
      updatedAt: new Date(),
    })
    .where(eq(ordersTable.id, orderId))
    .returning();

  return {
    message: "Order cancelled successfully",
    order: await getOrderDTOById(updated.id),
  };
}

// Facade Design Pattern
/* Performs balance validation, balance deduction, transaction record, 
security code generation, and order status update behind a single function call.
doesn't expose implementation details. */
export async function payOrder(orderId: string, buyerId: string) {
  return await db.transaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .for("update")
      .limit(1);

    const order = getOrderOrThrow(row);
    validateOrderAction(order.status, "pay", buyerId, order.buyerId, order.kurirId);
    const emails = await getParticipantEmails(order.buyerId, order.kurirId);

    const totalAmount = Number(order.itemPrice!) + Number(order.deliveryFee);

    await processTransaction(tx, "PAYMENT", buyerId, totalAmount, orderId);

    const securityCode = generateSecurityCode();

    const [updated] = await tx
      .update(ordersTable)
      .set({
        status: "PAID",
        securityCode,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, orderId))
      .returning();

    return {
      message: "Payment successful",
      securityCode,
      order: toOrderDTO(updated, emails.buyerEmail, emails.kurirEmail),
    };
  });
}

export async function completeOrder(orderId: string, kurirId: string, securityCode: string) {
  return await db.transaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .for("update")
      .limit(1);

    const order = getOrderOrThrow(row);
    validateOrderAction(order.status, "complete", kurirId, order.buyerId, order.kurirId);
    const emails = await getParticipantEmails(order.buyerId, order.kurirId);

    if (order.securityCode !== securityCode) {
      throw new BadRequestError("Invalid security code");
    }

    const totalAmount = Number(order.itemPrice!) + Number(order.deliveryFee);

    await processTransaction(tx, "EARNING", kurirId, totalAmount, orderId);

    const [updated] = await tx
      .update(ordersTable)
      .set({
        status: "COMPLETED",
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, orderId))
      .returning();

    return {
      message: "Order completed successfully",
      order: toOrderDTO(updated, emails.buyerEmail, emails.kurirEmail),
    };
  });
}
