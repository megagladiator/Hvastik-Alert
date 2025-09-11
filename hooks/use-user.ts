"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

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
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      setUser(null)
      setLoading(false)
      return
    }

    fetchUser()
  }, [session, status])

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
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters?.email) params.append('email', filters.email)
      if (filters?.role) params.append('role', filters.role)
      if (filters?.status) params.append('status', filters.status)

      const response = await fetch(`/api/users?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
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
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
      const response = await fetch(`/api/users?id=${id}`, {
        method: 'DELETE',
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
