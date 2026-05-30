import type { OrderStatus } from "./orderStatus";

export interface Order {
  id: string;
  buyer_id: string;
  buyer_email: string | null;
  kurir_id: string | null;
  kurir_email: string | null;
  to_location: string;
  item_desc: string;
  item_price: number | null;
  receipt_image_url: string | null;
  delivery_fee: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}
