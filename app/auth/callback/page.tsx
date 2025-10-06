"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [error, setError] = useState<string>('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    console.log('Auth Callback Page - Processing redirect...')
    console.log('Full URL:', window.location.href)
    console.log('Search params:', window.location.search)
    console.log('Hash:', window.location.hash)
    
    // КРИТИЧЕСКИ ВАЖНО: Принудительно выходим из сессии в самом начале!
    // Это предотвращает автоматическую авторизацию при переходе по ссылке
    const forceSignOut = async () => {
      console.log('🔒 FORCING SIGN OUT in callback to prevent auto-authentication...')
      try {
        await supabase.auth.signOut()
        console.log('✅ Forced sign out in callback completed')
      } catch (error) {
        console.error('❌ Error during forced sign out in callback:', error)
      }
    }
    
    forceSignOut()
    
    // Проверяем наличие ошибок в URL
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    
    if (errorParam) {
      console.error('Error in callback:', errorParam, errorDescription)
      setError(errorDescription || errorParam)
      setStatus('error')
      return
    }
    
    // Проверяем наличие токенов в hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    
    if (accessToken && refreshToken) {
      console.log('Found tokens in hash, redirecting to reset password...')
      // Перенаправляем на страницу сброса пароля с токенами в hash
      router.push('/auth/reset-password' + window.location.hash)
      return
    }
    
    // Проверяем наличие кода в query параметрах (OTP flow)
    const code = searchParams.get('code')
    if (code) {
      console.log('Found OTP code in query params, redirecting to reset password...')
      console.log('Code length:', code.length)
      console.log('Code preview:', code.substring(0, 20) + '...')
      // Перенаправляем на страницу сброса пароля с кодом
      router.push('/auth/reset-password?code=' + encodeURIComponent(code))
      return
    }
    
    // Если ничего не найдено, показываем ошибку
    console.error('No valid auth parameters found in callback')
    setError('Не удалось обработать ссылку для сброса пароля')
    setStatus('error')
  }, [searchParams, router])

  if (status === 'processing') {
    return (
      <div className="max-w-md w-full mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-blue-600 text-4xl mb-4">⏳</div>
          <h2 className="text-xl font-bold mb-4 text-blue-600">Обработка ссылки...</h2>
          <p className="text-gray-600 mb-6">
            Проверяем ссылку для сброса пароля
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          
          {/* Debug информация */}
          <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-left">
            <div><strong>URL:</strong> {window.location.href}</div>
            <div><strong>Search:</strong> {window.location.search}</div>
            <div><strong>Hash:</strong> {window.location.hash}</div>
            <div><strong>Error:</strong> {searchParams.get('error') || 'None'}</div>
            <div><strong>Code:</strong> {searchParams.get('code') ? 'Found' : 'Not found'}</div>
            <div><strong>Access Token:</strong> {new URLSearchParams(window.location.hash.substring(1)).get('access_token') ? 'Found' : 'Not found'}</div>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="max-w-md w-full mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-4 text-red-600">Ошибка обработки</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="space-y-3">
            <Link 
              href="/auth/forgot-password" 
              className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded text-center"
            >
              Запросить новую ссылку
            </Link>
            
            <Link 
              href="/auth" 
              className="block w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-center"
            >
              Вернуться к входу
            </Link>
            
            <Link 
              href="/debug-password-reset" 
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-center"
            >
              🔍 Debug информация
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <div className="text-green-600 text-4xl mb-4">✅</div>
        <h2 className="text-xl font-bold mb-4 text-green-600">Успешно!</h2>
        <p className="text-gray-600 mb-6">
          Ссылка обработана успешно. Перенаправляем...
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
      </div>
    </div>
  )
}