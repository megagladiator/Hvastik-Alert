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
  const codeVerifier = generateCodeVerifier()
  if (typeof window !== 'undefined') {
    localStorage.setItem('pkce_code_verifier', codeVerifier)
  }
  
  // Определяем базовый URL
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://hvostikalert.ru' 
    : 'http://localhost:3000'
  
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/auth/reset-password`,
    codeVerifier
  })
}

// Обмен кода из URL сброса на сессию
export async function exchangeCodeForSession(code: string) {
  const codeVerifier = typeof window !== 'undefined' ? localStorage.getItem('pkce_code_verifier') : null
  if (!codeVerifier) throw new Error('Code verifier missing, please request password reset again.')
  return supabase.auth.exchangeCodeForSession({ code, code_verifier: codeVerifier })
}

// Обновление пароля
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pkce_code_verifier')
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
  return supabase.auth.verifyOtp({
    token_hash: token,
    type: type as any
  })
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
