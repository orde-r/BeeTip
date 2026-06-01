import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthRedirect } from './AuthRedirect'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { routes } from './routes'
import { AuthPage } from '../pages/AuthPage'
import { ChatPage } from '../pages/ChatPage'
import { CreateOrderPage } from '../pages/CreateOrderPage'
import { HomePage } from '../pages/HomePage'
import { KurirOrderListPage } from '../pages/KurirOrderListPage'
import { OnboardingPage } from '../pages/OnboardingPage'
import { OrderDetailPage } from '../pages/OrderDetailPage'
import { OrderHistoryPage } from '../pages/OrderHistoryPage'
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
          <Route path={routes.buyerHome} element={<HomePage />} />
          <Route
            path={routes.kurirHome}
            element={<HomePage defaultMode="kurir" />}
          />
          <Route path={routes.kurirOrders} element={<KurirOrderListPage />} />
          <Route path={routes.orderHistory} element={<OrderHistoryPage />} />
          <Route
            path="/chats"
            element={<Navigate to={routes.orderHistory} replace />}
          />
          <Route path={routes.createOrder} element={<CreateOrderPage />} />
          <Route path={routes.orderDetail} element={<OrderDetailPage />} />
          <Route path={routes.orderChat} element={<ChatPage />} />
          <Route path={routes.orderPayment} element={<PaymentPage />} />
          <Route path={routes.wallet} element={<WalletPage />} />
          <Route path={routes.profile} element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to={routes.root} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
