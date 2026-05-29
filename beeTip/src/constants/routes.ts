export const ROUTES = {
  HOME: "/home",
  LANDING: "/",
  AUTH: "/auth",
  ORDERS: "/orders",
  CHAT: "/chat",
  CHAT_DETAIL: "/chat/:orderId",
  PROFILE: "/profile",
} as const;

export const getChatRoute = (orderId: string) => `${ROUTES.CHAT}/${orderId}`;
