"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { 
  exchangeCodeForSession, 
  updatePassword, 
  setSession, 
  verifyOtp, 
  verifyPasswordResetToken,
  getSessionFromUrl,
  getCodeVerifier,
  clearCodeVerifier
} from "@/lib/auth"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isProcessing, setIsProcessing] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // ИСПРАВЛЕНО: Создаем правильный клиентский клиент
  const supabase = createClient()

  useEffect(() => {
    console.group("ResetPasswordPage Load v1.2.129")
    console.log("Full URL:", window.location.href)
    console.log("🔄 FORCING CACHE CLEAR - Version 1.2.129")
    console.log("🚨 CRITICAL: This should show NEW session check logic!")
    
    // Принудительная очистка кэша
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name)
        })
        console.log('🗑️ All caches cleared')
      })
    }

    // ИСПРАВЛЕНО: Проверяем сессию вместо токенов в URL
    const checkSession = async () => {
      try {
        console.log('🔍 Checking for active session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting session:', error)
          setError('Ошибка при проверке сессии. Пожалуйста, перейдите по ссылке из email.')
          setIsProcessing(false)
          return
        }

        if (session) {
          console.log('✅ Active session found:', session.user?.email)
          console.log('🔍 Session details:', {
            user_id: session.user?.id,
            email: session.user?.email,
            expires_at: session.expires_at,
            token_type: session.token_type,
            access_token: session.access_token ? 'Present' : 'Missing'
          })
          
          // Проверяем, не истекла ли сессия
          const now = Math.floor(Date.now() / 1000)
          if (session.expires_at && session.expires_at < now) {
            console.log('❌ Session expired!')
            setError('Сессия истекла. Пожалуйста, запросите новую ссылку.')
            setIsProcessing(false)
            return
          }
          
          setIsProcessing(false)
          // Пользователь аутентифицирован, показываем форму сброса пароля
        } else {
          console.log('❌ No active session found')
          setError('Код восстановления пароля отсутствует. Пожалуйста, перейдите по ссылке из email.')
          setIsProcessing(false)
        }
      } catch (error) {
        console.error('❌ Exception checking session:', error)
        setError('Ошибка при проверке сессии. Пожалуйста, перейдите по ссылке из email.')
        setIsProcessing(false)
      }
    }

    checkSession()
    console.groupEnd()
  }, [])

  // Обработка токенов из hash (implicit flow)
  async function handleTokensFromHash(accessToken: string, refreshToken: string) {
    try {
      console.log("Setting session from hash tokens...")
      const { error } = await setSession(accessToken, refreshToken)
      
      if (error) {
        console.error("Error setting session from hash:", error)
        setError('Ошибка: ' + error.message)
      } else {
        console.log("Session set successfully from hash")
      }
    } catch (err) {
      console.error("Exception setting session from hash:", err)
      setError('Произошла ошибка при обработке ссылки сброса пароля')
    } finally {
      setIsProcessing(false)
      console.groupEnd()
    }
  }

  // Обработка code exchange
  async function handleCodeExchange(code: string) {
    try {
      console.log("Trying exchangeCodeForSession...")
      const { data, error } = await exchangeCodeForSession(code)
      
      if (error) {
        console.error("Error from exchangeCodeForSession:", error)
        setError('Ошибка: ' + error.message)
      } else {
        console.log("exchangeCodeForSession successful", data)
      }
    } catch (err) {
      console.error("Exception in handleCodeExchange:", err)
      setError('Произошла ошибка при обработке ссылки сброса пароля')
    } finally {
      setIsProcessing(false)
      console.groupEnd()
    }
  }

  // Обработка token verification (magic link flow)
  async function handleTokenVerification(token: string, type: string) {
    try {
      console.log("Trying verifyOtp with token and type...")
      const { data, error } = await verifyOtp(token, type)
      
      if (error) {
        console.error("Error from verifyOtp:", error)
        setError('Ошибка: ' + error.message)
      } else {
        console.log("verifyOtp successful", data)
      }
    } catch (err) {
      console.error("Exception in handleTokenVerification:", err)
      setError('Произошла ошибка при обработке ссылки сброса пароля')
    } finally {
      setIsProcessing(false)
      console.groupEnd()
    }
  }

  // Обработка токена восстановления пароля (без type)
  async function handlePasswordResetToken(token: string) {
    try {
      console.log("Trying verifyPasswordResetToken...")
      const { data, error } = await verifyPasswordResetToken(token)
      
      if (error) {
        console.error("Error from verifyPasswordResetToken:", error)
        setError('Ошибка: ' + error.message)
      } else {
        console.log("verifyPasswordResetToken successful", data)
      }
    } catch (err) {
      console.error("Exception in handlePasswordResetToken:", err)
      setError('Произошла ошибка при обработке ссылки сброса пароля')
    } finally {
      setIsProcessing(false)
      console.groupEnd()
    }
  }

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

    setLoading(true)

    try {
      console.log("Calling updatePassword with new password...")
      console.log("🔍 Password length:", password.length)
      console.log("🔍 Password preview:", password.substring(0, 2) + "***")
      
      // Проверяем сессию перед обновлением пароля
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      console.log("🔍 Current session before update:", currentSession ? 'Present' : 'Missing')
      
      await updatePassword(password)
      console.log("Password successfully updated")
      
      setSuccess(true)
    } catch (err: any) {
      console.error("Exception in updating password:", err)
      
      // КРАСИВАЯ ОБРАБОТКА ОШИБОК SUPABASE
      console.log('🔍 Full error object:', err)
      console.log('🔍 Error message:', err.message)
      
      if (err.message && err.message.includes('New password should be different from the old password')) {
        setError('❌ Нельзя установить тот же пароль, который у вас уже есть. Введите новый пароль.')
      } else if (err.message && err.message.includes('Password should be at least')) {
        setError('❌ Пароль слишком короткий. Минимальная длина: 6 символов.')
      } else if (err.message && err.message.includes('Invalid password')) {
        setError('❌ Некорректный пароль. Используйте только допустимые символы.')
      } else if (err.message && err.message.includes('User not found')) {
        setError('❌ Пользователь не найден. Пожалуйста, запросите новую ссылку.')
      } else if (err.message && err.message.includes('Token has expired')) {
        setError('❌ Ссылка истекла. Пожалуйста, запросите новую ссылку.')
      } else if (err.message && err.message.includes('same password')) {
        setError('❌ Нельзя установить тот же пароль, который у вас уже есть. Введите новый пароль.')
      } else {
        // Для всех остальных ошибок - показываем детали для диагностики
        setError(`❌ Ошибка при сбросе пароля: ${err.message || 'Неизвестная ошибка'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  if (isProcessing) {
    return (
      <div className="max-w-md w-full mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-blue-600 text-4xl mb-4">⏳</div>
          <h2 className="text-xl font-bold mb-4 text-blue-600">Обработка ссылки...</h2>
          <p className="text-gray-600 mb-6">
            Проверяем ссылку для сброса пароля
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
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
          <Link href="/auth" className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded text-center">
            Войти в систему
          </Link>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md w-full mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-red-600 text-4xl mb-4">⚠</div>
          <h2 className="text-xl font-bold mb-4 text-red-600">Неверная ссылка</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-2">
            <Link href="/auth/forgot-password" className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded text-center">
              Запросить новую ссылку
            </Link>
            <Link href="/auth" className="block w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-center">
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
        <input type="email" name="email" autoComplete="username" style={{ display: 'none' }} tabIndex={-1} />
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
        <div className="text-center space-y-2">
          <Link href="/auth" className="text-blue-600 underline">
            Вернуться к входу
          </Link>
          <div>
            <Link href="/debug-password-reset" className="text-gray-500 text-sm underline">
              🔍 Debug Info
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}