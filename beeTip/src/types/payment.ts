export interface Transaction {
  id: string;
  amount: number;
  type: "DEPOSIT" | "PAYMENT" | "EARNING";
  createdAt: string;
}
