export const routes = {
  root: '/',
  onboarding: '/onboarding',
  auth: '/auth',
  buyerHome: '/home',
  kurirHome: '/kurir',
  kurirOrders: '/kurir/orders',
  orderHistory: '/order-history',
  createOrder: '/orders/new',
  orderDetail: '/orders/:id',
  orderChat: '/orders/:id/chat',
  orderPayment: '/orders/:id/payment',
  wallet: '/wallet',
  profile: '/profile',
} as const

export function getAuthenticatedEntryPath() {
  return routes.buyerHome
}
