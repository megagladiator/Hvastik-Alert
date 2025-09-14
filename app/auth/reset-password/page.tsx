"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [accessToken, setAccessToken] = useState("")
  const [refreshToken, setRefreshToken] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Получаем токены из URL параметров Supabase
    const access_token = searchParams.get('access_token')
    const refresh_token = searchParams.get('refresh_token')
    const type = searchParams.get('type')
    
    if (access_token && refresh_token && type === 'recovery') {
      setAccessToken(access_token)
      setRefreshToken(refresh_token)
    } else {
      setError("Неверная ссылка для сброса пароля")
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    
    if (password !== confirmPassword) {
      setError("Пароли не совпадают")
      return
    }
    
    if (password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов")
      return
    }
    
    if (!accessToken || !refreshToken) {
      setError("Отсутствуют токены для сброса пароля")
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          accessToken,
          refreshToken,
          newPassword: password 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Произошла ошибка при сбросе пароля')
        return
      }

      setSuccess(true)
      
    } catch (error: any) {
      setError('Произошла ошибка при сбросе пароля')
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <div className="max-w-md w-full mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-green-600 text-4xl mb-4">✓</div>
          <h2 className="text-xl font-bold mb-4 text-green-600">Пароль успешно изменен!</h2>
          <p className="text-gray-600 mb-6">
            Ваш пароль был успешно обновлен. Теперь вы можете войти в систему с новым паролем.
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

  if (!accessToken || !refreshToken) {
    return (
      <div className="max-w-md w-full mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-red-600 text-4xl mb-4">⚠</div>
          <h2 className="text-xl font-bold mb-4 text-red-600">Неверная ссылка</h2>
          <p className="text-gray-600 mb-6">
            Ссылка для сброса пароля недействительна или истекла.
          </p>
          
          <div className="space-y-2">
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

  return (
    <div className="max-w-md w-full mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Установить новый пароль</h2>
      <p className="text-gray-600 mb-6">
        Введите новый пароль для вашего аккаунта
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="Новый пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          name="password"
          id="password"
          className="w-full border rounded px-3 py-2"
          disabled={loading}
          minLength={6}
        />
        
        <input
          type="password"
          placeholder="Подтвердите новый пароль"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          name="confirm-password"
          id="confirm-password"
          className="w-full border rounded px-3 py-2"
          disabled={loading}
          minLength={6}
        />
        
        {error && (
          <div className="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="font-medium mb-1">Ошибка:</div>
            <div>{error}</div>
          </div>
        )}
        
        <button 
          type="submit" 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded" 
          disabled={loading}
        >
          {loading ? "Обновление..." : "Установить новый пароль"}
        </button>
        
        <div className="text-center">
          <Link href="/auth" className="text-blue-600 underline">
            Вернуться к входу
          </Link>
        </div>
      </form>
    </div>
  )
}
