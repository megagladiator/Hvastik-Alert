"use client"

import { useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

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
        setError(loginError.message)
      } else {
        setInfo("Вход выполнен!")
        router.push("/cabinet")
      }
    } else {
      // Регистрация
      const { error: regError } = await supabase.auth.signUp({ email, password })
      if (regError) {
        // Проверяем код ошибки или текст
        if (
          regError.message.toLowerCase().includes("already registered") ||
          regError.message.toLowerCase().includes("user already exists") ||
          regError.message.toLowerCase().includes("email already")
        ) {
          setError("Пользователь с таким e-mail уже существует")
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

  async function handleResetPassword() {
    setError("")
    setInfo("")
    if (!supabase) {
      setError("Supabase не настроен")
      setLoading(false)
      return
    }
    setLoading(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email)
    if (resetError) {
      setError(resetError.message)
    } else {
      setInfo("Письмо для сброса пароля отправлено!")
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
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {info && <div className="text-green-600 text-sm">{info}</div>}
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