export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered'
export type SubscriptionStatus = 'active' | 'expired' | 'trial'

export interface Restaurant {
  id: string
  owner_id: string
  name_ar: string
  name_en: string
  slug: string
  logo_url: string | null
  theme_color: string
  phone: string | null
  subscription_status: SubscriptionStatus
  subscription_end: string | null
  created_at: string
}

export interface MenuCategory {
  id: string
  restaurant_id: string
  name_ar: string
  name_en: string
  sort_order: number
  is_active: boolean
}

export interface MenuItem {
  id: string
  category_id: string
  restaurant_id: string
  name_ar: string
  name_en: string
  description_ar: string | null
  description_en: string | null
  price: number
  image_url: string | null
  is_available: boolean
}

export interface Order {
  id: string
  restaurant_id: string
  car_plate: string
  customer_phone: string | null
  status: OrderStatus
  total_amount: number
  notes: string | null
  created_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  item_name: string
  quantity: number
  unit_price: number
}

export interface CartItem {
  menu_item_id: string
  name_ar: string
  name_en: string
  quantity: number
  unit_price: number
  image_url: string | null
}
