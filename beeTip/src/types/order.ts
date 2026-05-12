import type { OrderItem } from "./orderItem";
import type { OrderStatus } from "./orderStatus";

export interface Order {
  id: string;
  customerId: string;
  courierId: string | null;
  location: string;
  detail: string;
  budgetCap: number;
  status: OrderStatus;
  proposedPrice: number | null;
  itemBreakdown: OrderItem[] | null;
  notaImageUrl: string | null;
  hadDispute: boolean;
  serviceFee: number;
  createdAt: string;
  updatedAt: string;
}
