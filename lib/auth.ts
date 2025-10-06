import { createClient } from './supabase/client'

// Генерация PKCE code_verifier
export function generateCodeVerifier(len = 128): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  let verifier = ''
  for (let i = 0; i < len; i++) {
    verifier += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return verifier
}

// Регистрация
export async function signUp(email: string, password: string) {
  const supabase = createClient()
  return supabase.auth.signUp({ email, password })
}

// Авторизация с email и паролем
export async function signIn(email: string, password: string) {
  const supabase = createClient()
  return supabase.auth.signInWithPassword({ email, password })
}

// Выход
export async function signOut() {
  const supabase = createClient()
  return supabase.auth.signOut()
}

// Запрос ссылки на сброс пароля (используем signInWithOtp для обхода PKCE)
export async function requestPasswordReset(email: string) {
  console.log('🔍 Forgot password request for:', email)
  
  const supabase = createClient()
  
  // Определяем базовый URL
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://hvostikalert.ru' 
    : 'http://localhost:3000'
  
  console.log('🌐 Base URL for password reset:', baseUrl)
  console.log('🌐 NODE_ENV:', process.env.NODE_ENV)
  
  console.log('📧 Sending password reset email using signInWithOtp...')
  
  // Используем signInWithOtp вместо resetPasswordForEmail для обхода PKCE проблем
  const result = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: `${baseUrl}/auth/callback`,
      shouldCreateUser: false // Не создаем пользователя, только сброс пароля
    }
  })
  
  console.log('📧 Password reset request result:', { email, error: result.error })
  return result
}

// Обмен кода из URL сброса на сессию (правильная обработка magic link токенов)
export async function exchangeCodeForSession(code: string) {
  console.log('Trying exchangeCodeForSession with magic link token...')
  
  const supabase = createClient()
  
  // Для magic link токенов используем exchangeCodeForSession
  const result = await supabase.auth.exchangeCodeForSession({ code })
  
  if (result.error) {
    console.error('❌ Error from exchangeCodeForSession:', result.error)
  } else {
    console.log('✅ exchangeCodeForSession successful')
  }
  
  return result
}

// Обновление пароля
export async function updatePassword(newPassword: string) {
  console.log('🔑 Updating password...')
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  
  if (error) {
    console.error('❌ Error updating password:', error)
    throw error
  }
  
  console.log('✅ Password successfully updated')
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pkce_code_verifier')
    console.log('🧹 Cleaned up code_verifier from localStorage')
  }
}

// Получение текущего пользователя
export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Получение текущей сессии
export async function getCurrentSession() {
  const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// Установка сессии из токенов
export async function setSession(accessToken: string, refreshToken: string) {
  const supabase = createClient()
  return supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  })
}

// Верификация OTP токена
export async function verifyOtp(token: string, type: string) {
  console.log('🔍 Verifying OTP token with type:', type)
  const supabase = createClient()
  const result = await supabase.auth.verifyOtp({
    token_hash: token,
    type: type as any
  })
  
  if (result.error) {
    console.error('❌ Error from verifyOtp:', result.error)
  } else {
    console.log('✅ verifyOtp successful')
  }
  
  return result
}

// Обработка токена восстановления пароля (только проверка, БЕЗ авторизации)
export async function verifyPasswordResetToken(token: string) {
  console.log('🔍 Verifying password reset token (NO SESSION SET)...')
  
  const supabase = createClient()
  
  // Проверяем токен, но НЕ устанавливаем сессию
  const result = await supabase.auth.verifyOtp({
    token_hash: token,
    type: 'recovery'
  })
  
  if (result.error) {
    console.error('❌ Error from verifyPasswordResetToken:', result.error)
  } else {
    console.log('✅ Password reset token verified successfully (but NO session set)')
    
    // ВАЖНО: Принудительно выходим из сессии после проверки токена
    await supabase.auth.signOut()
    console.log('🔒 Forced sign out after token verification')
  }
  
  return result
}

// Получение сессии из URL
export async function getSessionFromUrl() {
  const supabase = createClient()
  return supabase.auth.getSessionFromUrl()
}

// Удаление пользователя (только на стороне сервера с service role ключом)
export async function deleteUser(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.admin.deleteUser(userId)
  if (error) throw error
  return data
}

// Проверка, авторизован ли пользователь
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  const supabase = createClient()
  const session = supabase.auth.getSession()
  return !!session
}

// Очистка code_verifier из localStorage
export function clearCodeVerifier() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pkce_code_verifier')
  }
}

// Получение code_verifier из localStorage
export function getCodeVerifier(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('pkce_code_verifier')
}
