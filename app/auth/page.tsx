"use client"

import { useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState("")
  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const repeatPasswordInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setInfo("")
    if (!supabase) {
      setError("Supabase не настроен")
      setLoading(false)
      return
    }
    if (mode === "register" && password !== repeatPassword) {
      setError("Пароли не совпадают")
      return
    }
    setLoading(true)
    if (mode === "login") {
      // Вход
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (loginError) {
        const errorMessage = loginError.message.toLowerCase()
        if (
          errorMessage.includes("invalid login credentials") ||
          errorMessage.includes("invalid email or password") ||
          errorMessage.includes("invalid credentials")
        ) {
          setError("Неверный email или пароль")
        } else if (errorMessage.includes("email not confirmed")) {
          setError("Email не подтвержден. Проверьте почту и подтвердите регистрацию.")
        } else {
          setError(loginError.message)
        }
      } else {
        setInfo("Вход выполнен!")
        router.push("/cabinet")
      }
    } else {
      // Регистрация - упрощенная логика
      const { error: regError } = await supabase.auth.signUp({ email, password })
      if (regError) {
        // Проверяем код ошибки или текст - расширенная проверка
        const errorMessage = regError.message.toLowerCase()
        if (
          errorMessage.includes("already registered") ||
          errorMessage.includes("user already exists") ||
          errorMessage.includes("email already") ||
          errorMessage.includes("already exists") ||
          errorMessage.includes("duplicate key") ||
          errorMessage.includes("unique constraint") ||
          errorMessage.includes("email is already") ||
          errorMessage.includes("user with this email") ||
          regError.message.includes("User already registered") ||
          regError.message.includes("Email already registered")
        ) {
          setError("Пользователь с таким e-mail уже существует. Попробуйте войти или сбросить пароль.")
        } else {
          setError(regError.message)
        }
      } else {
        setInfo("Проверьте почту для подтверждения регистрации! Если письмо не пришло, проверьте папку 'Спам' или попробуйте другой e-mail. Если проблема повторяется — обратитесь к администратору.")
        setMode("login")
      }
    }
    setLoading(false)
  }

  async function handleResendConfirmation() {
    setError("")
    setInfo("")
    
    if (!email.trim()) {
      setError("Введите email для повторной отправки")
      return
    }
    
    if (!supabase) {
      setError("Supabase не настроен")
      return
    }
    
    setLoading(true)
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })
      
      if (resendError) {
        console.error("Resend confirmation error:", resendError)
        if (resendError.message.includes("User not found")) {
          setError("Пользователь с таким email не найден")
        } else if (resendError.message.includes("Too many requests")) {
          setError("Слишком много запросов. Попробуйте позже")
        } else {
          setError(`Ошибка при отправке письма: ${resendError.message}`)
        }
      } else {
        setInfo("Письмо подтверждения отправлено! Проверьте почту и папку 'Спам'")
      }
    } catch (error) {
      console.error("Unexpected error during resend:", error)
      setError("Произошла неожиданная ошибка. Попробуйте позже")
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword() {
    setError("")
    setInfo("")
    
    // Проверяем, что email введен
    if (!email.trim()) {
      setError("Введите email для сброса пароля")
      return
    }
    
    if (!supabase) {
      setError("Supabase не настроен")
      return
    }
    
    setLoading(true)
    try {
      // Получаем текущий URL для создания ссылки сброса
      const currentUrl = window.location.origin
      const resetUrl = `${currentUrl}/auth/reset-password`
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl
      })
      
      if (resetError) {
        console.error("Reset password error:", resetError)
        if (resetError.message.includes("User not found")) {
          setError("Пользователь с таким email не найден")
        } else if (resetError.message.includes("Too many requests")) {
          setError("Слишком много запросов. Попробуйте позже")
        } else {
          setError(`Ошибка при отправке письма: ${resetError.message}`)
        }
      } else {
        setInfo("Письмо для сброса пароля отправлено! Проверьте почту и папку 'Спам'")
      }
    } catch (error) {
      console.error("Unexpected error during password reset:", error)
      setError("Произошла неожиданная ошибка. Попробуйте позже")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">{mode === "register" ? "Регистрация" : "Вход"}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="username"
          name="email"
          id="email"
          className="w-full border rounded px-3 py-2"
          ref={emailInputRef}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          name="password"
          id="password"
          className="w-full border rounded px-3 py-2"
          ref={passwordInputRef}
          disabled={loading}
        />
        {mode === "register" && (
          <input
            type="password"
            placeholder="Повторите пароль"
            value={repeatPassword}
            onChange={e => setRepeatPassword(e.target.value)}
            required
            autoComplete="new-password"
            name="repeat-password"
            id="repeat-password"
            className="w-full border rounded px-3 py-2"
            ref={repeatPasswordInputRef}
            disabled={loading}
          />
        )}
        {error && (
          <div className="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="font-medium mb-1">Ошибка:</div>
            <div>{error}</div>
            {error.includes("Invalid login credentials") && (
              <div className="mt-2 text-xs">
                💡 Попробуйте:
                <ul className="list-disc list-inside mt-1">
                  <li>Проверить правильность email и пароля</li>
                  <li>Зарегистрироваться, если аккаунта нет</li>
                  <li>Сбросить пароль, если забыли</li>
                </ul>
              </div>
            )}
            {error.includes("уже существует") && (
              <div className="mt-2 text-xs">
                💡 Попробуйте:
                <ul className="list-disc list-inside mt-1">
                  <li>Войти в существующий аккаунт</li>
                  <li>Сбросить пароль, если забыли</li>
                  <li>Использовать другой email</li>
                </ul>
              </div>
            )}
            {error.includes("не подтвержден") && (
              <div className="mt-2 text-xs">
                💡 Попробуйте:
                <ul className="list-disc list-inside mt-1">
                  <li>Проверить почту и подтвердить регистрацию</li>
                  <li>Проверить папку "Спам"</li>
                  <li>Запросить повторную отправку письма</li>
                  <li>Использовать другой email</li>
                </ul>
              </div>
            )}
          </div>
        )}
        {info && <div className="text-green-600 text-sm p-3 bg-green-50 border border-green-200 rounded-lg">{info}</div>}
        <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded" disabled={loading}>
          {loading ? "Загрузка..." : mode === "register" ? "Зарегистрироваться" : "Войти"}
        </button>
        {mode === "login" && (
          <div className="text-right">
            <button type="button" className="text-blue-600 underline text-sm" onClick={handleResetPassword} disabled={loading || !email}>
              Забыли пароль?
            </button>
          </div>
        )}
        <div className="mt-4 text-center">
          {mode === "register" ? (
            <span>Уже есть аккаунт? <button className="text-blue-600 underline" type="button" onClick={() => setMode("login")}>Войти</button></span>
          ) : (
            <span>Нет аккаунта? <button className="text-blue-600 underline" type="button" onClick={() => setMode("register")}>Зарегистрироваться</button></span>
          )}
        </div>
      </form>
    </div>
  )
} 