import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { Restaurant } from '@/supabase/types'

interface AuthState {
  user: User | null
  restaurant: Restaurant | null
  loading: boolean
  setUser: (user: User | null) => void
  setRestaurant: (restaurant: Restaurant | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  restaurant: null,
  loading: true,
  setUser: (user) => set({ user }),
  setRestaurant: (restaurant) => set({ restaurant }),
  setLoading: (loading) => set({ loading }),
}))
