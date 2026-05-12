export interface Rating {
  id: string;
  orderId: string;
  raterId: string;
  ratedUserId: string;
  ratedRole: "courier" | "customer";
  score: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
}
