import { useState, useEffect, useCallback } from 'react'
import { AuthService } from '../auth-service'
import { 
  User, 
  AuthSession, 
  LoginCredentials, 
  RegisterData, 
  ResetPasswordData, 
  ChangePasswordData,
  AuthState,
  AuthError,
  AuthConfig
} from '../types'
import { DEFAULT_AUTH_CONFIG } from '../config'

export function useAuth(config: AuthConfig = DEFAULT_AUTH_CONFIG) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    isAuthenticated: false
  })

  const authService = new AuthService(config)

  // Инициализация
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const session = await authService.getCurrentSession()
      
      setAuthState({
        user: session?.user || null,
        session: session,
        loading: false,
        error: null,
        isAuthenticated: !!session
      })
    } catch (error: any) {
      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: {
          message: error.message || 'Failed to initialize auth',
          code: error.code
        },
        isAuthenticated: false
      })
    }
  }

  // Методы аутентификации
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const result = await authService.login(credentials)
      
      setAuthState({
        user: result.user,
        session: result.session,
        loading: false,
        error: null,
        isAuthenticated: true
      })
      
      return result
    } catch (error: any) {
      const authError: AuthError = {
        message: error.message || 'Login failed',
        code: error.code
      }
      
      setAuthState(prev => ({ ...prev, loading: false, error: authError }))
      throw authError
    }
  }, [authService])

  const register = useCallback(async (data: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const result = await authService.register(data)
      
      setAuthState({
        user: result.user,
        session: result.session,
        loading: false,
        error: null,
        isAuthenticated: !!result.session
      })
      
      return result
    } catch (error: any) {
      const authError: AuthError = {
        message: error.message || 'Registration failed',
        code: error.code
      }
      
      setAuthState(prev => ({ ...prev, loading: false, error: authError }))
      throw authError
    }
  }, [authService])

  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      await authService.logout()
      
      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
        isAuthenticated: false
      })
    } catch (error: any) {
      const authError: AuthError = {
        message: error.message || 'Logout failed',
        code: error.code
      }
      
      setAuthState(prev => ({ ...prev, loading: false, error: authError }))
      throw authError
    }
  }, [authService])

  const resetPassword = useCallback(async (data: ResetPasswordData) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      await authService.resetPassword(data)
      
      setAuthState(prev => ({ ...prev, loading: false, error: null }))
    } catch (error: any) {
      const authError: AuthError = {
        message: error.message || 'Password reset failed',
        code: error.code
      }
      
      setAuthState(prev => ({ ...prev, loading: false, error: authError }))
      throw authError
    }
  }, [authService])

  const changePassword = useCallback(async (data: ChangePasswordData) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      await authService.changePassword(data)
      
      setAuthState(prev => ({ ...prev, loading: false, error: null }))
    } catch (error: any) {
      const authError: AuthError = {
        message: error.message || 'Password change failed',
        code: error.code
      }
      
      setAuthState(prev => ({ ...prev, loading: false, error: authError }))
      throw authError
    }
  }, [authService])

  const verifyEmail = useCallback(async (token: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      await authService.verifyEmail(token)
      
      // Обновляем информацию о пользователе
      if (authState.user) {
        const updatedUser = await authService.getUserById(authState.user.id)
        setAuthState(prev => ({ 
          ...prev, 
          user: updatedUser,
          loading: false, 
          error: null 
        }))
      } else {
        setAuthState(prev => ({ ...prev, loading: false, error: null }))
      }
    } catch (error: any) {
      const authError: AuthError = {
        message: error.message || 'Email verification failed',
        code: error.code
      }
      
      setAuthState(prev => ({ ...prev, loading: false, error: authError }))
      throw authError
    }
  }, [authService, authState.user])

  // Утилиты
  const isAdmin = useCallback(() => {
    return authState.user ? authService.isAdmin(authState.user) : false
  }, [authState.user, authService])

  const isActive = useCallback(() => {
    return authState.user ? authService.isActive(authState.user) : false
  }, [authState.user, authService])

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }))
  }, [])

  const refreshUser = useCallback(async () => {
    if (!authState.user) return
    
    try {
      const updatedUser = await authService.getUserById(authState.user.id)
      setAuthState(prev => ({ ...prev, user: updatedUser }))
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }, [authState.user, authService])

  return {
    // Состояние
    ...authState,
    
    // Методы
    login,
    register,
    logout,
    resetPassword,
    changePassword,
    verifyEmail,
    
    // Утилиты
    isAdmin: isAdmin(),
    isActive: isActive(),
    clearError,
    refreshUser,
    
    // Сервис (для расширенного использования)
    authService
  }
}




