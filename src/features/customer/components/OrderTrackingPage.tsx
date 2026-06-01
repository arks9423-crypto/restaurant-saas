import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Clock, ChefHat, PartyPopper } from 'lucide-react'
import { supabase } from '@/supabase/client'
import { useSound } from '@/shared/hooks/useSound'
import { Card, CardBody } from '@/shared/components/ui/Card'
import { formatPrice } from '@/shared/lib/utils'
import type { Order } from '@/supabase/types'

export function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { t } = useTranslation()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [notified, setNotified] = useState(false)
  const { playOrderReady } = useSound()

  useEffect(() => {
    if (!orderId) return

    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single()
      .then(({ data }) => {
        setOrder(data as Order)
        setLoading(false)
      })

    const channel = supabase
      .channel(`order:${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          const updated = payload.new as Order
          setOrder((prev) => prev ? { ...prev, ...updated } : null)
          if (updated.status === 'ready' && !notified) {
            setNotified(true)
            playOrderReady()
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orderId, notified, playOrderReady])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const isReady = order?.status === 'ready'
  const isPreparing = order?.status === 'preparing'

  const steps = [
    { key: 'pending', icon: Clock, label: t('orders.status_pending'), done: true },
    { key: 'preparing', icon: ChefHat, label: t('orders.status_preparing'), done: isPreparing || isReady },
    { key: 'ready', icon: CheckCircle2, label: t('orders.status_ready'), done: isReady },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">

        {/* Ready banner */}
        {isReady && (
          <div className="bg-green-500 text-white rounded-3xl p-6 text-center animate-pulse">
            <PartyPopper size={48} className="mx-auto mb-2" />
            <h2 className="text-2xl font-bold">{t('customer.order_ready')}</h2>
            <p className="mt-1 text-green-100 text-lg">
              {t('customer.order_ready_message')}: <span className="font-bold">{order?.car_plate}</span>
            </p>
          </div>
        )}

        {!isReady && (
          <Card>
            <CardBody className="text-center py-8 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full">
                <ChefHat size={32} className="text-orange-600 animate-bounce" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t('customer.order_placed')}</h2>
                <p className="text-gray-500 mt-1">{t('customer.waiting_message')}</p>
              </div>
              <div className="bg-orange-50 rounded-xl px-6 py-3 inline-block">
                <p className="text-2xl font-bold tracking-widest text-gray-900">{order?.car_plate}</p>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Status steps */}
        <Card>
          <CardBody>
            <div className="flex justify-between relative">
              <div className="absolute top-4 start-12 end-12 h-0.5 bg-gray-200" />
              {steps.map((step) => (
                <div key={step.key} className="flex flex-col items-center gap-2 z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      step.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <step.icon size={16} />
                  </div>
                  <span className="text-xs text-gray-500 text-center max-w-16">{step.label}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Order items */}
        {order?.order_items && order.order_items.length > 0 && (
          <Card>
            <CardBody className="space-y-2">
              <h3 className="font-semibold text-gray-900">{t('customer.order_summary')}</h3>
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-gray-700">
                  <span>{item.item_name} × {item.quantity}</span>
                  <span>{formatPrice(item.unit_price * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-2 border-t border-gray-100">
                <span>{t('customer.total')}</span>
                <span className="text-orange-600">{formatPrice(order.total_amount)}</span>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  )
}
