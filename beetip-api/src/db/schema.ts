import { numeric, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  balance: numeric("balance", { precision: 12, scale: 2 }).notNull().default("0.00"),
  currentRole: varchar("current_role", { length: 10 }).notNull().default("USER"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ordersTable = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  buyerId: uuid("buyer_id").notNull().references(() => usersTable.id),
  kurirId: uuid("kurir_id").references(() => usersTable.id),
  toLocation: varchar("to_location", { length: 500 }).notNull(),
  itemDesc: varchar("item_desc", { length: 1000 }).notNull(),
  itemPrice: numeric("item_price", { precision: 12, scale: 2 }),
  deliveryFee: numeric("delivery_fee", { precision: 12, scale: 2 }).notNull().default("5000.00"),
  status: varchar("status", { length: 20 }).notNull().default("PENDING"),
  securityCode: varchar("security_code", { length: 10 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const transactionsTable = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id),
  orderId: uuid("order_id").references(() => ordersTable.id),
  type: varchar("type", { length: 20 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
