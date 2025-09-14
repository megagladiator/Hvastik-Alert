"use client"

import { useState, useEffect } from 'react'
import { useSupabaseSession } from './use-supabase-session'
import { supabase } from '@/lib/supabase'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive' | 'banned'
  emailVerified: boolean
  createdAt: Date
  lastLoginAt: Date | null
}

export interface UserFilters {
  email?: string
  role?: string
  status?: string
}

export function useUser() {
  const { user: supabaseUser, loading: authLoading, isAuthenticated } = useSupabaseSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !supabaseUser) {
      setUser(null)
      setLoading(false)
      return
    }

    fetchUser()
  }, [supabaseUser, authLoading, isAuthenticated])

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/users/me')
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }

      const data = await response.json()
      setUser(data.user)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching user:', err)
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = user?.role === 'admin'
  const isActive = user?.status === 'active'

  return {
    user,
    loading,
    error,
    isAdmin,
    isActive,
    refetch: fetchUser
  }
}

export function useUsers(filters?: UserFilters) {
  const { user: supabaseUser, loading: authLoading, isAuthenticated } = useSupabaseSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    
    if (!isAuthenticated || !supabaseUser) {
      setUsers([])
      setLoading(false)
      return
    }

    fetchUsers()
  }, [filters, supabaseUser, authLoading, isAuthenticated])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      // Получаем токен из Supabase
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Session in useUsers:', session)
      if (!session?.access_token) {
        console.error('No access token available in useUsers')
        throw new Error('No access token available')
      }

      const params = new URLSearchParams()
      if (filters?.email) params.append('email', filters.email)
      if (filters?.role) params.append('role', filters.role)
      if (filters?.status) params.append('status', filters.status)

      console.log('Making API request to:', `/api/users?${params.toString()}`)
      console.log('With token:', session.access_token.substring(0, 20) + '...')
      
      const response = await fetch(`/api/users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      console.log('API response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error response:', errorText)
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      console.log('API response data:', data)
      setUsers(data.users)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (userData: Partial<User>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No access token available')
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create user')
      }

      const data = await response.json()
      await fetchUsers() // Обновляем список
      return data.user
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No access token available')
      }

      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id, ...userData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user')
      }

      const data = await response.json()
      await fetchUsers() // Обновляем список
      return data.user
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteUser = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No access token available')
      }

      const response = await fetch(`/api/users?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete user')
      }

      await fetchUsers() // Обновляем список
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deleteUser
  }
}
