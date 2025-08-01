"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Lock, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Проверяем, что пользователь пришел по ссылке сброса пароля
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    if (!accessToken || !refreshToken) {
      setError("Неверная ссылка для сброса пароля")
      return
    }

    // Устанавливаем сессию
    const setSession = async () => {
      if (!supabase) {
        setError("Supabase не настроен")
        return
      }
      
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      
      if (error) {
        console.error("Error setting session:", error)
        setError("Ошибка при установке сессии. Попробуйте еще раз")
      }
    }

    setSession()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Валидация
    if (!password.trim()) {
      setError("Введите новый пароль")
      return
    }

    if (password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов")
      return
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают")
      return
    }

    setLoading(true)

    try {
      if (!supabase) {
        setError("Supabase не настроен")
        return
      }
      
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        console.error("Error updating password:", error)
        if (error.message.includes("Password should be at least")) {
          setError("Пароль должен содержать минимум 6 символов")
        } else {
          setError(`Ошибка при обновлении пароля: ${error.message}`)
        }
      } else {
        setSuccess(true)
        // Перенаправляем на главную страницу через 3 секунды
        setTimeout(() => {
          router.push("/")
        }, 3000)
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      setError("Произошла неожиданная ошибка. Попробуйте позже")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-auto">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Пароль успешно изменен!</h2>
            <p className="text-gray-600 mb-4">
              Ваш пароль был успешно обновлен. Вы будете перенаправлены на главную страницу.
            </p>
            <Link href="/">
              <Button className="bg-orange-500 hover:bg-orange-600">
                Перейти на главную
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
      <Card className="max-w-md w-full mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Link href="/auth">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
            </Link>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2 text-orange-500" />
              Сброс пароля
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Новый пароль
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите новый пароль"
                  className="pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Подтвердите пароль
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите новый пароль"
                  className="pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600" 
              disabled={loading}
            >
              {loading ? "Обновление..." : "Изменить пароль"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Вспомнили пароль?{" "}
              <Link href="/auth" className="text-orange-600 hover:text-orange-700 underline">
                Войти
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Lock, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Проверяем, что пользователь пришел по ссылке сброса пароля
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    if (!accessToken || !refreshToken) {
      setError("Неверная ссылка для сброса пароля")
      return
    }

    // Устанавливаем сессию
    const setSession = async () => {
      if (!supabase) {
        setError("Supabase не настроен")
        return
      }
      
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      
      if (error) {
        console.error("Error setting session:", error)
        setError("Ошибка при установке сессии. Попробуйте еще раз")
      }
    }

    setSession()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Валидация
    if (!password.trim()) {
      setError("Введите новый пароль")
      return
    }

    if (password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов")
      return
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают")
      return
    }

    setLoading(true)

    try {
      if (!supabase) {
        setError("Supabase не настроен")
        return
      }
      
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        console.error("Error updating password:", error)
        if (error.message.includes("Password should be at least")) {
          setError("Пароль должен содержать минимум 6 символов")
        } else {
          setError(`Ошибка при обновлении пароля: ${error.message}`)
        }
      } else {
        setSuccess(true)
        // Перенаправляем на главную страницу через 3 секунды
        setTimeout(() => {
          router.push("/")
        }, 3000)
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      setError("Произошла неожиданная ошибка. Попробуйте позже")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-auto">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Пароль успешно изменен!</h2>
            <p className="text-gray-600 mb-4">
              Ваш пароль был успешно обновлен. Вы будете перенаправлены на главную страницу.
            </p>
            <Link href="/">
              <Button className="bg-orange-500 hover:bg-orange-600">
                Перейти на главную
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
      <Card className="max-w-md w-full mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Link href="/auth">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
            </Link>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2 text-orange-500" />
              Сброс пароля
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Новый пароль
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите новый пароль"
                  className="pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Подтвердите пароль
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите новый пароль"
                  className="pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600" 
              disabled={loading}
            >
              {loading ? "Обновление..." : "Изменить пароль"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Вспомнили пароль?{" "}
              <Link href="/auth" className="text-orange-600 hover:text-orange-700 underline">
                Войти
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
 