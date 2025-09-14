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
  
  // Хардкод для текущего деплоя (временно)
  if (process.env.VERCEL) {
    return 'https://v0-hvastik-alert-project-jd0w2h2oo-agentgl007-7440s-projects.vercel.app'
  }
  
  // Fallback для разработки
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }
  
  // Fallback для продакшена - используем VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // Последний fallback - используем домен из переменной окружения
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  // Если ничего не найдено, возвращаем localhost
  return 'http://localhost:3000'
}

/**
 * Получает URL для подтверждения email
 */
export function getEmailVerificationUrl(): string {
  return `${getAppBaseUrl()}/auth/verify-email`
}