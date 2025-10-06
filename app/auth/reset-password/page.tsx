"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { 
  exchangeCodeForSession, 
  updatePassword, 
  setSession, 
  verifyOtp, 
  getSessionFromUrl,
  getCodeVerifier,
  clearCodeVerifier
} from "@/lib/auth"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isProcessing, setIsProcessing] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    console.group("ResetPasswordPage Load")

    console.log("Full URL:", window.location.href)
    console.log("Window location search:", window.location.search)
    console.log("Window location hash:", window.location.hash)

    // Проверяем все возможные параметры
    const urlParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    
    console.log("All URL search params:", Object.fromEntries(urlParams.entries()))
    console.log("All hash params:", Object.fromEntries(hashParams.entries()))

    const code = searchParams.get('code') || urlParams.get('code')
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    const token = urlParams.get('token')
    const type = urlParams.get('type')
    
    console.log('Extracted params:', { code, accessToken: !!accessToken, refreshToken: !!refreshToken, token, type })

    // Получаем code_verifier из localStorage
    const codeVerifier = getCodeVerifier()
    console.log('🔑 Code verifier from localStorage:', codeVerifier ? 'found' : 'not found')

    // Если есть токены в hash, используем их
    if (accessToken && refreshToken) {
      console.log("Found tokens in hash, setting session...")
      handleTokensFromHash(accessToken, refreshToken)
      return
    }

    // Если есть code и code_verifier, пробуем exchangeCodeForSession
    if (code && codeVerifier) {
      console.log("Found code and code_verifier, trying exchangeCodeForSession...")
      handleCodeExchange(code, codeVerifier)
      return
    }

    // Если есть code но нет code_verifier
    if (code && !codeVerifier) {
      console.error('Code found but no code_verifier in localStorage')
      setError('Код восстановления найден, но отсутствует code_verifier. Пожалуйста, запросите новую ссылку.')
      setIsProcessing(false)
      console.groupEnd()
      return
    }

    // Если есть token и type, пробуем verifyOtp
    if (token && type) {
      console.log("Found token and type, trying verifyOtp...")
      handleTokenVerification(token, type)
      return
    }

    console.error('Error: No valid auth params found')
    setError('Код восстановления пароля отсутствует. Пожалуйста, перейдите по ссылке из email.')
    setIsProcessing(false)
    console.groupEnd()
  }, [searchParams])

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

  // Обработка code exchange (PKCE flow)
  async function handleCodeExchange(code: string, codeVerifier: string) {
    try {
      console.log("Trying exchangeCodeForSession with code_verifier...")
      const { data, error } = await exchangeCodeForSession(code)
      
      if (error) {
        console.error("Error from exchangeCodeForSession:", error)
        setError('Ошибка: ' + error.message)
        // Удаляем code_verifier при ошибке
        clearCodeVerifier()
      } else {
        console.log("exchangeCodeForSession successful", data)
        // Удаляем code_verifier после успешного использования
        clearCodeVerifier()
      }
    } catch (err) {
      console.error("Exception in handleCodeExchange:", err)
      setError('Произошла ошибка при обработке ссылки сброса пароля')
      // Удаляем code_verifier при ошибке
      clearCodeVerifier()
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
      await updatePassword(password)
      console.log("Password successfully updated")
      setSuccess(true)
    } catch (err: any) {
      console.error("Exception in updating password:", err)
      setError('Произошла ошибка при сбросе пароля: ' + (err.message || 'Неизвестная ошибка'))
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