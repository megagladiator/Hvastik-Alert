"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Проверяем параметры ошибки из URL
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      if (errorParam === 'link_expired') {
        setError('Ссылка для сброса пароля истекла. Пожалуйста, запросите новую ссылку.')
      } else if (errorParam === 'access_denied') {
        setError('Доступ запрещен. Пожалуйста, запросите новую ссылку для сброса пароля.')
      } else {
        setError('Произошла ошибка при обработке ссылки. Пожалуйста, попробуйте снова.')
      }
    }
  }, [searchParams])

  // Генерация code_verifier для PKCE flow
  function generateCodeVerifier(length = 128) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
    let verifier = ''
    for (let i = 0; i < length; i++) {
      verifier += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return verifier
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    try {
      // Генерируем и сохраняем code_verifier для PKCE flow
      const codeVerifier = generateCodeVerifier()
      localStorage.setItem('pkce_code_verifier', codeVerifier)
      
      console.log('🔑 Generated code_verifier:', codeVerifier.substring(0, 20) + '...')
      console.log('💾 Saved to localStorage')

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          codeVerifier // Передаем code_verifier в API
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Произошла ошибка')
        // Удаляем code_verifier при ошибке
        localStorage.removeItem('pkce_code_verifier')
        return
      }

      setSuccess(true)
      
    } catch (error: any) {
      setError('Произошла ошибка при отправке запроса')
      // Удаляем code_verifier при ошибке
      localStorage.removeItem('pkce_code_verifier')
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <div className="max-w-md w-full mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-green-600 text-4xl mb-4">✓</div>
          <h2 className="text-xl font-bold mb-4 text-green-600">Письмо отправлено!</h2>
          <p className="text-gray-600 mb-4">
            Мы отправили ссылку для сброса пароля на адрес <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Проверьте почту и перейдите по ссылке для установки нового пароля.
          </p>
          
          <div className="space-y-2">
            <Link 
              href="/auth" 
              className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded text-center"
            >
              Вернуться к входу
            </Link>
            <button 
              onClick={() => {
                setSuccess(false)
                setEmail("")
              }}
              className="block w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
            >
              Отправить еще раз
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full mx-auto mt-10 p-6 bg-gradient-to-br from-purple-50 to-pink-100 rounded-lg shadow-lg border-2 border-purple-200">
      <div className="text-center mb-4">
        <div className="text-purple-600 text-2xl mb-2">🔑</div>
        <h2 className="text-xl font-bold text-purple-800">Забыли пароль?</h2>
        <p className="text-sm text-purple-600 mt-1">Сброс через Supabase</p>
      </div>
      <p className="text-gray-600 mb-6 text-center">
        Введите ваш email, и мы отправим ссылку для сброса пароля
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
          name="email"
          id="email"
          className="w-full border-2 border-purple-200 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
          disabled={loading}
        />
        
        {error && (
          <div className="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="font-medium mb-1">Ошибка:</div>
            <div>{error}</div>
            {error.includes('не зарегистрирован') && (
              <div className="mt-3">
                <Link 
                  href="/register" 
                  className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm"
                >
                  Перейти к регистрации
                </Link>
              </div>
            )}
            {error.includes('Слишком много запросов') && (
              <div className="mt-3 text-sm text-gray-600">
                <p>Попробуйте снова через час.</p>
                <p>Это защита от спама.</p>
              </div>
            )}
          </div>
        )}
        
        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl" 
          disabled={loading}
        >
          {loading ? "Отправка..." : "Отправить ссылку для сброса"}
        </button>
        
        <div className="text-center">
          <Link href="/auth" className="text-purple-600 hover:text-purple-800 underline font-medium">
            Вернуться к входу
          </Link>
        </div>
      </form>
    </div>
  )
}
