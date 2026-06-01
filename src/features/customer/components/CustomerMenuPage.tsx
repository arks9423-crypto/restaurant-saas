import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, Plus, Minus, Image, ChevronRight } from 'lucide-react'
import { supabase } from '@/supabase/client'
import { useCartStore } from '@/shared/store/cartStore'
import { formatPrice } from '@/shared/lib/utils'
import type { Restaurant, MenuCategory, MenuItem } from '@/supabase/types'

export function CustomerMenuPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { items: cartItems, addItem, updateQuantity, total } = useCartStore()

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMenu = useCallback(async () => {
    if (!slug) return
    const { data: rest } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!rest) { setLoading(false); return }
    setRestaurant(rest as Restaurant)
    document.title = i18n.language === 'ar' ? rest.name_ar : rest.name_en

    const { data: cats } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('restaurant_id', rest.id)
      .eq('is_active', true)
      .order('sort_order')

    const { data: items } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', rest.id)
      .eq('is_available', true)

    setCategories(cats || [])
    setMenuItems(items || [])
    if (cats && cats.length > 0) setActiveCategory(cats[0].id)
    setLoading(false)
  }, [slug, i18n.language])

  useEffect(() => { fetchMenu() }, [fetchMenu])

  const isAr = i18n.language === 'ar'
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0)
  const displayedItems = menuItems.filter((i) => i.category_id === activeCategory)

  function getCartQty(itemId: string) {
    return cartItems.find((c) => c.menu_item_id === itemId)?.quantity || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">{t('common.error')}</p>
      </div>
    )
  }

  const themeColor = restaurant.theme_color || '#f97316'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        <div
          className="h-2"
          style={{ background: themeColor }}
        />
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ background: themeColor }}
              >
                {(restaurant.name_ar || restaurant.name_en)[0]}
              </div>
            )}
            <div>
              <h1 className="font-bold text-gray-900">{isAr ? restaurant.name_ar : restaurant.name_en}</h1>
              <p className="text-xs text-gray-400">{t('customer.menu_title')}</p>
            </div>
          </div>

          {cartCount > 0 && (
            <button
              onClick={() => navigate(`/menu/${slug}/checkout`)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium text-sm"
              style={{ background: themeColor }}
            >
              <ShoppingCart size={18} />
              {t('customer.cart')}
              <span className="bg-white text-gray-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {cartCount}
              </span>
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 max-w-2xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
              style={
                activeCategory === cat.id
                  ? { background: themeColor, color: 'white' }
                  : { background: '#f3f4f6', color: '#4b5563' }
              }
            >
              {isAr ? cat.name_ar : cat.name_en}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="max-w-2xl mx-auto px-4 py-4 pb-32 space-y-3">
        {displayedItems.map((item) => {
          const qty = getCartQty(item.id)
          return (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm flex">
              {item.image_url ? (
                <img src={item.image_url} className="w-24 h-24 object-cover shrink-0" />
              ) : (
                <div className="w-24 h-24 bg-gray-100 flex items-center justify-center shrink-0">
                  <Image size={24} className="text-gray-300" />
                </div>
              )}
              <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{isAr ? item.name_ar : item.name_en}</p>
                  {(isAr ? item.description_ar : item.description_en) && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                      {isAr ? item.description_ar : item.description_en}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-sm" style={{ color: themeColor }}>
                    {formatPrice(item.price)}
                  </span>
                  {qty === 0 ? (
                    <button
                      onClick={() => addItem({
                        menu_item_id: item.id,
                        name_ar: item.name_ar,
                        name_en: item.name_en,
                        quantity: 1,
                        unit_price: item.price,
                        image_url: item.image_url,
                      })}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-sm font-medium"
                      style={{ background: themeColor }}
                    >
                      <Plus size={14} />
                      {t('customer.add_to_cart')}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, qty - 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                        style={{ background: themeColor }}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-gray-900 w-5 text-center">{qty}</span>
                      <button
                        onClick={() => addItem({
                          menu_item_id: item.id,
                          name_ar: item.name_ar,
                          name_en: item.name_en,
                          quantity: 1,
                          unit_price: item.price,
                          image_url: item.image_url,
                        })}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                        style={{ background: themeColor }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Sticky cart button */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 max-w-2xl mx-auto">
          <button
            onClick={() => navigate(`/menu/${slug}/checkout`)}
            className="w-full flex items-center justify-between px-6 py-4 rounded-2xl text-white font-bold text-base"
            style={{ background: themeColor }}
          >
            <div className="flex items-center gap-2">
              <span className="bg-white/20 rounded-lg px-2 py-0.5 text-sm">{cartCount}</span>
              <span>{t('customer.checkout')}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{formatPrice(total())}</span>
              <ChevronRight size={20} />
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
