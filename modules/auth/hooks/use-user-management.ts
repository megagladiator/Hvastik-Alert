import { useState, useEffect, useCallback } from 'react'
import { AuthService } from '../auth-service'
import { 
  User, 
  UserFilters,
  AuthError,
  AuthConfig
} from '../types'
import { DEFAULT_AUTH_CONFIG } from '../config'

export function useUserManagement(config: AuthConfig = DEFAULT_AUTH_CONFIG) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)

  const authService = new AuthService(config)

  // Загрузка пользователей
  const fetchUsers = useCallback(async (filters?: UserFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const usersData = await authService.getUsers(filters)
      setUsers(usersData)
    } catch (err: any) {
      const authError: AuthError = {
        message: err.message || 'Failed to fetch users',
        code: err.code
      }
      setError(authError)
    } finally {
      setLoading(false)
    }
  }, [authService])

  // Создание пользователя
  const createUser = useCallback(async (userData: { email: string; password: string; profile?: any }) => {
    try {
      setLoading(true)
      setError(null)
      
      const newUser = await authService.createUserRecord(userData)
      setUsers(prev => [newUser, ...prev])
      return newUser
    } catch (err: any) {
      const authError: AuthError = {
        message: err.message || 'Failed to create user',
        code: err.code
      }
      setError(authError)
      throw authError
    } finally {
      setLoading(false)
    }
  }, [authService])

  // Обновление пользователя
  const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedUser = await authService.updateUser(id, updates)
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user))
      return updatedUser
    } catch (err: any) {
      const authError: AuthError = {
        message: err.message || 'Failed to update user',
        code: err.code
      }
      setError(authError)
      throw authError
    } finally {
      setLoading(false)
    }
  }, [authService])

  // Удаление пользователя
  const deleteUser = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await authService.deleteUser(id)
      setUsers(prev => prev.filter(user => user.id !== id))
    } catch (err: any) {
      const authError: AuthError = {
        message: err.message || 'Failed to delete user',
        code: err.code
      }
      setError(authError)
      throw authError
    } finally {
      setLoading(false)
    }
  }, [authService])

  // Получение пользователя по ID
  const getUser = useCallback(async (id: string) => {
    try {
      setError(null)
      return await authService.getUserById(id)
    } catch (err: any) {
      const authError: AuthError = {
        message: err.message || 'Failed to get user',
        code: err.code
      }
      setError(authError)
      throw authError
    }
  }, [authService])

  // Верификация пользователя
  const verifyUser = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await authService.verifyUser(id)
      setUsers(prev => prev.map(user => 
        user.id === id 
          ? { ...user, status: 'active' as const, email_verified: true }
          : user
      ))
    } catch (err: any) {
      const authError: AuthError = {
        message: err.message || 'Failed to verify user',
        code: err.code
      }
      setError(authError)
      throw authError
    } finally {
      setLoading(false)
    }
  }, [authService])

  // Блокировка пользователя
  const suspendUser = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await authService.suspendUser(id)
      setUsers(prev => prev.map(user => 
        user.id === id 
          ? { ...user, status: 'inactive' as const }
          : user
      ))
    } catch (err: any) {
      const authError: AuthError = {
        message: err.message || 'Failed to suspend user',
        code: err.code
      }
      setError(authError)
      throw authError
    } finally {
      setLoading(false)
    }
  }, [authService])

  // Активация пользователя
  const activateUser = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await authService.activateUser(id)
      setUsers(prev => prev.map(user => 
        user.id === id 
          ? { ...user, status: 'active' as const }
          : user
      ))
    } catch (err: any) {
      const authError: AuthError = {
        message: err.message || 'Failed to activate user',
        code: err.code
      }
      setError(authError)
      throw authError
    } finally {
      setLoading(false)
    }
  }, [authService])

  // Очистка ошибки
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Обновление списка пользователей
  const refreshUsers = useCallback(async (filters?: UserFilters) => {
    await fetchUsers(filters)
  }, [fetchUsers])

  return {
    // Состояние
    users,
    loading,
    error,
    
    // Методы
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    getUser,
    verifyUser,
    suspendUser,
    activateUser,
    clearError,
    refreshUsers,
    
    // Сервис (для расширенного использования)
    authService
  }
}




