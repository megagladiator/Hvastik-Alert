"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { verifyOtp, verifyPasswordResetToken } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export default function VerifyPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [error, setError] = useState<string>('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    console.log('Auth Verify Page - Processing token...')
    console.log('Full URL:', window.location.href)
    console.log('Search params:', window.location.search)
    console.log('Hash:', window.location.hash)
    
    // КРИТИЧЕСКИ ВАЖНО: Принудительно выходим из сессии в самом начале!
    // Это предотвращает автоматическую авторизацию при переходе по ссылке
    const forceSignOut = async () => {
      console.log('🔒 FORCING SIGN OUT to prevent auto-authentication...')
      try {
        await supabase.auth.signOut()
        console.log('✅ Forced sign out completed')
      } catch (error) {
        console.error('❌ Error during forced sign out:', error)
      }
    }
    
    forceSignOut()
    
    // Проверяем все возможные источники токена
    const token = searchParams.get('token') || new URLSearchParams(window.location.hash.substring(1)).get('token')
    const type = searchParams.get('type') || new URLSearchParams(window.location.hash.substring(1)).get('type')
    const redirectTo = searchParams.get('redirect_to') || new URLSearchParams(window.location.hash.substring(1)).get('redirect_to')
    
    console.log('Extracted params:', { token, type, redirectTo })
    
    if (!token) {
      console.error('No token found in URL or hash')
      setError('Токен отсутствует в ссылке')
      setStatus('error')
      return
    }
    
    if (!type) {
      console.error('No type found in URL or hash')
      setError('Тип токена отсутствует в ссылке')
      setStatus('error')
      return
    }
    
    // Обрабатываем токен
    handleTokenVerification(token, type, redirectTo)
  }, [searchParams, router])

  const handleTokenVerification = async (token: string, type: string, redirectTo: string | null) => {
    try {
      console.log('Verifying token with type:', type)
      console.log('Token length:', token.length)
      console.log('Token preview:', token.substring(0, 20) + '...')
      
      let result
      if (type === 'recovery') {
        console.log('Processing recovery token...')
        result = await verifyPasswordResetToken(token)
      } else {
        console.log('Processing OTP token...')
        result = await verifyOtp(token, type)
      }
      
      if (result.error) {
        console.error('Error verifying token:', result.error)
        
        // Проверяем специфические ошибки
        if (result.error.message.includes('expired') || result.error.message.includes('invalid')) {
          setError('Ссылка истекла или недействительна. Пожалуйста, запросите новую ссылку.')
        } else {
          setError('Ошибка: ' + result.error.message)
        }
        setStatus('error')
      } else {
        console.log('Token verified successfully:', result.data)
        
        // КРИТИЧЕСКИ ВАЖНО: Принудительно выходим из сессии после верификации!
        // Это гарантирует, что пользователь НЕ будет авторизован автоматически
        console.log('🔒 FORCING SIGN OUT after token verification to prevent auto-authentication...')
        try {
          await supabase.auth.signOut()
          console.log('✅ Forced sign out after token verification completed')
        } catch (signOutError) {
          console.error('❌ Error during forced sign out after verification:', signOutError)
        }
        
        // ВАЖНО: НЕ устанавливаем сессию автоматически!
        // Только проверяем токен, но не авторизуем пользователя
        console.log('Token is valid, but NOT setting session automatically')
        
        setStatus('success')
        
        // Перенаправляем на страницу сброса пароля БЕЗ авторизации
        console.log('Redirecting to reset password page...')
        setTimeout(() => {
          router.push('/auth/reset-password')
        }, 2000) // Даем время показать сообщение об успехе
      }
    } catch (err) {
      console.error('Exception verifying token:', err)
      setError('Произошла ошибка при обработке токена')
      setStatus('error')
    }
  }

  if (status === 'processing') {
    return (
      <div className="max-w-md w-full mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-blue-600 text-4xl mb-4">⏳</div>
          <h2 className="text-xl font-bold mb-4 text-blue-600">Обработка токена...</h2>
          <p className="text-gray-600 mb-6">
            Проверяем токен для сброса пароля
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          
          {/* Debug информация */}
          <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-left">
            <div><strong>URL:</strong> {window.location.href}</div>
            <div><strong>Search:</strong> {window.location.search}</div>
            <div><strong>Hash:</strong> {window.location.hash}</div>
            <div><strong>Token:</strong> {searchParams.get('token') ? 'Found' : 'Not found'}</div>
            <div><strong>Type:</strong> {searchParams.get('type') || 'Not found'}</div>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="max-w-md w-full mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-green-600 text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold mb-4 text-green-600">Токен подтвержден!</h2>
          <p className="text-gray-600 mb-6">
            Перенаправляем на страницу сброса пароля...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <div className="text-red-600 text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-4 text-red-600">Ошибка обработки токена</h2>
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
        </div>
      </div>
    </div>
  )
}