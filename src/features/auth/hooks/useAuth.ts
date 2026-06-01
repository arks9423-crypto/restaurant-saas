import { useEffect } from 'react'
import { supabase } from '@/supabase/client'
import { useAuthStore } from '@/shared/store/authStore'
import type { Restaurant } from '@/supabase/types'

export function useAuthInit() {
  const { setUser, setRestaurant, setLoading } = useAuthStore()

  useEffect(() => {
    // 3-second timeout so the app never hangs on slow connections
    const timeout = setTimeout(() => setLoading(false), 3000)

    supabase.auth.getSession().then(async ({ data }) => {
      clearTimeout(timeout)
      setUser(data.session?.user ?? null)
      if (data.session?.user) {
        const { data: r } = await supabase
          .from('restaurants')
          .select('*')
          .eq('owner_id', data.session.user.id)
          .single()
        setRestaurant(r as Restaurant | null)
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: r } = await supabase
          .from('restaurants')
          .select('*')
          .eq('owner_id', session.user.id)
          .single()
        setRestaurant(r as Restaurant | null)
      } else {
        setRestaurant(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [setUser, setRestaurant, setLoading])
}

export async function logout() {
  await supabase.auth.signOut()
}
