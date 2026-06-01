import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/supabase/types'

interface CartState {
  items: CartItem[]
  restaurantSlug: string | null
  addItem: (item: CartItem) => void
  removeItem: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, quantity: number) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantSlug: null,

      addItem: (item) => {
        const existing = get().items.find((i) => i.menu_item_id === item.menu_item_id)
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.menu_item_id === item.menu_item_id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          })
        } else {
          set({ items: [...get().items, item] })
        }
      },

      removeItem: (menuItemId) => {
        set({ items: get().items.filter((i) => i.menu_item_id !== menuItemId) })
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.menu_item_id === menuItemId ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ items: [], restaurantSlug: null }),

      total: () =>
        get().items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
    }),
    { name: 'munyu-cart' }
  )
)
