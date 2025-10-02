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
        const access_token = urlParams.get('access_token')
        const refresh_token = urlParams.get('refresh_token')
        const code = urlParams.get('code')
        
        // Проверяем на ошибки
        const error = urlParams.get('error')
        const errorCode = urlParams.get('error_code')
        const errorDescription = urlParams.get('error_description')
        
        console.log('🔍 URL params:', { 
          type, 
          token: token ? 'present' : 'missing',
          access_token: access_token ? 'present' : 'missing',
          refresh_token: refresh_token ? 'present' : 'missing',
          code: code ? 'present' : 'missing',
          error,
          errorCode,
          errorDescription
        })
        
        // Если есть ошибка, обрабатываем её
        if (error) {
          console.error('❌ Auth callback error:', { error, errorCode, errorDescription })
          
          if (errorCode === 'otp_expired') {
            router.push('/auth/forgot-password?error=link_expired')
          } else if (errorCode === 'access_denied') {
            router.push('/auth/forgot-password?error=access_denied')
          } else {
            router.push('/auth?error=callback_error')
          }
          return
        }
        
        // Если есть authorization code, обмениваем его на токены
        if (code) {
          console.log('🔑 Processing authorization code...')
          const { data, error: codeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (codeError) {
            console.error('❌ Error exchanging code for session:', codeError)
            router.push('/auth?error=code_exchange_error')
            return
          }
          
          console.log('✅ Code exchanged for session successfully')
          
          // Если это сброс пароля, перенаправляем на страницу сброса
          if (type === 'recovery') {
            console.log('🔄 Redirecting to password reset page')
            router.push('/auth/reset-password')
            return
          }
          
          // Обычная аутентификация - перенаправляем на главную
          router.push('/')
          return
        }
        
        // Если есть токены в URL, устанавливаем сессию
        if (access_token && refresh_token) {
          console.log('🔑 Setting session from URL tokens...')
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token
          })
          
          if (sessionError) {
            console.error('❌ Error setting session:', sessionError)
            router.push('/auth?error=session_error')
            return
          }
          
          console.log('✅ Session set successfully')
        } else if (token && type === 'recovery') {
          // Обрабатываем PKCE токен для сброса пароля
          console.log('🔑 Processing PKCE token for password recovery...')
          
          // Для сброса пароля нам нужно обработать токен по-другому
          // Перенаправляем сразу на страницу сброса пароля с токеном
          console.log('🔄 Redirecting to password reset with token')
          router.push(`/auth/reset-password?token=${token}&type=${type}`)
          return
        }
        
        // Проверяем текущую сессию
        const { data, error: sessionError } = await supabase.auth.getSession()
        
        console.log('🔍 Session data:', { 
          hasSession: !!data.session, 
          error: sessionError?.message 
        })
        
        if (sessionError) {
          console.error('❌ Auth callback error:', sessionError)
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