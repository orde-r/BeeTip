import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthRedirect } from './AuthRedirect'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { routes } from './routes'
import { AuthPage } from '../pages/AuthPage'
import { BuyerHomePage } from '../pages/BuyerHomePage'
import { ChatPage } from '../pages/ChatPage'
import { ChatInboxPage } from '../pages/ChatInboxPage'
import { CreateOrderPage } from '../pages/CreateOrderPage'
import { KurirHomePage } from '../pages/KurirHomePage'
import { KurirOrderListPage } from '../pages/KurirOrderListPage'
import { KurirSecurityPage } from '../pages/KurirSecurityPage'
import { OnboardingPage } from '../pages/OnboardingPage'
import { OrderDetailPage } from '../pages/OrderDetailPage'
import { PaymentPage } from '../pages/PaymentPage'
import { ProfilePage } from '../pages/ProfilePage'
import { WalletPage } from '../pages/WalletPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={routes.root} element={<AuthRedirect />} />

        <Route element={<PublicRoute redirectAuthenticated />}>
          <Route path={routes.onboarding} element={<OnboardingPage />} />
          <Route path={routes.auth} element={<AuthPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path={routes.buyerHome} element={<BuyerHomePage />} />
          <Route path={routes.kurirHome} element={<KurirHomePage />} />
          <Route path={routes.kurirOrders} element={<KurirOrderListPage />} />
          <Route path={routes.chats} element={<ChatInboxPage />} />
          <Route path={routes.createOrder} element={<CreateOrderPage />} />
          <Route path={routes.orderDetail} element={<OrderDetailPage />} />
          <Route path={routes.orderChat} element={<ChatPage />} />
          <Route path={routes.orderPayment} element={<PaymentPage />} />
          <Route
            path={routes.kurirSecurity}
            element={<KurirSecurityPage />}
          />
          <Route path={routes.wallet} element={<WalletPage />} />
          <Route path={routes.profile} element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to={routes.root} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
