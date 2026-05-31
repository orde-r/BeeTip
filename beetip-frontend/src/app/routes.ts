export const routes = {
  root: '/',
  onboarding: '/onboarding',
  auth: '/auth',
  buyerHome: '/home',
  kurirHome: '/kurir',
  kurirOrders: '/kurir/orders',
  chats: '/chats',
  createOrder: '/orders/new',
  orderDetail: '/orders/:id',
  orderChat: '/orders/:id/chat',
  orderPayment: '/orders/:id/payment',
  kurirSecurity: '/kurir/orders/:id/security',
  wallet: '/wallet',
  profile: '/profile',
} as const

export function getAuthenticatedEntryPath() {
  return routes.wallet
}
