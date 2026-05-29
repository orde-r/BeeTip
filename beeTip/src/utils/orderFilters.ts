import type { Order } from "../types/order";
import type { OrderStatusFilterValue } from "../component/OrderStatusFilter/OrderStatusFilter";

const ACTIVE_STATUSES = ["PENDING", "ACCEPTED", "PRICED", "PAID"];
const DONE_STATUSES = ["COMPLETED", "CANCELLED"];

export const filterOrdersByStatusGroup = (
  orders: Order[],
  filter: OrderStatusFilterValue,
) => {
  switch (filter) {
    case "ALL":
      return orders;
    case "ACTIVE":
      return orders.filter((order) => ACTIVE_STATUSES.includes(order.status));
    case "DONE":
      return orders.filter((order) => DONE_STATUSES.includes(order.status));
  }
};
