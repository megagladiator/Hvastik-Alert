import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useSupabaseSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Получаем текущую сессию
    const getSession = async () => {
      if (!supabase) {
        console.warn('Supabase client not initialized')
        setLoading(false)
        return
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        } else {
          setSession(session)
          setUser(session?.user || null)
        }
      } catch (error) {
        console.error('Failed to fetch session:', error)
      }
      
      setLoading(false)
    }

    getSession()

    // Слушаем изменения аутентификации
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session)
          setSession(session)
          setUser(session?.user || null)
          setLoading(false)
        }
      )

      return () => {
        subscription?.unsubscribe()
      }
    }
  }, [])

  return {
    session,
    user,
    loading,
    isAuthenticated: !!user
  }
}
