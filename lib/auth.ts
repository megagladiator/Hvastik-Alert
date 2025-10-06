import { supabase } from './supabase'

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
  return supabase.auth.signUp({ email, password })
}

// Авторизация с email и паролем
export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

// Выход
export async function signOut() {
  return supabase.auth.signOut()
}

// Запрос ссылки на сброс пароля (с сохранением code_verifier)
export async function requestPasswordReset(email: string) {
  console.log('🔍 Forgot password request for:', email)
  
  const codeVerifier = generateCodeVerifier()
  console.log('🔑 Generated code_verifier:', codeVerifier.substring(0, 10) + '...')
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('pkce_code_verifier', codeVerifier)
    console.log('💾 Saved to localStorage')
  }
  
  // Определяем базовый URL
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://hvostikalert.ru' 
    : 'http://localhost:3000'
  
  console.log('📧 Sending password reset email...')
  const result = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/auth/reset-password`,
    codeVerifier
  })
  
  console.log('📧 Password reset request result:', { email, error: result.error })
  return result
}

// Обмен кода из URL сброса на сессию
export async function exchangeCodeForSession(code: string) {
  const codeVerifier = typeof window !== 'undefined' ? localStorage.getItem('pkce_code_verifier') : null
  console.log('🔑 Code verifier from localStorage:', codeVerifier ? 'found' : 'not found')
  
  if (!codeVerifier) {
    throw new Error('Code verifier missing, please request password reset again.')
  }
  
  console.log('Trying exchangeCodeForSession with code_verifier...')
  const result = await supabase.auth.exchangeCodeForSession({ code, code_verifier: codeVerifier })
  
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
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Получение текущей сессии
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// Установка сессии из токенов
export async function setSession(accessToken: string, refreshToken: string) {
  return supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  })
}

// Верификация OTP токена
export async function verifyOtp(token: string, type: string) {
  console.log('🔍 Verifying OTP token with type:', type)
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

// Обработка токена восстановления пароля (не PKCE)
export async function verifyPasswordResetToken(token: string) {
  console.log('🔍 Verifying password reset token...')
  const result = await supabase.auth.verifyOtp({
    token_hash: token,
    type: 'recovery'
  })
  
  if (result.error) {
    console.error('❌ Error from verifyPasswordResetToken:', result.error)
  } else {
    console.log('✅ Password reset token verified successfully')
  }
  
  return result
}

// Получение сессии из URL
export async function getSessionFromUrl() {
  return supabase.auth.getSessionFromUrl()
}

// Удаление пользователя (только на стороне сервера с service role ключом)
export async function deleteUser(userId: string) {
  const { data, error } = await supabase.auth.admin.deleteUser(userId)
  if (error) throw error
  return data
}

// Проверка, авторизован ли пользователь
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
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
