import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/supabase/client'
import type { MenuCategory, MenuItem } from '@/supabase/types'

export function useCategories(restaurantId?: string) {
  const [categories, setCategories] = useState<MenuCategory[]>([])

  const fetch = useCallback(async () => {
    if (!restaurantId) return
    const { data } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('sort_order')
    setCategories(data || [])
  }, [restaurantId])

  useEffect(() => { fetch() }, [fetch])
  return { categories, refetch: fetch }
}

export function useMenuItems(categoryId?: string) {
  const [items, setItems] = useState<MenuItem[]>([])

  const fetch = useCallback(async () => {
    if (!categoryId) return
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category_id', categoryId)
    setItems(data || [])
  }, [categoryId])

  useEffect(() => { fetch() }, [fetch])
  return { items, refetch: fetch }
}

export function useMenuMutations(restaurantId?: string) {
  async function addCategory(data: { name_ar: string; name_en: string }) {
    await supabase.from('menu_categories').insert({ ...data, restaurant_id: restaurantId, sort_order: 0 })
  }

  async function updateCategory(id: string, data: { name_ar: string; name_en: string }) {
    await supabase.from('menu_categories').update(data).eq('id', id)
  }

  async function deleteCategory(id: string) {
    await supabase.from('menu_categories').delete().eq('id', id)
  }

  async function addItem(data: Partial<MenuItem> & { category_id: string }) {
    await supabase.from('menu_items').insert({ ...data, restaurant_id: restaurantId })
  }

  async function updateItem(id: string, data: Partial<MenuItem>) {
    await supabase.from('menu_items').update(data).eq('id', id)
  }

  async function deleteItem(id: string) {
    await supabase.from('menu_items').delete().eq('id', id)
  }

  async function toggleItemAvailability(id: string, is_available: boolean) {
    await supabase.from('menu_items').update({ is_available }).eq('id', id)
  }

  return { addCategory, updateCategory, deleteCategory, addItem, updateItem, deleteItem, toggleItemAvailability }
}
