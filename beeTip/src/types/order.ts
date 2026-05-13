import type { OrderItem } from "./orderItem";
import type { OrderStatus } from "./orderStatus";
import type { User } from "./user";

export interface Order {
  id: string;
  customer: User;
  courier: User | null;
  location: string;
  detail: string;
  budgetCap: number;
  status: OrderStatus;
  proposedPrice: number | null;
  itemBreakdown: OrderItem[] | null;
  receiptImageUrl: string | null;
  hadDispute: boolean;
  serviceFee: number;
  createdAt: string;
  updatedAt: string;
}
