import crypto from "crypto";
import { eq, and } from "drizzle-orm";
import db from "../db.js";
import { ordersTable } from "../db/schema.js";
import type { OrderDTO } from "../dtos/order.dto.js";
import { NotFoundError } from "../errors/not-found.error.js";
import { BadRequestError } from "../errors/bad-request.error.js";
import { validateTransition } from "./order-states.js";
import { executeTransaction } from "./transaction-strategies.js";

function toOrderDTO(row: typeof ordersTable.$inferSelect): OrderDTO {
  return {
    id: row.id,
    buyer_id: row.buyerId,
    kurir_id: row.kurirId ?? null,
    to_location: row.toLocation,
    item_desc: row.itemDesc,
    item_price: row.itemPrice ? Number(row.itemPrice) : null,
    delivery_fee: Number(row.deliveryFee),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

function getOrderOrThrow(order: typeof ordersTable.$inferSelect | undefined) {
  if (!order) throw new NotFoundError("Order not found");
  return order;
}

function generateSecurityCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function createOrder(buyerId: string, toLocation: string, itemDesc: string) {
  const [newOrder] = await db
    .insert(ordersTable)
    .values({
      buyerId,
      toLocation,
      itemDesc,
    })
    .returning();

  return {
    message: "Order created successfully",
    order: toOrderDTO(newOrder),
  };
}

export async function listAvailableOrders() {
  const rows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.status, "PENDING"));

  return {
    orders: rows.map(toOrderDTO),
    total: rows.length,
  };
}

export async function acceptOrder(orderId: string, kurirId: string) {
  const [row] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  const order = getOrderOrThrow(row);
  validateTransition(order.status, "accept", kurirId, order.buyerId, order.kurirId);

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
    order: toOrderDTO(updated),
  };
}

export async function uploadPrice(orderId: string, userId: string, itemPrice: number) {
  const [row] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  const order = getOrderOrThrow(row);
  validateTransition(order.status, "price", userId, order.buyerId, order.kurirId);

  const [updated] = await db
    .update(ordersTable)
    .set({
      itemPrice: itemPrice.toFixed(2),
      status: "PRICED",
      updatedAt: new Date(),
    })
    .where(eq(ordersTable.id, orderId))
    .returning();

  return {
    message: "Price updated successfully",
    order: toOrderDTO(updated),
  };
}

// Facade Pattern (design_patterns.md #6)
// Orchestrates balance validation, balance deduction, transaction record,
// security code generation, and order status update behind a single function call.
export async function payOrder(orderId: string, buyerId: string) {
  return await db.transaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .for("update")
      .limit(1);

    const order = getOrderOrThrow(row);
    validateTransition(order.status, "pay", buyerId, order.buyerId, order.kurirId);

    const totalAmount = Number(order.itemPrice!) + Number(order.deliveryFee);

    await executeTransaction(tx, "PAYMENT", buyerId, totalAmount, orderId);

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
      security_code: securityCode,
      order: toOrderDTO(updated),
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
    validateTransition(order.status, "complete", kurirId, order.buyerId, order.kurirId);

    if (order.securityCode !== securityCode) {
      throw new BadRequestError("Invalid security code");
    }

    const totalAmount = Number(order.itemPrice!) + Number(order.deliveryFee);

    await executeTransaction(tx, "EARNING", kurirId, totalAmount, orderId);

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
      order: toOrderDTO(updated),
    };
  });
}
