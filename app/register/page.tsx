"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { getAuthUrl } from "@/lib/url-utils"
import { checkUserLogin } from "@/lib/user-check"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (!supabase) {
      setError("Система регистрации недоступна")
      return
    }

    setLoading(true)

    // Сначала проверяем, существует ли пользователь
    console.log("🔍 Проверяем существование пользователя:", email)
    try {
      const checkResponse = await fetch('/api/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const checkData = await checkResponse.json()
      console.log("📋 Результат проверки:", checkData)

      if (checkData.exists) {
        console.log("❌ Пользователь уже существует, отклоняем регистрацию")
        setError("Пользователь с таким email уже существует. Попробуйте войти в систему.")
        setLoading(false)
        return
      } else {
        console.log("✅ Пользователь не найден, продолжаем регистрацию")
      }
    } catch (checkError) {
      console.error("Ошибка при проверке пользователя:", checkError)
      // Продолжаем регистрацию, если проверка не удалась
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: getAuthUrl('/auth/verify-email'),
          // Временно отключаем подтверждение email для тестирования
          data: {
            email_confirm: false
          }
        }
      })

      if (error) {
        console.error("Ошибка регистрации:", error)
        
        // Проверяем различные типы ошибок Supabase
        if (error.code === 'over_email_send_rate_limit') {
          // При ошибке лимита email показываем общее сообщение
          // которое покрывает как дублирование, так и реальный лимит
          setError("Пользователь с таким email уже существует или превышен лимит запросов. Попробуйте войти в систему или повторите попытку позже.")
        } else if (error.message.includes('already registered') || error.message.includes('User already registered') || error.message.includes('already been registered')) {
          setError("Пользователь с таким email уже существует")
        } else if (error.message.includes('Invalid email')) {
          setError("Неверный формат email")
        } else if (error.message.includes('Password should be at least')) {
          setError("Пароль слишком слабый")
        } else if (error.message.includes('rate limit') || error.message.includes('Too many requests')) {
          setError("Слишком много запросов. Попробуйте позже")
        } else if (error.code === 'email_address_already_registered') {
          setError("Пользователь с таким email уже существует")
        } else if (error.code === 'user_already_registered') {
          setError("Пользователь с таким email уже существует")
        } else {
          setError("Ошибка при регистрации: " + (error.message || "Неизвестная ошибка"))
        }
        return
      }

      console.log("Пользователь создан:", data.user)
      console.log("Письмо подтверждения отправлено на:", email)
      
      // Проверяем, действительно ли это новый пользователь
      // Если пользователь уже существовал, но регистрация "прошла успешно"
      // это означает, что Supabase создал новую запись (что не должно происходить)
      if (data.user && data.user.email_confirmed_at) {
        // Если email уже подтвержден, значит пользователь уже существовал
        setError("Пользователь с таким email уже существует. Попробуйте войти в систему.")
        setSuccess(false)
      } else {
        setSuccess(true)
        setError("")
      }
      
    } catch (error: any) {
      console.error("Ошибка регистрации:", error)
      setError("Ошибка при регистрации")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full mx-auto mt-10 p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg shadow-lg border-2 border-green-200">
      <div className="text-center mb-4">
        <div className="text-green-600 text-2xl mb-2">📝</div>
        <h2 className="text-xl font-bold text-green-800">Регистрация через Supabase</h2>
        <p className="text-sm text-green-600 mt-1">Создание нового аккаунта</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border-2 border-green-200 rounded-lg px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
          disabled={loading}
        />
        
        <input
          type="password"
          placeholder="Пароль (минимум 6 символов)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border-2 border-green-200 rounded-lg px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
          disabled={loading}
        />
        
        <input
          type="password"
          placeholder="Повторите пароль"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full border-2 border-green-200 rounded-lg px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
          disabled={loading}
        />
        
        {error && (
          <div className="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="font-medium mb-1">Ошибка:</div>
            <div>{error}</div>
            {error.includes('Слишком много запросов') && (
              <div className="mt-3 text-sm text-gray-600">
                <p>Попробуйте снова через час.</p>
                <p>Это защита от спама.</p>
              </div>
            )}
          </div>
        )}
        
        {success && (
          <div className="text-green-600 text-sm p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="font-medium mb-2">✅ Регистрация успешна!</div>
            <div>На ваш email отправлено письмо с подтверждением.</div>
            <div className="mt-2 text-xs">
              💡 Проверьте почту и перейдите по ссылке для подтверждения.
              После подтверждения вы сможете войти в систему.
            </div>
            <button
              type="button"
              onClick={() => router.push("/auth")}
              className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm"
            >
              Перейти к входу
            </button>
          </div>
        )}
        
        {!success && (
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            disabled={loading}
          >
            {loading ? "Регистрация..." : "Зарегистрироваться в Supabase"}
          </button>
        )}
        
        <div className="text-center">
          <a href="/auth" className="text-green-600 hover:text-green-800 underline font-medium">
            Уже есть аккаунт? Войти
          </a>
        </div>
      </form>
    </div>
  )
}

