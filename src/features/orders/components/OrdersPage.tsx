import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Volume2, VolumeX, Clock, Car, ChefHat, CheckCircle2, Bell } from 'lucide-react'
import { supabase } from '@/supabase/client'
import { useAuthStore } from '@/shared/store/authStore'
import { useSound } from '@/shared/hooks/useSound'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { Card, CardBody } from '@/shared/components/ui/Card'
import { formatTime, formatPrice } from '@/shared/lib/utils'
import type { Order, OrderStatus } from '@/supabase/types'

type Filter = 'all' | 'pending' | 'preparing' | 'ready'

const statusConfig: Record<OrderStatus, { label: string; badge: 'warning' | 'info' | 'success' | 'default' }> = {
  pending: { label: 'orders.status_pending', badge: 'warning' },
  preparing: { label: 'orders.status_preparing', badge: 'info' },
  ready: { label: 'orders.status_ready', badge: 'success' },
  delivered: { label: 'orders.status_delivered', badge: 'default' },
}

export function OrdersPage() {
  const { t } = useTranslation()
  const { restaurant } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [newOrderAlert, setNewOrderAlert] = useState(false)
  const { playNewOrder, playOrderReady } = useSound()
  const prevOrderIds = useRef<Set<string>>(new Set())

  const fetchOrders = useCallback(async () => {
    if (!restaurant) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('restaurant_id', restaurant.id)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })

    setOrders((data as Order[]) || [])
  }, [restaurant])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    if (!restaurant) return

    const channel = supabase
      .channel(`orders:${restaurant.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurant.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order
            if (!prevOrderIds.current.has(newOrder.id)) {
              prevOrderIds.current.add(newOrder.id)
              if (soundEnabled) playNewOrder()
              setNewOrderAlert(true)
              setTimeout(() => setNewOrderAlert(false), 4000)
              fetchOrders()
            }
          } else if (payload.eventType === 'UPDATE') {
            fetchOrders()
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [restaurant, soundEnabled, playNewOrder, fetchOrders])

  async function updateStatus(orderId: string, status: OrderStatus) {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    if (status === 'ready' && soundEnabled) playOrderReady()
    fetchOrders()
  }

  const filtered = orders.filter((o) => {
    if (filter === 'all') return o.status !== 'delivered'
    return o.status === filter
  })

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t('orders.filter_all') },
    { key: 'pending', label: t('orders.filter_pending') },
    { key: 'preparing', label: t('orders.filter_preparing') },
    { key: 'ready', label: t('orders.filter_ready') },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('orders.title')}</h1>
        <Button
          variant={soundEnabled ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          {soundEnabled ? t('orders.sound_enabled') : t('orders.sound_disabled')}
        </Button>
      </div>

      {/* New order alert */}
      {newOrderAlert && (
        <div className="bg-orange-500 text-white rounded-2xl p-4 flex items-center gap-3 animate-bounce">
          <Bell size={24} className="shrink-0" />
          <p className="font-bold text-lg">{t('orders.new_order')}</p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => {
          const count = f.key === 'all'
            ? orders.filter(o => o.status !== 'delivered').length
            : orders.filter(o => o.status === f.key).length
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f.key ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
              {count > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
                  filter === f.key ? 'bg-white/20' : 'bg-orange-100 text-orange-700'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardBody className="text-center py-16 text-gray-400">
            <ChefHat size={48} className="mx-auto mb-3 opacity-30" />
            {t('orders.no_orders')}
          </CardBody>
        </Card>
      )}

      <div className="space-y-4">
        {filtered.map((order) => {
          const conf = statusConfig[order.status]
          return (
            <Card key={order.id} className={`overflow-hidden ${order.status === 'pending' ? 'border-orange-300 border-2' : ''}`}>
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 text-lg">
                      {t('orders.order_number')}{order.id.slice(-6).toUpperCase()}
                    </p>
                    <Badge variant={conf.badge}>{t(conf.label)}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Clock size={14} />
                    {formatTime(order.created_at)}
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-orange-50 rounded-lg px-3 py-2">
                  <Car size={18} className="text-orange-600 shrink-0" />
                  <span className="font-bold text-gray-900 text-lg tracking-wide">{order.car_plate}</span>
                </div>

                {order.order_items && order.order_items.length > 0 && (
                  <div className="space-y-1.5">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm text-gray-700">
                        <span>{item.item_name} × {item.quantity}</span>
                        <span className="font-medium">{formatPrice(item.unit_price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                      <span>{t('orders.total')}</span>
                      <span className="text-orange-600">{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>
                )}

                {order.notes && (
                  <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                    📝 {order.notes}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  {order.status === 'pending' && (
                    <Button className="flex-1" onClick={() => updateStatus(order.id, 'preparing')}>
                      <ChefHat size={16} />
                      {t('orders.mark_preparing')}
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button variant="success" className="flex-1" onClick={() => updateStatus(order.id, 'ready')}>
                      <CheckCircle2 size={16} />
                      {t('orders.mark_ready')}
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <Button variant="secondary" className="flex-1" onClick={() => updateStatus(order.id, 'delivered')}>
                      <CheckCircle2 size={16} />
                      {t('orders.mark_delivered')}
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
