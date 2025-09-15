'use client'

import { useSupabaseSession } from './use-supabase-session'

export function useUserRoles() {
  const { session } = useSupabaseSession()
  
  const user = session?.user
  const email = user?.email
  
  // Список администраторов
  const adminEmails = [
    'agentgl007@gmail.com',
    // Добавьте другие email администраторов здесь
  ]
  
  const isAdmin = email ? adminEmails.includes(email) : false
  const isAuthenticated = !!user
  
  return {
    user,
    email,
    isAdmin,
    isAuthenticated,
    userId: user?.id
  }
}
