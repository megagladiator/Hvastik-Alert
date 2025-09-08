"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function TestDatabasePage() {
  const [connectionStatus, setConnectionStatus] = useState<string>("Проверяем...")
  const [connectionDetails, setConnectionDetails] = useState<any>({})
  const [testResults, setTestResults] = useState<any[]>([])

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    const results: any[] = []
    
    // 1. Проверяем переменные окружения
    const envCheck = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Установлен" : "Не установлен"
    }
    results.push({ test: "Переменные окружения", status: "info", data: envCheck })

    // 2. Проверяем создание клиента
    if (!supabase) {
      results.push({ test: "Создание клиента", status: "error", data: "Клиент не создан" })
      setConnectionStatus("Ошибка: Клиент не создан")
      setTestResults(results)
      return
    }
    results.push({ test: "Создание клиента", status: "success", data: "Клиент создан успешно" })

    // 3. Тестируем простой запрос
    try {
      const startTime = Date.now()
      const { data, error } = await supabase
        .from("pets")
        .select("count")
        .limit(1)
      
      const responseTime = Date.now() - startTime
      
      if (error) {
        results.push({ 
          test: "Тестовый запрос", 
          status: "error", 
          data: { error: error.message, responseTime: `${responseTime}ms` }
        })
      } else {
        results.push({ 
          test: "Тестовый запрос", 
          status: "success", 
          data: { response: "Успешно", responseTime: `${responseTime}ms` }
        })
      }
    } catch (err: any) {
      results.push({ 
        test: "Тестовый запрос", 
        status: "error", 
        data: { error: err.message }
      })
    }

    // 4. Проверяем таблицу pets
    try {
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .limit(5)
      
      if (error) {
        results.push({ 
          test: "Таблица pets", 
          status: "error", 
          data: { error: error.message }
        })
      } else {
        results.push({ 
          test: "Таблица pets", 
          status: "success", 
          data: { count: data?.length || 0, records: data }
        })
      }
    } catch (err: any) {
      results.push({ 
        test: "Таблица pets", 
        status: "error", 
        data: { error: err.message }
      })
    }

    // 5. Проверяем таблицу app_settings
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .limit(1)
      
      if (error) {
        results.push({ 
          test: "Таблица app_settings", 
          status: "error", 
          data: { error: error.message }
        })
      } else {
        results.push({ 
          test: "Таблица app_settings", 
          status: "success", 
          data: { count: data?.length || 0, records: data }
        })
      }
    } catch (err: any) {
      results.push({ 
        test: "Таблица app_settings", 
        status: "error", 
        data: { error: err.message }
      })
    }

    setTestResults(results)
    
    // Определяем общий статус
    const hasErrors = results.some(r => r.status === "error")
    const hasSuccess = results.some(r => r.status === "success")
    
    if (hasErrors && !hasSuccess) {
      setConnectionStatus("Ошибка подключения")
    } else if (hasErrors && hasSuccess) {
      setConnectionStatus("Частично работает")
    } else {
      setConnectionStatus("Подключение работает")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800"
      case "error": return "bg-red-100 text-red-800"
      case "info": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-8">
      <div className="container mx-auto max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Тест подключения к Supabase
              <Badge className={getStatusColor(connectionStatus === "Подключение работает" ? "success" : "error")}>
                {connectionStatus}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testConnection} className="mb-4">
              Повторить тест
            </Button>
            
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{result.test}</h3>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                    <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

