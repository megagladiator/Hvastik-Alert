import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Получает базовый URL приложения в зависимости от окружения
 */
export function getAppBaseUrl(): string {
  // В браузере
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // На сервере - используем переменные окружения
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  
  // Fallback для разработки
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }
  
  // Fallback для продакшена (если не указан NEXTAUTH_URL)
  return 'https://your-domain.vercel.app'
}

/**
 * Получает URL для подтверждения email
 */
export function getEmailVerificationUrl(): string {
  return `${getAppBaseUrl()}/auth/verify`
}