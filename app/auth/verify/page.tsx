"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { verifyOtp, verifyPasswordResetToken } from "@/lib/auth"

export default function VerifyPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [error, setError] = useState<string>('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    console.log('Auth Verify Page - Processing token...')
    console.log('Full URL:', window.location.href)
    console.log('Search params:', window.location.search)
    
    const token = searchParams.get('token')
    const type = searchParams.get('type')
    const redirectTo = searchParams.get('redirect_to')
    
    console.log('Extracted params:', { token, type, redirectTo })
    
    if (!token) {
      setError('Токен отсутствует в ссылке')
      setStatus('error')
      return
    }
    
    if (!type) {
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
      
      let result
      if (type === 'recovery') {
        result = await verifyPasswordResetToken(token)
      } else {
        result = await verifyOtp(token, type)
      }
      
      if (result.error) {
        console.error('Error verifying token:', result.error)
        setError('Ошибка: ' + result.error.message)
        setStatus('error')
      } else {
        console.log('Token verified successfully:', result.data)
        
        // ВАЖНО: НЕ устанавливаем сессию автоматически!
        // Только проверяем токен, но не авторизуем пользователя
        console.log('Token is valid, but NOT setting session automatically')
        
        setStatus('success')
        
        // Перенаправляем на страницу сброса пароля БЕЗ авторизации
        if (redirectTo && redirectTo.includes('/auth/reset-password')) {
          console.log('Redirecting to reset password page')
          router.push('/auth/reset-password')
        } else {
          console.log('Redirecting to default reset password page')
          router.push('/auth/reset-password')
        }
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