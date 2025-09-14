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
    
    if (mode === "register" && password !== repeatPassword) {
      setError("Пароли не совпадают")
      return
    }
    
    setLoading(true)
    
    try {
      if (mode === "login") {
        // Вход через Supabase
        if (!supabase) {
          setError("Система входа недоступна")
          return
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        })
        
        if (error) {
          console.error("Ошибка входа:", error)
          
          if (error.message.includes('Email not confirmed')) {
            setError("Email не подтвержден. Проверьте почту и подтвердите регистрацию.")
          } else if (error.message.includes('Invalid login credentials')) {
            setError("Неверный email или пароль")
          } else if (error.message.includes('rate limit') || error.message.includes('Too many requests')) {
            setError("Слишком много попыток входа. Попробуйте позже")
          } else {
            setError("Ошибка при входе")
          }
        } else {
          setInfo("Вход выполнен!")
          // Небольшая задержка для установки сессии
          setTimeout(() => {
            router.push("/cabinet")
          }, 500)
        }
      } else {
        // Регистрация через Supabase
        setError("Регистрация временно недоступна. Используйте страницу регистрации.")
      }
    } catch (error: any) {
      console.error("Ошибка входа:", error)
      setError("Произошла ошибка при входе")
    }
    
    setLoading(false)
  }


  return (
    <div className="max-w-md w-full mx-auto mt-10 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-lg border-2 border-blue-200">
      <div className="text-center mb-4">
        <div className="text-blue-600 text-2xl mb-2">🔐</div>
        <h2 className="text-xl font-bold text-blue-800">{mode === "register" ? "Регистрация" : "Вход через Supabase"}</h2>
        <p className="text-sm text-blue-600 mt-1">Безопасная аутентификация</p>
      </div>
      
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
          className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
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
          className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
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
            className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
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
            {error.includes('Слишком много попыток входа') && (
              <div className="mt-3 text-sm text-gray-600">
                <p>Попробуйте снова через час.</p>
                <p>Это защита от спама.</p>
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
        <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl" disabled={loading}>
          {loading ? "Загрузка..." : mode === "register" ? "Зарегистрироваться" : "Войти через Supabase"}
        </button>
        <div className="mt-4 text-center space-y-2">
          {mode === "register" ? (
            <span>Уже есть аккаунт? <button className="text-blue-600 underline" type="button" onClick={() => setMode("login")}>Войти</button></span>
          ) : (
            <>
              <div>
                <span>Нет аккаунта? <Link href="/register" className="text-indigo-600 hover:text-indigo-800 underline font-medium">Зарегистрироваться</Link></span>
              </div>
              <div>
                <Link href="/auth/forgot-password" className="text-indigo-600 hover:text-indigo-800 underline font-medium">
                  Забыли пароль?
                </Link>
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  )
} 