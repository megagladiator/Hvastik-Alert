"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TestResult {
  test: string
  status: "success" | "error" | "info" | "warning"
  data: any
  timestamp: string
}

export default function SupabaseTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newPet, setNewPet] = useState({
    name: "",
    species: "",
    description: "",
    location: "",
    contact: ""
  })

  const addTestResult = (test: string, status: TestResult["status"], data: any) => {
    const result: TestResult = {
      test,
      status,
      data,
      timestamp: new Date().toLocaleTimeString()
    }
    setTestResults(prev => [result, ...prev])
  }

  const testConnection = async () => {
    setIsLoading(true)
    addTestResult("Проверка подключения", "info", "Начинаем тестирование...")

    try {
      if (!supabase) {
        addTestResult("Создание клиента", "error", "Клиент Supabase не создан")
        return
      }

      addTestResult("Создание клиента", "success", "Клиент создан успешно")

      // Тест 1: Проверка переменных окружения
      const envVars = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Установлен" : "Не установлен",
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Установлен" : "Не установлен"
      }
      addTestResult("Переменные окружения", "info", envVars)

      // Тест 2: Простой запрос к таблице pets
      const startTime = Date.now()
      const { data: petsData, error: petsError } = await supabase
        .from("pets")
        .select("*")
        .limit(5)
      
      const responseTime = Date.now() - startTime

      if (petsError) {
        addTestResult("Запрос к таблице pets", "error", {
          error: petsError.message,
          code: petsError.code,
          responseTime: `${responseTime}ms`
        })
      } else {
        addTestResult("Запрос к таблице pets", "success", {
          count: petsData?.length || 0,
          responseTime: `${responseTime}ms`,
          sampleData: petsData?.[0] || null
        })
      }

      // Тест 3: Проверка таблицы app_settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("app_settings")
        .select("*")
        .limit(1)

      if (settingsError) {
        addTestResult("Запрос к таблице app_settings", "error", {
          error: settingsError.message,
          code: settingsError.code
        })
      } else {
        addTestResult("Запрос к таблице app_settings", "success", {
          count: settingsData?.length || 0,
          data: settingsData?.[0] || null
        })
      }

      // Тест 4: Проверка таблицы messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .limit(3)

      if (messagesError) {
        addTestResult("Запрос к таблице messages", "error", {
          error: messagesError.message,
          code: messagesError.code
        })
      } else {
        addTestResult("Запрос к таблице messages", "success", {
          count: messagesData?.length || 0,
          sampleData: messagesData?.[0] || null
        })
      }

    } catch (error: any) {
      addTestResult("Общая ошибка", "error", {
        message: error.message,
        stack: error.stack
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testInsertPet = async () => {
    if (!newPet.name || !newPet.species) {
      addTestResult("Вставка записи", "warning", "Заполните обязательные поля")
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("pets")
        .insert([{
          name: newPet.name,
          species: newPet.species,
          description: newPet.description,
          location: newPet.location,
          contact: newPet.contact,
          status: "active",
          created_at: new Date().toISOString()
        }])
        .select()

      if (error) {
        addTestResult("Вставка записи", "error", {
          error: error.message,
          code: error.code
        })
      } else {
        addTestResult("Вставка записи", "success", {
          insertedData: data?.[0] || null
        })
        setNewPet({ name: "", species: "", description: "", location: "", contact: "" })
      }
    } catch (error: any) {
      addTestResult("Вставка записи", "error", {
        message: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testUpdatePet = async () => {
    setIsLoading(true)
    try {
      // Сначала получим ID последней записи
      const { data: lastPet, error: fetchError } = await supabase
        .from("pets")
        .select("id")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (fetchError || !lastPet) {
        addTestResult("Обновление записи", "error", {
          error: "Не найдена запись для обновления"
        })
        return
      }

      const { data, error } = await supabase
        .from("pets")
        .update({ 
          description: `Обновлено: ${new Date().toLocaleString()}` 
        })
        .eq("id", lastPet.id)
        .select()

      if (error) {
        addTestResult("Обновление записи", "error", {
          error: error.message,
          code: error.code
        })
      } else {
        addTestResult("Обновление записи", "success", {
          updatedData: data?.[0] || null
        })
      }
    } catch (error: any) {
      addTestResult("Обновление записи", "error", {
        message: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800 border-green-200"
      case "error": return "bg-red-100 text-red-800 border-red-200"
      case "warning": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "info": return "bg-blue-100 text-blue-800 border-blue-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return "✅"
      case "error": return "❌"
      case "warning": return "⚠️"
      case "info": return "ℹ️"
      default: return "📋"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-8">
      <div className="container mx-auto max-w-6xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🧪 Тестирование Supabase
              <Badge variant="outline">Интерфейс тестирования</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Button 
                onClick={testConnection} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Тестируем..." : "🔍 Тест подключения"}
              </Button>
              
              <Button 
                onClick={() => setTestResults([])} 
                variant="outline"
                className="w-full"
              >
                🗑️ Очистить результаты
              </Button>
            </div>

            {/* Форма для тестирования вставки */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Тест CRUD операций</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="name">Имя питомца *</Label>
                    <Input
                      id="name"
                      value={newPet.name}
                      onChange={(e) => setNewPet(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Барсик"
                    />
                  </div>
                  <div>
                    <Label htmlFor="species">Вид *</Label>
                    <Input
                      id="species"
                      value={newPet.species}
                      onChange={(e) => setNewPet(prev => ({ ...prev, species: e.target.value }))}
                      placeholder="Кот"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Местоположение</Label>
                    <Input
                      id="location"
                      value={newPet.location}
                      onChange={(e) => setNewPet(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Анапа, ул. Ленина"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact">Контакты</Label>
                    <Input
                      id="contact"
                      value={newPet.contact}
                      onChange={(e) => setNewPet(prev => ({ ...prev, contact: e.target.value }))}
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={newPet.description}
                    onChange={(e) => setNewPet(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Описание питомца..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={testInsertPet} 
                    disabled={isLoading}
                    variant="default"
                  >
                    ➕ Вставить запись
                  </Button>
                  <Button 
                    onClick={testUpdatePet} 
                    disabled={isLoading}
                    variant="secondary"
                  >
                    ✏️ Обновить последнюю
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Результаты тестов */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Результаты тестов:</h3>
              {testResults.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    Нажмите "Тест подключения" для начала тестирования
                  </AlertDescription>
                </Alert>
              ) : (
                testResults.map((result, index) => (
                  <Card key={index} className={`border-l-4 ${getStatusColor(result.status)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getStatusIcon(result.status)}</span>
                          <h4 className="font-semibold">{result.test}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(result.status)}>
                            {result.status}
                          </Badge>
                          <span className="text-sm text-gray-500">{result.timestamp}</span>
                        </div>
                      </div>
                      <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-40">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
