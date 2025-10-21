// Экспорт всех компонентов, хуков и утилит модуля аутентификации

// Компоненты
export { LoginForm, default as LoginFormDefault } from './components/LoginForm'
export { RegisterForm, default as RegisterFormDefault } from './components/RegisterForm'
export { UserList, default as UserListDefault } from './components/UserList'

// Хуки
export { useAuth } from './hooks/use-auth'
export { useUserManagement } from './hooks/use-user-management'

// Сервисы
export { AuthService } from './auth-service'

// Клиенты Supabase
export { 
  createSupabaseClient, 
  createSupabaseAdminClient, 
  createSafeSupabaseAdminClient 
} from './supabase-client'

// Типы
export type { 
  User, 
  UserProfile, 
  AuthSession, 
  LoginCredentials, 
  RegisterData, 
  ResetPasswordData, 
  ChangePasswordData,
  UserFilters,
  AuthConfig,
  AuthError,
  AuthState,
  UserManagementActions
} from './types'

// Конфигурация
export { 
  DEFAULT_AUTH_CONFIG, 
  EMAIL_CONFIG, 
  SECURITY_CONFIG, 
  ROLE_CONFIG, 
  USER_STATUS_CONFIG 
} from './config'












