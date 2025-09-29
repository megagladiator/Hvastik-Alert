import { AuthConfig } from './types'

// Конфигурация по умолчанию
export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  redirectUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  adminEmails: ['agentgl007@gmail.com'] // Администраторы по умолчанию
}

// Настройки email верификации
export const EMAIL_CONFIG = {
  verificationUrl: '/auth/verify-email',
  resetPasswordUrl: '/auth/reset-password',
  redirectAfterVerification: '/cabinet',
  redirectAfterLogin: '/cabinet',
  redirectAfterLogout: '/'
}

// Настройки безопасности
export const SECURITY_CONFIG = {
  passwordMinLength: 6,
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 часа
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 минут
  requireEmailVerification: true
}

// Настройки ролей
export const ROLE_CONFIG = {
  defaultRole: 'user' as const,
  adminRole: 'admin' as const,
  userRole: 'user' as const
}

// Настройки статусов пользователей
export const USER_STATUS_CONFIG = {
  defaultStatus: 'pending' as const,
  activeStatus: 'active' as const,
  inactiveStatus: 'inactive' as const,
  pendingStatus: 'pending' as const
}





