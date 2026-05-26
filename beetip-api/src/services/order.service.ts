import { eq, and } from "drizzle-orm";
import db from "../db.js";
import { ordersTable } from "../db/schema.js";
import type { OrderDTO } from "../dtos/order.dto.js";
import { NotFoundError } from "../errors/not-found.error.js";
import { ForbiddenError } from "../errors/forbidden.error.js";
import { BadRequestError } from "../errors/bad-request.error.js";

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
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  if (order.status !== "PENDING") {
    throw new BadRequestError("Order is not in PENDING state");
  }

  if (order.buyerId === kurirId) {
    throw new ForbiddenError("Cannot accept your own order");
  }

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
