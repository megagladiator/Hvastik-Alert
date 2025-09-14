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
  
  // Fallback для продакшена - используем Vercel домен
  return 'https://v0-hvastik-alert-project-git-main-agentgl007-7440s-projects.vercel.app'
}

/**
 * Получает URL для подтверждения email
 */
export function getEmailVerificationUrl(): string {
  // Хардкод для продакшена, пока не исправим проблему с переменными
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    return 'https://v0-hvastik-alert-project-git-main-agentgl007-7440s-projects.vercel.app/auth/verify-email'
  }
  
  return `${getAppBaseUrl()}/auth/verify-email`
}