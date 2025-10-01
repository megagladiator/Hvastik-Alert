/**
 * Утилиты для работы с URL
 */

/**
 * Получает базовый URL из заголовков запроса
 * Работает как на сервере, так и на клиенте
 */
export function getBaseUrl(request?: Request): string {
  // На клиенте
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // Принудительно проверяем продакшен по переменным окружения
  if (process.env.NODE_ENV === 'production') {
    return 'https://hvostikalert.ru'
  }
  
  // Проверяем переменные окружения для продакшена
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes('localhost')) {
    return process.env.NEXTAUTH_URL
  }
  
  // На сервере
  if (request) {
    const origin = request.headers.get('origin') || request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    
    // Проверяем, не localhost ли это
    if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      return `${protocol}://${origin}`
    }
  }
  
  // Fallback для разработки
  return 'http://localhost:3000'
}

/**
 * Получает URL для аутентификации
 */
export function getAuthUrl(path: string, request?: Request): string {
  const baseUrl = getBaseUrl(request)
  return `${baseUrl}${path}`
}

/**
 * Получает все необходимые redirect URLs для Supabase
 */
export function getSupabaseRedirectUrls(request?: Request): string[] {
  const baseUrl = getBaseUrl(request)
  
  return [
    `${baseUrl}/auth/verify-email`,
    `${baseUrl}/auth/reset-password`,
    `${baseUrl}/auth/callback`,
    `${baseUrl}/auth/error`
  ]
}

/**
 * Получает все необходимые redirect URLs для Supabase (включая dev и prod)
 */
export function getAllSupabaseRedirectUrls(): string[] {
  return [
    // Production URLs
    'https://hvostikalert.ru/auth/verify-email',
    'https://hvostikalert.ru/auth/reset-password',
    'https://hvostikalert.ru/auth/callback',
    'https://hvostikalert.ru/auth/error',
    // Development URLs
    'http://localhost:3000/auth/verify-email',
    'http://localhost:3000/auth/reset-password',
    'http://localhost:3000/auth/callback',
    'http://localhost:3000/auth/error'
  ]
}
