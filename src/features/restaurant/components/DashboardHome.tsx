import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingBag, UtensilsCrossed, QrCode, TrendingUp, Clock } from 'lucide-react'
import { supabase } from '@/supabase/client'
import { useAuthStore } from '@/shared/store/authStore'
import { Card, CardBody } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { formatPrice } from '@/shared/lib/utils'

interface Stats {
  ordersToday: number
  pendingOrders: number
  revenueToday: number
  menuItems: number
}

export function DashboardHome() {
  const { t, i18n } = useTranslation()
  const { restaurant } = useAuthStore()
  const [stats, setStats] = useState<Stats>({ ordersToday: 0, pendingOrders: 0, revenueToday: 0, menuItems: 0 })

  useEffect(() => {
    if (!restaurant) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    Promise.all([
      supabase
        .from('orders')
        .select('id, total_amount, status')
        .eq('restaurant_id', restaurant.id)
        .gte('created_at', today.toISOString()),
      supabase
        .from('menu_items')
        .select('id')
        .eq('restaurant_id', restaurant.id),
    ]).then(([ordersRes, itemsRes]) => {
      const orders = ordersRes.data || []
      const todayRevenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0)
      const pending = orders.filter((o) => o.status === 'pending' || o.status === 'preparing').length
      setStats({
        ordersToday: orders.length,
        pendingOrders: pending,
        revenueToday: todayRevenue,
        menuItems: itemsRes.data?.length || 0,
      })
    })
  }, [restaurant])

  const statsCards = [
    {
      icon: ShoppingBag,
      label: t('dashboard.total_orders_today'),
      value: stats.ordersToday,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Clock,
      label: t('dashboard.pending_orders'),
      value: stats.pendingOrders,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      icon: TrendingUp,
      label: t('dashboard.revenue_today'),
      value: formatPrice(stats.revenueToday),
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: UtensilsCrossed,
      label: t('dashboard.menu_items'),
      value: stats.menuItems,
      color: 'bg-purple-50 text-purple-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('dashboard.welcome')}،{' '}
          {i18n.language === 'ar' ? restaurant?.name_ar : restaurant?.name_en}
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, i) => (
          <Card key={i}>
            <CardBody className="flex flex-col gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardBody>
          <h2 className="font-semibold text-gray-900 mb-4">{t('dashboard.quick_actions')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link to="/dashboard/menu">
              <Button variant="outline" className="w-full gap-2 justify-start">
                <UtensilsCrossed size={18} />
                {t('dashboard.manage_menu')}
              </Button>
            </Link>
            <Link to="/dashboard/orders">
              <Button variant="outline" className="w-full gap-2 justify-start">
                <ShoppingBag size={18} />
                {t('dashboard.view_orders')}
              </Button>
            </Link>
            <Link to="/dashboard/qrcode">
              <Button variant="outline" className="w-full gap-2 justify-start">
                <QrCode size={18} />
                {t('dashboard.get_qr')}
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
