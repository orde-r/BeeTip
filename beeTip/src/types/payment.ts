export interface Transaction {
  id: string;
  orderId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  type: "ORDER_PAYMENT" | "TOP_UP";
  createdAt: string;
}
