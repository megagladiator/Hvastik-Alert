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
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    console.group("ResetPasswordPage Load")

    console.log("Full URL:", window.location.href)
    console.log("Window location search:", window.location.search)
    console.log("Window location hash:", window.location.hash)

    const code = searchParams.get('code') || new URLSearchParams(window.location.search).get('code')
    console.log('Extracted code param:', code)

    if (!code) {
      console.error('Error: Code param is missing')
      setError('Код восстановления пароля отсутствует. Пожалуйста, перейдите по ссылке из email.')
      console.groupEnd()
      return
    }
    
    async function handleCode() {
      try {
        console.log("Calling supabase.auth.verifyOtp with code...")
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: code,
          type: 'recovery'
        })
        if (error) {
          console.error("Error from verifyOtp:", error)
          setError('Ошибка: ' + error.message)
        } else {
          console.log("verifyOtp successful", data)
          // После успешной верификации токена, пользователь может сбросить пароль
        }
      } catch (err) {
        console.error("Exception in handleCode:", err)
        setError('Произошла ошибка при обработке ссылки сброса пароля')
      } finally {
        setLoading(false)
        console.groupEnd()
      }
    }

    handleCode()
  }, [searchParams])

  async function handleSubmit(e) {
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
      console.log("Calling supabase.auth.updateUser with new password...")
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        console.error("Error from updateUser:", error)
        setError(error.message)
        setLoading(false)
        return
      }
      console.log("Password successfully updated")
      setSuccess(true)
    } catch (err) {
      console.error("Exception in updating password:", err)
      setError('Произошла ошибка при сбросе пароля')
    } finally {
      setLoading(false)
    }
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
        <div className="text-center">
          <Link href="/auth" className="text-blue-600 underline">
            Вернуться к входу
          </Link>
        </div>
      </form>
    </div>
  )
}