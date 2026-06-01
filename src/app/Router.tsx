import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

const DashboardLayout = lazy(() => import('./layouts/DashboardLayout').then(m => ({ default: m.DashboardLayout })))
const LoginPage = lazy(() => import('@/features/auth/components/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/features/auth/components/RegisterPage').then(m => ({ default: m.RegisterPage })))
const DashboardHome = lazy(() => import('@/features/restaurant/components/DashboardHome').then(m => ({ default: m.DashboardHome })))
const MenuPage = lazy(() => import('@/features/menu/components/MenuPage').then(m => ({ default: m.MenuPage })))
const QRCodePage = lazy(() => import('@/features/qrcode/components/QRCodePage').then(m => ({ default: m.QRCodePage })))
const OrdersPage = lazy(() => import('@/features/orders/components/OrdersPage').then(m => ({ default: m.OrdersPage })))
const SettingsPage = lazy(() => import('@/features/restaurant/components/SettingsPage').then(m => ({ default: m.SettingsPage })))
const CustomerMenuPage = lazy(() => import('@/features/customer/components/CustomerMenuPage').then(m => ({ default: m.CustomerMenuPage })))
const CheckoutPage = lazy(() => import('@/features/customer/components/CheckoutPage').then(m => ({ default: m.CheckoutPage })))
const OrderTrackingPage = lazy(() => import('@/features/customer/components/OrderTrackingPage').then(m => ({ default: m.OrderTrackingPage })))
const LandingPage = lazy(() => import('@/features/subscription/components/LandingPage').then(m => ({ default: m.LandingPage })))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/menu/:slug" element={<CustomerMenuPage />} />
          <Route path="/menu/:slug/checkout" element={<CheckoutPage />} />
          <Route path="/menu/:slug/order/:orderId" element={<OrderTrackingPage />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="qrcode" element={<QRCodePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
