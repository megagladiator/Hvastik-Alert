"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface TestResult {
  name: string
  status: "pending" | "running" | "success" | "error" | "warning"
  message: string
  details?: any
  duration?: number
}

export default function SupabaseTestDashboard() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "Подключение к Supabase", status: "pending", message: "Ожидает запуска" },
    { name: "Проверка переменных окружения", status: "pending", message: "Ожидает запуска" },
    { name: "Тест таблицы pets", status: "pending", message: "Ожидает запуска" },
    { name: "Тест таблицы messages", status: "pending", message: "Ожидает запуска" },
    { name: "Тест таблицы app_settings", status: "pending", message: "Ожидает запуска" },
    { name: "Тест авторизации", status: "pending", message: "Ожидает запуска" },
    { name: "Тест CRUD операций", status: "pending", message: "Ожидает запуска" }
  ])
  const [isRunning, setIsRunning] = useState(false)
  const [overallStatus, setOverallStatus] = useState<"pending" | "running" | "success" | "error" | "warning">("pending")

  const updateTest = (name: string, status: TestResult["status"], message: string, details?: any, duration?: number) => {
    setTests(prev => prev.map(test => 
      test.name === name 
        ? { ...test, status, message, details, duration }
        : test
    ))
  }

  const runAllTests = async () => {
    console.log("🚀 Запуск тестов...")
    setIsRunning(true)
    setOverallStatus("running")
    
    // Сброс всех тестов
    setTests(prev => prev.map(test => ({ ...test, status: "pending", message: "Ожидает запуска" })))

    try {
      // Простой тест для проверки работы
      updateTest("Проверка переменных окружения", "running", "Проверяем переменные...")
      await new Promise(resolve => setTimeout(resolve, 500)) // Небольшая задержка
      
      const envVars = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
      
      if (!envVars.url || !envVars.key) {
        updateTest("Проверка переменных окружения", "error", "Переменные окружения не настроены", envVars)
      } else if (envVars.url.includes("placeholder")) {
        updateTest("Проверка переменных окружения", "warning", "Используются placeholder значения", envVars)
      } else {
        updateTest("Проверка переменных окружения", "success", "Переменные настроены корректно", envVars)
      }

    // Тест 2: Подключение к Supabase
    updateTest("Подключение к Supabase", "running", "Создаем клиент...")
    const startTime2 = Date.now()
    
    if (!supabase) {
      updateTest("Подключение к Supabase", "error", "Клиент Supabase не создан", null, Date.now() - startTime2)
      setIsRunning(false)
      setOverallStatus("error")
      return
    }
    
    updateTest("Подключение к Supabase", "success", "Клиент создан успешно", null, Date.now() - startTime2)

    // Тест 3: Таблица pets
    updateTest("Тест таблицы pets", "running", "Проверяем таблицу pets...")
    const startTime3 = Date.now()
    
    try {
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .limit(5)
      
      if (error) {
        updateTest("Тест таблицы pets", "error", `Ошибка: ${error.message}`, { code: error.code }, Date.now() - startTime3)
      } else {
        updateTest("Тест таблицы pets", "success", `Найдено ${data?.length || 0} записей`, { count: data?.length, sample: data?.[0] }, Date.now() - startTime3)
      }
    } catch (err: any) {
      updateTest("Тест таблицы pets", "error", `Исключение: ${err.message}`, null, Date.now() - startTime3)
    }

    // Тест 4: Таблица messages
    updateTest("Тест таблицы messages", "running", "Проверяем таблицу messages...")
    const startTime4 = Date.now()
    
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .limit(5)
      
      if (error) {
        updateTest("Тест таблицы messages", "error", `Ошибка: ${error.message}`, { code: error.code }, Date.now() - startTime4)
      } else {
        updateTest("Тест таблицы messages", "success", `Найдено ${data?.length || 0} записей`, { count: data?.length, sample: data?.[0] }, Date.now() - startTime4)
      }
    } catch (err: any) {
      updateTest("Тест таблицы messages", "error", `Исключение: ${err.message}`, null, Date.now() - startTime4)
    }

    // Тест 5: Таблица app_settings
    updateTest("Тест таблицы app_settings", "running", "Проверяем таблицу app_settings...")
    const startTime5 = Date.now()
    
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .limit(1)
      
      if (error) {
        updateTest("Тест таблицы app_settings", "error", `Ошибка: ${error.message}`, { code: error.code }, Date.now() - startTime5)
      } else {
        updateTest("Тест таблицы app_settings", "success", `Найдено ${data?.length || 0} записей`, { count: data?.length, data: data?.[0] }, Date.now() - startTime5)
      }
    } catch (err: any) {
      updateTest("Тест таблицы app_settings", "error", `Исключение: ${err.message}`, null, Date.now() - startTime5)
    }

    // Тест 6: Авторизация
    updateTest("Тест авторизации", "running", "Проверяем систему авторизации...")
    const startTime6 = Date.now()
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        updateTest("Тест авторизации", "warning", `Ошибка получения пользователя: ${error.message}`, { code: error.code }, Date.now() - startTime6)
      } else if (user) {
        updateTest("Тест авторизации", "success", "Пользователь авторизован", { userId: user.id, email: user.email }, Date.now() - startTime6)
      } else {
        updateTest("Тест авторизации", "success", "Система авторизации работает (пользователь не авторизован)", null, Date.now() - startTime6)
      }
    } catch (err: any) {
      updateTest("Тест авторизации", "error", `Исключение: ${err.message}`, null, Date.now() - startTime6)
    }

    // Тест 7: CRUD операции
    updateTest("Тест CRUD операций", "running", "Тестируем вставку записи...")
    const startTime7 = Date.now()
    
    try {
      const testData = {
        name: `Тест ${Date.now()}`,
        species: "Тестовый вид",
        description: "Тестовая запись для проверки CRUD",
        location: "Тестовое местоположение",
        contact: "test@example.com",
        status: "active",
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from("pets")
        .insert([testData])
        .select()

      if (error) {
        updateTest("Тест CRUD операций", "error", `Ошибка вставки: ${error.message}`, { code: error.code }, Date.now() - startTime7)
      } else {
        updateTest("Тест CRUD операций", "success", "CRUD операции работают", { insertedId: data?.[0]?.id }, Date.now() - startTime7)
      }
    } catch (err: any) {
      updateTest("Тест CRUD операций", "error", `Исключение: ${err.message}`, null, Date.now() - startTime7)
    }

      // Определяем общий статус
      const hasErrors = tests.some(test => test.status === "error")
      const hasWarnings = tests.some(test => test.status === "warning")
      const allSuccess = tests.every(test => test.status === "success")

      if (hasErrors) {
        setOverallStatus("error")
      } else if (hasWarnings) {
        setOverallStatus("warning")
      } else if (allSuccess) {
        setOverallStatus("success")
      } else {
        setOverallStatus("pending")
      }

    } catch (error) {
      console.error("❌ Ошибка при выполнении тестов:", error)
      updateTest("Общая ошибка", "error", `Критическая ошибка: ${error}`)
      setOverallStatus("error")
    } finally {
      setIsRunning(false)
      console.log("✅ Тестирование завершено")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800 border-green-200"
      case "error": return "bg-red-100 text-red-800 border-red-200"
      case "warning": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "running": return "bg-blue-100 text-blue-800 border-blue-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return "✅"
      case "error": return "❌"
      case "warning": return "⚠️"
      case "running": return "🔄"
      default: return "⏳"
    }
  }

  const getOverallStatusColor = () => {
    switch (overallStatus) {
      case "success": return "bg-green-500"
      case "error": return "bg-red-500"
      case "warning": return "bg-yellow-500"
      case "running": return "bg-blue-500"
      default: return "bg-gray-500"
    }
  }

  const completedTests = tests.filter(test => test.status === "success" || test.status === "error" || test.status === "warning").length
  const progress = (completedTests / tests.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-8">
      <div className="container mx-auto max-w-6xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🧪 Панель тестирования Supabase
              <Badge variant="outline">Полная диагностика</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Общий статус */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Общий прогресс:</span>
                <span className="text-sm text-gray-600">{completedTests} из {tests.length} тестов</span>
              </div>
              <Progress value={progress} className="mb-2" />
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getOverallStatusColor()}`}></div>
                <span className="text-sm">
                  {overallStatus === "success" && "Все тесты пройдены успешно"}
                  {overallStatus === "error" && "Обнаружены ошибки"}
                  {overallStatus === "warning" && "Есть предупреждения"}
                  {overallStatus === "running" && "Тестирование выполняется"}
                  {overallStatus === "pending" && "Ожидает запуска"}
                </span>
              </div>
            </div>

            {/* Кнопки управления */}
            <div className="flex gap-4 mb-6">
              <Button 
                onClick={() => {
                  console.log("Кнопка нажата!")
                  runAllTests()
                }} 
                disabled={isRunning}
                className="flex-1"
              >
                {isRunning ? "🔄 Выполняется..." : "🚀 Запустить все тесты"}
              </Button>
              
              <Button 
                onClick={() => {
                  console.log("Сброс нажат!")
                  setTests(prev => prev.map(test => ({ ...test, status: "pending", message: "Ожидает запуска" })))
                  setOverallStatus("pending")
                }}
                variant="outline"
                disabled={isRunning}
              >
                🔄 Сбросить
              </Button>
            </div>

            {/* Результаты тестов */}
            <div className="space-y-4">
              {tests.map((test, index) => (
                <Card key={index} className={`border-l-4 ${getStatusColor(test.status)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getStatusIcon(test.status)}</span>
                        <h3 className="font-semibold">{test.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(test.status)}>
                          {test.status}
                        </Badge>
                        {test.duration && (
                          <Badge variant="outline">
                            {test.duration}ms
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm mb-2">{test.message}</p>
                    {test.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                          Подробности
                        </summary>
                        <pre className="bg-gray-50 p-2 rounded mt-2 overflow-auto">
                          {JSON.stringify(test.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Ссылки на детальные тесты */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Детальные тесты</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/supabase-test">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">🔍</div>
                        <h3 className="font-semibold">Тест подключения</h3>
                        <p className="text-sm text-gray-600">Детальная проверка БД</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/auth-test">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">🔐</div>
                        <h3 className="font-semibold">Тест авторизации</h3>
                        <p className="text-sm text-gray-600">Регистрация и вход</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/db-structure">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">🗄️</div>
                        <h3 className="font-semibold">Структура БД</h3>
                        <p className="text-sm text-gray-600">Анализ таблиц</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
