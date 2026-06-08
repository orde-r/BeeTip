import type { DisputeReason } from "./disputeReason";

export interface OrderItem {
  name: string;
  price: number;
  disputeReason?: DisputeReason;
}
