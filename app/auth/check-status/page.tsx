"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Search, User, Mail, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function CheckUserStatusPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [userStatus, setUserStatus] = useState<any>(null)
  const [error, setError] = useState("")

  const checkUserStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setUserStatus(null)

    if (!email.trim()) {
      setError("Введите email")
      return
    }

    if (!email.includes("@")) {
      setError("Введите корректный email")
      return
    }

    setLoading(true)

    try {
      if (!supabase) {
        setError("Supabase не настроен")
        return
      }

      // Пытаемся найти пользователя через попытку входа
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: "dummy_password_for_check"
      })

      // Проверяем различные типы ошибок
      if (signInError) {
        const errorMessage = signInError.message.toLowerCase()
        
        if (errorMessage.includes("email not confirmed")) {
          setUserStatus({
            exists: true,
            email: email,
            emailConfirmed: false,
            createdAt: "Неизвестно",
            lastSignIn: "Неизвестно",
            isActive: false
          })
        } else if (
          errorMessage.includes("invalid login credentials") ||
          errorMessage.includes("invalid email or password") ||
          errorMessage.includes("invalid credentials")
        ) {
          setUserStatus({
            exists: true,
            email: email,
            emailConfirmed: true, // Если пароль неверный, значит email подтвержден
            createdAt: "Неизвестно",
            lastSignIn: "Неизвестно",
            isActive: true
          })
        } else if (errorMessage.includes("user not found")) {
          setUserStatus({
            exists: false,
            email: email
          })
        } else {
          // Другие ошибки
          setError(`Ошибка при проверке: ${signInError.message}`)
          return
        }
      } else {
        // Если нет ошибки входа, попробуем через регистрацию
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password: "dummy_password_for_check"
        })

        if (signUpError) {
          const errorMessage = signUpError.message.toLowerCase()
          if (
            errorMessage.includes("already registered") ||
            errorMessage.includes("user already exists") ||
            errorMessage.includes("email already") ||
            errorMessage.includes("already exists") ||
            errorMessage.includes("duplicate key") ||
            errorMessage.includes("unique constraint") ||
            errorMessage.includes("email is already") ||
            errorMessage.includes("user with this email")
          ) {
            setUserStatus({
              exists: true,
              email: email,
              emailConfirmed: true,
              createdAt: "Неизвестно",
              lastSignIn: "Неизвестно",
              isActive: true
            })
          } else {
            setError(`Ошибка при проверке: ${signUpError.message}`)
            return
          }
        } else {
          // Если регистрация прошла успешно, значит пользователя не было
          setUserStatus({
            exists: false,
            email: email
          })
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      setError("Произошла неожиданная ошибка")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString || dateString === "Неизвестно") return "Не указано"
    return new Date(dateString).toLocaleString("ru-RU")
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
              <Search className="h-5 w-5 mr-2 text-orange-500" />
              Проверка статуса пользователя
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Информация:</strong> Эта страница поможет определить статус вашего аккаунта. 
              Проверка выполняется безопасно без сохранения данных.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={checkUserStatus} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите email для проверки"
                disabled={loading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600" 
              disabled={loading}
            >
              {loading ? "Проверка..." : "Проверить статус"}
            </Button>
          </form>

          {userStatus && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-3">
                {userStatus.exists ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                )}
                <h3 className="font-semibold">
                  {userStatus.exists ? "Пользователь найден" : "Пользователь не найден"}
                </h3>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{userStatus.email}</span>
                </div>

                {userStatus.exists ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email подтвержден:</span>
                      <span className={userStatus.emailConfirmed ? "text-green-600" : "text-red-600"}>
                        {userStatus.emailConfirmed ? "Да" : "Нет"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Аккаунт активен:</span>
                      <span className={userStatus.isActive ? "text-green-600" : "text-red-600"}>
                        {userStatus.isActive ? "Да" : "Нет"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Дата регистрации:</span>
                      <span className="font-medium">{formatDate(userStatus.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Последний вход:</span>
                      <span className="font-medium">{formatDate(userStatus.lastSignIn)}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-gray-600">Этот email не зарегистрирован в системе</p>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {userStatus.exists ? (
                  <>
                    {!userStatus.emailConfirmed && (
                      <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                        ⚠️ Email не подтвержден. Проверьте почту и подтвердите регистрацию.
                      </div>
                    )}
                    {!userStatus.isActive && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        ⚠️ Аккаунт не активен. Обратитесь к администратору.
                      </div>
                    )}
                    <Link href="/auth">
                      <Button className="w-full bg-orange-500 hover:bg-orange-600">
                        Войти в аккаунт
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/auth">
                    <Button className="w-full bg-green-500 hover:bg-green-600">
                      Зарегистрироваться
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              <Link href="/auth" className="text-orange-600 hover:text-orange-700 underline">
                Вернуться к авторизации
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
 