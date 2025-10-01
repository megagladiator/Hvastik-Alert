"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Получаем сессию из URL
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth?error=callback_error')
          return
        }

        if (data.session) {
          // Проверяем, это сброс пароля или обычная аутентификация
          const urlParams = new URLSearchParams(window.location.search)
          const type = urlParams.get('type')
          
          if (type === 'recovery') {
            // Это сброс пароля - перенаправляем на страницу сброса
            router.push('/auth/reset-password')
          } else {
            // Обычная аутентификация - перенаправляем на главную
            router.push('/')
          }
        } else {
          // Нет сессии - перенаправляем на страницу входа
          router.push('/auth')
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        router.push('/auth?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="max-w-md w-full mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <div className="text-blue-600 text-4xl mb-4">⏳</div>
        <h2 className="text-xl font-bold mb-4">Обработка запроса...</h2>
        <p className="text-gray-600">
          Пожалуйста, подождите, пока мы обрабатываем ваш запрос.
        </p>
      </div>
    </div>
  )
}