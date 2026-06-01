import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Car, FileText, Phone } from 'lucide-react'
import { supabase } from '@/supabase/client'
import { useCartStore } from '@/shared/store/cartStore'
import { Button } from '@/shared/components/ui/Button'
import { Card, CardBody } from '@/shared/components/ui/Card'
import { formatPrice } from '@/shared/lib/utils'

export function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { items, total, clearCart } = useCartStore()
  const [carPlate, setCarPlate] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isAr = i18n.language === 'ar'

  async function placeOrder() {
    if (!carPlate.trim()) { setError(t('customer.required_field')); return }
    setLoading(true)
    setError('')

    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!restaurant) { setLoading(false); setError(t('common.error')); return }

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        restaurant_id: restaurant.id,
        car_plate: carPlate.trim().toUpperCase(),
        customer_phone: phone || null,
        notes: notes || null,
        total_amount: total(),
        status: 'pending',
      })
      .select()
      .single()

    if (orderErr || !order) { setLoading(false); setError(t('common.error')); return }

    const orderItemsData = items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      item_name: isAr ? item.name_ar : item.name_en,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }))

    await supabase.from('order_items').insert(orderItemsData)
    clearCart()
    navigate(`/menu/${slug}/order/${order.id}`)
  }

  if (items.length === 0) {
    navigate(`/menu/${slug}`)
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
            <ArrowRight size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">{t('customer.checkout')}</h1>
        </div>

        {/* Order summary */}
        <Card>
          <CardBody className="space-y-3">
            <h2 className="font-semibold text-gray-900">{t('customer.order_summary')}</h2>
            {items.map((item) => (
              <div key={item.menu_item_id} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {isAr ? item.name_ar : item.name_en} × {item.quantity}
                </span>
                <span className="font-medium">{formatPrice(item.unit_price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-2 border-t border-gray-100">
              <span>{t('customer.total')}</span>
              <span className="text-orange-600 text-lg">{formatPrice(total())}</span>
            </div>
          </CardBody>
        </Card>

        {/* Customer info */}
        <Card>
          <CardBody className="space-y-4">
            <h2 className="font-semibold text-gray-900">{t('customer.car_plate')}</h2>

            <div className="relative">
              <Car size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
              <input
                type="text"
                value={carPlate}
                onChange={(e) => setCarPlate(e.target.value)}
                placeholder={t('customer.car_plate_placeholder')}
                className="w-full rounded-lg border border-gray-300 bg-white ps-10 pe-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono uppercase text-lg tracking-widest text-center"
              />
            </div>

            <div className="relative">
              <Phone size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('customer.phone')}
                className="w-full rounded-lg border border-gray-300 bg-white ps-10 pe-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="relative">
              <FileText size={18} className="absolute start-3 top-3 text-gray-400 z-10" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('customer.notes')}
                rows={2}
                className="w-full rounded-lg border border-gray-300 bg-white ps-10 pe-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button
              onClick={placeOrder}
              loading={loading}
              className="w-full"
              size="lg"
            >
              {loading ? t('customer.placing_order') : t('customer.place_order')}
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
