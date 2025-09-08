"use client"

import { useState, useRef, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AuthResult {
  type: "success" | "error" | "info"
  message: string
  data?: any
  timestamp: string
}

export default function AuthTestPage() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [authResults, setAuthResults] = useState<AuthResult[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const repeatPasswordInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    checkCurrentUser()
  }, [])

  const addAuthResult = (type: AuthResult["type"], message: string, data?: any) => {
    const result: AuthResult = {
      type,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }
    setAuthResults(prev => [result, ...prev])
  }

  const checkCurrentUser = async () => {
    if (!supabase) {
      addAuthResult("error", "Supabase клиент не настроен")
      return
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        addAuthResult("error", `Ошибка получения пользователя: ${error.message}`)
      } else if (user) {
        setCurrentUser(user)
        addAuthResult("success", "Пользователь авторизован", {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        })
      } else {
        setCurrentUser(null)
        addAuthResult("info", "Пользователь не авторизован")
      }
    } catch (error: any) {
      addAuthResult("error", `Исключение: ${error.message}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    if (mode === "register" && password !== repeatPassword) {
      addAuthResult("error", "Пароли не совпадают")
      setIsLoading(false)
      return
    }

    if (!supabase) {
      addAuthResult("error", "Supabase клиент не настроен")
      setIsLoading(false)
      return
    }

    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          addAuthResult("error", `Ошибка регистрации: ${error.message}`)
        } else {
          addAuthResult("success", "Регистрация успешна", {
            user: data.user,
            session: data.session
          })
          if (data.user) {
            setCurrentUser(data.user)
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          addAuthResult("error", `Ошибка входа: ${error.message}`)
        } else {
          addAuthResult("success", "Вход успешен", {
            user: data.user,
            session: data.session
          })
          if (data.user) {
            setCurrentUser(data.user)
          }
        }
      }
    } catch (error: any) {
      addAuthResult("error", `Исключение: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    if (!supabase) {
      addAuthResult("error", "Supabase клиент не настроен")
      return
    }

    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        addAuthResult("error", `Ошибка выхода: ${error.message}`)
      } else {
        addAuthResult("success", "Выход выполнен")
        setCurrentUser(null)
      }
    } catch (error: any) {
      addAuthResult("error", `Исключение: ${error.message}`)
    }
  }

  const getResultColor = (type: string) => {
    switch (type) {
      case "success": return "bg-green-100 text-green-800 border-green-200"
      case "error": return "bg-red-100 text-red-800 border-red-200"
      case "info": return "bg-blue-100 text-blue-800 border-blue-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case "success": return "✅"
      case "error": return "❌"
      case "info": return "ℹ️"
      default: return "📋"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-8">
      <div className="container mx-auto max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔐 Тестирование авторизации Supabase
              <Badge variant="outline">Интерфейс тестирования</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Статус текущего пользователя */}
            {currentUser && (
              <Alert className="mb-6">
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>Авторизован:</strong> {currentUser.email}
                      <br />
                      <small>ID: {currentUser.id}</small>
                    </div>
                    <Button onClick={handleSignOut} variant="outline" size="sm">
                      Выйти
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Форма авторизации */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {mode === "register" ? "Регистрация" : "Вход"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="test@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoComplete="username"
                        ref={emailInputRef}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="password">Пароль</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoComplete={mode === "register" ? "new-password" : "current-password"}
                        ref={passwordInputRef}
                      />
                    </div>
                    
                    {mode === "register" && (
                      <div>
                        <Label htmlFor="repeat-password">Повторите пароль</Label>
                        <Input
                          id="repeat-password"
                          type="password"
                          placeholder="Повторите пароль"
                          value={repeatPassword}
                          onChange={e => setRepeatPassword(e.target.value)}
                          required
                          autoComplete="new-password"
                          ref={repeatPasswordInputRef}
                        />
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Обработка..." : (mode === "register" ? "Зарегистрироваться" : "Войти")}
                    </Button>
                    
                    <div className="text-center">
                      {mode === "register" ? (
                        <span>
                          Уже есть аккаунт?{" "}
                          <Button 
                            type="button" 
                            variant="link" 
                            onClick={() => setMode("login")}
                          >
                            Войти
                          </Button>
                        </span>
                      ) : (
                        <span>
                          Нет аккаунта?{" "}
                          <Button 
                            type="button" 
                            variant="link" 
                            onClick={() => setMode("register")}
                          >
                            Зарегистрироваться
                          </Button>
                        </span>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Результаты */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Результаты тестирования</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {authResults.length === 0 ? (
                      <Alert>
                        <AlertDescription>
                          Выполните действие для просмотра результатов
                        </AlertDescription>
                      </Alert>
                    ) : (
                      authResults.map((result, index) => (
                        <div key={index} className={`p-3 rounded border-l-4 ${getResultColor(result.type)}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span>{getResultIcon(result.type)}</span>
                            <span className="font-medium">{result.message}</span>
                            <span className="text-xs text-gray-500 ml-auto">{result.timestamp}</span>
                          </div>
                          {result.data && (
                            <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  
                  {authResults.length > 0 && (
                    <Button 
                      onClick={() => setAuthResults([])} 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-4"
                    >
                      Очистить результаты
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 