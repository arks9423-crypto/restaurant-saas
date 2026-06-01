import { useState } from 'react'
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag, QrCode,
  Settings, LogOut, Menu, Globe
} from 'lucide-react'
import { useAuthStore } from '@/shared/store/authStore'
import { logout } from '@/features/auth/hooks/useAuth'
import { setLanguage } from '@/shared/lib/i18n'
import { cn } from '@/shared/lib/utils'

export function DashboardLayout() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const { user, restaurant, loading } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/dashboard/menu', icon: UtensilsCrossed, label: t('nav.menu') },
    { to: '/dashboard/orders', icon: ShoppingBag, label: t('nav.orders') },
    { to: '/dashboard/qrcode', icon: QrCode, label: t('nav.qrcode') },
    { to: '/dashboard/settings', icon: Settings, label: t('nav.settings') },
  ]

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {restaurant?.logo_url ? (
            <img src={restaurant.logo_url} className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ background: restaurant?.theme_color || '#f97316' }}
            >
              {(restaurant?.name_ar || restaurant?.name_en || 'R')[0]}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {i18n.language === 'ar' ? restaurant?.name_ar : restaurant?.name_en}
            </p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.to ||
            (item.to !== '/dashboard' && location.pathname.startsWith(item.to))
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-1">
        <button
          onClick={() => setLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Globe size={20} />
          {i18n.language === 'ar' ? 'English' : 'العربية'}
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          {t('nav.logout')}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-e border-gray-200 fixed inset-y-0 start-0 z-30">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col w-64 bg-white z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ms-64">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} className="text-gray-700" />
          </button>
          <span className="font-semibold text-gray-900">
            {i18n.language === 'ar' ? restaurant?.name_ar : restaurant?.name_en}
          </span>
          <div className="w-6" />
        </div>

        <main className="p-4 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
