import { eq } from "drizzle-orm";
import db from "../db.js";
import { ordersTable } from "../db/schema.js";
import type { OrderDTO } from "../dtos/order.dto.js";

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
