import { 
  User, 
  AuthSession, 
  LoginCredentials, 
  RegisterData, 
  ResetPasswordData, 
  ChangePasswordData,
  UserFilters,
  AuthError,
  AuthConfig
} from './types'
import { createSupabaseClient, createSupabaseAdminClient } from './supabase-client'
import { DEFAULT_AUTH_CONFIG, SECURITY_CONFIG, ROLE_CONFIG, USER_STATUS_CONFIG } from './config'

export class AuthService {
  private supabase: any
  private adminSupabase: any
  private config: AuthConfig

  constructor(config: AuthConfig = DEFAULT_AUTH_CONFIG) {
    this.config = config
    this.supabase = createSupabaseClient(config)
    this.adminSupabase = createSupabaseAdminClient(config)
  }

  // Аутентификация
  async login(credentials: LoginCredentials): Promise<{ user: User; session: AuthSession }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (error) throw error

      if (!data.user || !data.session) {
        throw new Error('Login failed: No user or session returned')
      }

      // Получаем полную информацию о пользователе
      const user = await this.getUserById(data.user.id)
      
      return {
        user,
        session: {
          user,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at
        }
      }
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  async register(data: RegisterData): Promise<{ user: User; session: AuthSession }> {
    try {
      // Валидация пароля
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      if (data.password.length < SECURITY_CONFIG.passwordMinLength) {
        throw new Error(`Password must be at least ${SECURITY_CONFIG.passwordMinLength} characters`)
      }

      const { data: authData, error } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: data.profile || {}
        }
      })

      if (error) throw error

      if (!authData.user) {
        throw new Error('Registration failed: No user returned')
      }

      // Создаем запись пользователя в базе данных
      const user = await this.createUserRecord({
        id: authData.user.id,
        email: data.email,
        profile: data.profile
      })

      return {
        user,
        session: authData.session ? {
          user,
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_at: authData.session.expires_at
        } : null as any
      }
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  async logout(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) throw error
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${this.config.redirectUrl}/auth/reset-password`
      })
      if (error) throw error
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      if (data.newPassword !== data.confirmPassword) {
        throw new Error('New passwords do not match')
      }

      if (data.newPassword.length < SECURITY_CONFIG.passwordMinLength) {
        throw new Error(`Password must be at least ${SECURITY_CONFIG.passwordMinLength} characters`)
      }

      const { error } = await this.supabase.auth.updateUser({
        password: data.newPassword
      })
      if (error) throw error
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      })
      if (error) throw error
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  // Управление пользователями
  async createUserRecord(userData: { id: string; email: string; profile?: any }): Promise<User> {
    try {
      const isAdmin = this.config.adminEmails?.includes(userData.email) || false
      
      const { data, error } = await this.adminSupabase
        .from('users')
        .insert({
          id: userData.id,
          email: userData.email,
          role: isAdmin ? ROLE_CONFIG.adminRole : ROLE_CONFIG.defaultRole,
          status: SECURITY_CONFIG.requireEmailVerification ? USER_STATUS_CONFIG.pendingStatus : USER_STATUS_CONFIG.activeStatus,
          profile: userData.profile || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const { data, error } = await this.adminSupabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    try {
      const { data, error } = await this.adminSupabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  async getUsers(filters?: UserFilters): Promise<User[]> {
    try {
      let query = this.adminSupabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.email) {
        query = query.eq('email', filters.email)
      }
      if (filters?.role) {
        query = query.eq('role', filters.role)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.search) {
        query = query.or(`email.ilike.%${filters.search}%,profile->first_name.ilike.%${filters.search}%,profile->last_name.ilike.%${filters.search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      const { data, error } = await this.adminSupabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      // Удаляем из Supabase Auth
      const { error: authError } = await this.adminSupabase.auth.admin.deleteUser(id)
      if (authError) throw authError

      // Удаляем из таблицы users
      const { error: dbError } = await this.adminSupabase
        .from('users')
        .delete()
        .eq('id', id)

      if (dbError) throw dbError
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  async verifyUser(id: string): Promise<void> {
    try {
      await this.updateUser(id, { 
        status: USER_STATUS_CONFIG.activeStatus,
        email_verified: true 
      })
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  async suspendUser(id: string): Promise<void> {
    try {
      await this.updateUser(id, { status: USER_STATUS_CONFIG.inactiveStatus })
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  async activateUser(id: string): Promise<void> {
    try {
      await this.updateUser(id, { status: USER_STATUS_CONFIG.activeStatus })
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  // Утилиты
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return null
      return await this.getUserById(user.id)
    } catch (error) {
      return null
    }
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession()
      if (!session) return null

      const user = await this.getUserById(session.user.id)
      return {
        user,
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at
      }
    } catch (error) {
      return null
    }
  }

  isAdmin(user: User): boolean {
    return user.role === ROLE_CONFIG.adminRole || 
           this.config.adminEmails?.includes(user.email) || false
  }

  isActive(user: User): boolean {
    return user.status === USER_STATUS_CONFIG.activeStatus
  }

  private handleAuthError(error: any): AuthError {
    let message = error.message || 'Authentication error'
    
    // Специальная обработка для ошибок регистрации
    if (error.code === 'over_email_send_rate_limit') {
      // Это может быть как лимит email, так и дублирование пользователя
      message = 'Возможно, пользователь уже существует или превышен лимит запросов'
    } else if (error.message?.includes('already registered') || 
               error.message?.includes('User already registered') || 
               error.message?.includes('already been registered') ||
               error.code === 'email_address_already_registered' ||
               error.code === 'user_already_registered') {
      message = 'Пользователь с таким email уже существует'
    } else if (error.message?.includes('Invalid email')) {
      message = 'Неверный формат email'
    } else if (error.message?.includes('Password should be at least')) {
      message = 'Пароль слишком слабый'
    } else if (error.message?.includes('rate limit') || error.message?.includes('Too many requests')) {
      message = 'Слишком много запросов. Попробуйте позже'
    }
    
    return {
      message,
      code: error.code,
      details: error
    }
  }
}


