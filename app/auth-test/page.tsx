"use client"

import { useState, useRef } from "react"

export default function AuthTestPage() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState("")
  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const repeatPasswordInputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (mode === "register" && password !== repeatPassword) {
      setError("Пароли не совпадают")
      return
    }
    alert("OK! (никакой реальной авторизации)")
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
          />
        )}
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded">
          {mode === "register" ? "Зарегистрироваться" : "Войти"}
        </button>
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