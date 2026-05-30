import type { OrderStatus } from "./orderStatus";

export interface Order {
  id: string;
  buyerId: string;
  buyerEmail: string | null;
  kurirId: string | null;
  kurirEmail: string | null;
  toLocation: string;
  itemDesc: string;
  itemPrice: number | null;
  receiptImageUrl: string | null;
  deliveryFee: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}
