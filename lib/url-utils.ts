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
  
  // На сервере
  if (request) {
    const origin = request.headers.get('origin') || request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    return `${protocol}://${origin}`
  }
  
  // Fallback для разработки
  return process.env.NEXTAUTH_URL || 'http://localhost:3000'
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
