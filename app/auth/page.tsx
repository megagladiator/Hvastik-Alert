"use client"

import { useState, useRef } from "react"
import { signIn, getSession } from "next-auth/react"
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
        // Вход через NextAuth
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })
        
        if (result?.error) {
          setError("Неверный email или пароль")
        } else {
          setInfo("Вход выполнен!")
          router.push("/cabinet")
        }
      } else {
        // Регистрация через Firebase
        setError("Регистрация временно недоступна. Используйте страницу регистрации.")
      }
    } catch (error: any) {
      setError("Произошла ошибка при входе")
    }
    
    setLoading(false)
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
        <div className="mt-4 text-center">
          {mode === "register" ? (
            <span>Уже есть аккаунт? <button className="text-blue-600 underline" type="button" onClick={() => setMode("login")}>Войти</button></span>
          ) : (
            <span>Нет аккаунта? <Link href="/register" className="text-blue-600 underline">Зарегистрироваться</Link></span>
          )}
        </div>
      </form>
    </div>
  )
} 