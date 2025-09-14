"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleEmailVerification = async () => {
      // Получаем все возможные параметры из URL
      const access_token = searchParams.get('access_token')
      const refresh_token = searchParams.get('refresh_token')
      const type = searchParams.get('type')
      const token = searchParams.get('token')
      const email = searchParams.get('email')

      console.log('URL parameters:', { access_token, refresh_token, type, token, email })
      console.log('Full URL:', window.location.href)
      console.log('Search params:', window.location.search)

      if (!supabase) {
        setError('Система подтверждения недоступна')
        setLoading(false)
        return
      }

      try {
        // Вариант 1: Стандартные токены Supabase
        if (access_token && refresh_token && type === 'signup') {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          })

          if (error) {
            console.error('Error setting session:', error)
            setError('Ошибка при подтверждении email: ' + error.message)
          } else {
            setSuccess(true)
          }
        }
        // Вариант 2: Токен подтверждения из Supabase URL
        else if (token) {
          // Supabase автоматически обрабатывает токен через URL
          // Просто проверяем, что пользователь подтвержден
          const { data: { user }, error } = await supabase.auth.getUser()
          
          if (error) {
            console.error('Error getting user:', error)
            setError('Ошибка при подтверждении email: ' + error.message)
          } else if (user?.email_confirmed_at) {
            setSuccess(true)
          } else {
            // Если токен есть, но пользователь не подтвержден, ждем немного
            setTimeout(async () => {
              const { data: { user: user2 } } = await supabase.auth.getUser()
              if (user2?.email_confirmed_at) {
                setSuccess(true)
              } else {
                setError('Токен подтверждения недействителен или истек')
              }
            }, 2000)
          }
        }
        // Вариант 3: Автоматическое подтверждение через Supabase
        else {
          // Пытаемся получить текущую сессию
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('Error getting session:', error)
            setError('Неверная ссылка для подтверждения email')
          } else if (session?.user?.email_confirmed_at) {
            setSuccess(true)
          } else {
            setError('Неверная ссылка для подтверждения email')
          }
        }
      } catch (error: any) {
        console.error('Error in email verification:', error)
        setError('Ошибка при подтверждении email: ' + error.message)
      }
      
      setLoading(false)
    }

    handleEmailVerification()
  }, [searchParams])

  if (loading) {
    return (
      <div className="max-w-md w-full mx-auto mt-10 p-6 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-lg shadow-lg border-2 border-yellow-200">
        <div className="text-center">
          <div className="text-yellow-600 text-4xl mb-4">⏳</div>
          <h2 className="text-xl font-bold mb-4 text-yellow-800">Подтверждение email</h2>
          <p className="text-yellow-600">Проверяем вашу ссылку через Supabase...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-md w-full mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-green-600 text-4xl mb-4">✓</div>
          <h2 className="text-xl font-bold mb-4 text-green-600">Email подтвержден!</h2>
          <p className="text-gray-600 mb-6">
            Ваш email успешно подтвержден. Теперь вы можете войти в систему.
          </p>
          
          <Link 
            href="/auth" 
            className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded text-center"
          >
            Войти в систему
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <div className="text-red-600 text-4xl mb-4">⚠</div>
        <h2 className="text-xl font-bold mb-4 text-red-600">Ошибка подтверждения</h2>
        <p className="text-gray-600 mb-6">
          {error || 'Ссылка для подтверждения email недействительна или истекла.'}
        </p>
        
        <div className="space-y-2">
          <Link 
            href="/auth" 
            className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded text-center"
          >
            Вернуться к входу
          </Link>
          <Link 
            href="/register" 
            className="block w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-center"
          >
            Зарегистрироваться заново
          </Link>
        </div>
      </div>
    </div>
  )
}