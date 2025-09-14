"use client"

import { useState } from "react"
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { getEmailVerificationUrl } from "@/lib/utils"

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

    setLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log("Пользователь создан:", userCredential.user)
      
      // Отправляем письмо подтверждения через Firebase с правильным URL
      await sendEmailVerification(userCredential.user, {
        url: getEmailVerificationUrl(),
        handleCodeInApp: true, // Для мобильных приложений, но работает и в веб
      })
      
      console.log("Письмо подтверждения отправлено на:", email)
      setSuccess(true)
      setError("")
      
    } catch (error: any) {
      console.error("Ошибка регистрации:", error)
      
      if (error.code === "auth/email-already-in-use") {
        setError("Пользователь с таким email уже существует")
      } else if (error.code === "auth/invalid-email") {
        setError("Неверный формат email")
      } else if (error.code === "auth/weak-password") {
        setError("Пароль слишком слабый")
      } else {
        setError("Ошибка при регистрации")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Регистрация</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
          disabled={loading}
        />
        
        <input
          type="password"
          placeholder="Пароль (минимум 6 символов)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
          disabled={loading}
        />
        
        <input
          type="password"
          placeholder="Повторите пароль"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
          disabled={loading}
        />
        
        {error && (
          <div className="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">
            {error}
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
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded"
            disabled={loading}
          >
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        )}
        
        <div className="text-center">
          <a href="/auth" className="text-blue-600 underline">
            Уже есть аккаунт? Войти
          </a>
        </div>
      </form>
    </div>
  )
}

