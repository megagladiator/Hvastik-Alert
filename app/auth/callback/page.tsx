"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔍 Auth callback started')
        console.log('🔍 Current URL:', window.location.href)
        
        // Получаем параметры из URL
        const urlParams = new URLSearchParams(window.location.search)
        const type = urlParams.get('type')
        const token = urlParams.get('token')
        
        console.log('🔍 URL params:', { type, token: token ? 'present' : 'missing' })
        
        // Обрабатываем callback через Supabase
        const { data, error } = await supabase.auth.getSession()
        
        console.log('🔍 Session data:', { 
          hasSession: !!data.session, 
          error: error?.message 
        })
        
        if (error) {
          console.error('❌ Auth callback error:', error)
          router.push('/auth?error=callback_error')
          return
        }

        if (data.session) {
          console.log('✅ Session found, redirecting...')
          
          if (type === 'recovery') {
            // Это сброс пароля - перенаправляем на страницу сброса
            console.log('🔄 Redirecting to password reset page')
            router.push('/auth/reset-password')
          } else {
            // Обычная аутентификация - перенаправляем на главную
            console.log('🏠 Redirecting to home page')
            router.push('/')
          }
        } else {
          console.log('❌ No session found, redirecting to auth')
          // Нет сессии - перенаправляем на страницу входа
          router.push('/auth')
        }
      } catch (error) {
        console.error('❌ Unexpected error in auth callback:', error)
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