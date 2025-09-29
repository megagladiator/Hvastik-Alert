// Типы для системы аутентификации
export interface User {
  id: string
  email: string
  role: 'user' | 'admin'
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  updated_at: string
  last_login?: string
  email_verified?: boolean
  profile?: UserProfile
}

export interface UserProfile {
  first_name?: string
  last_name?: string
  phone?: string
  avatar_url?: string
  bio?: string
}

export interface AuthSession {
  user: User
  access_token: string
  refresh_token: string
  expires_at: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  profile?: Partial<UserProfile>
}

export interface ResetPasswordData {
  email: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UserFilters {
  email?: string
  role?: string
  status?: string
  search?: string
}

export interface AuthConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  supabaseServiceKey?: string
  redirectUrl?: string
  adminEmails?: string[]
}

export interface AuthError {
  message: string
  code?: string
  details?: any
}

export interface AuthState {
  user: User | null
  session: AuthSession | null
  loading: boolean
  error: AuthError | null
  isAuthenticated: boolean
}

export interface UserManagementActions {
  createUser: (data: RegisterData) => Promise<User>
  updateUser: (id: string, data: Partial<User>) => Promise<User>
  deleteUser: (id: string) => Promise<void>
  getUser: (id: string) => Promise<User>
  getUsers: (filters?: UserFilters) => Promise<User[]>
  verifyUser: (id: string) => Promise<void>
  suspendUser: (id: string) => Promise<void>
  activateUser: (id: string) => Promise<void>
}





