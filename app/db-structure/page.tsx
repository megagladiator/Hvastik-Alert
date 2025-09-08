"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TableInfo {
  name: string
  columns: any[]
  rowCount: number
  sampleData: any[]
  error?: string
}

export default function DatabaseStructurePage() {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>("")

  const tableNames = ["pets", "messages", "app_settings"]

  const checkTableStructure = async () => {
    setIsLoading(true)
    const results: TableInfo[] = []

    for (const tableName of tableNames) {
      try {
        // Получаем данные из таблицы
        const { data, error } = await supabase
          .from(tableName)
          .select("*")
          .limit(10)

        if (error) {
          results.push({
            name: tableName,
            columns: [],
            rowCount: 0,
            sampleData: [],
            error: error.message
          })
        } else {
          // Определяем структуру колонок на основе данных
          const columns = data && data.length > 0 
            ? Object.keys(data[0]).map(key => ({
                name: key,
                type: typeof data[0][key],
                sampleValue: data[0][key]
              }))
            : []

          // Получаем общее количество записей
          const { count } = await supabase
            .from(tableName)
            .select("*", { count: "exact", head: true })

          results.push({
            name: tableName,
            columns,
            rowCount: count || 0,
            sampleData: data || []
          })
        }
      } catch (err: any) {
        results.push({
          name: tableName,
          columns: [],
          rowCount: 0,
          sampleData: [],
          error: err.message
        })
      }
    }

    setTables(results)
    setLastUpdate(new Date().toLocaleString())
    setIsLoading(false)
  }

  useEffect(() => {
    checkTableStructure()
  }, [])

  const getTableStatus = (table: TableInfo) => {
    if (table.error) return { status: "error", color: "bg-red-100 text-red-800" }
    if (table.rowCount === 0) return { status: "empty", color: "bg-yellow-100 text-yellow-800" }
    return { status: "ok", color: "bg-green-100 text-green-800" }
  }

  const getStatusIcon = (table: TableInfo) => {
    if (table.error) return "❌"
    if (table.rowCount === 0) return "⚠️"
    return "✅"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-8">
      <div className="container mx-auto max-w-6xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🗄️ Структура базы данных Supabase
              <Badge variant="outline">Анализ таблиц</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Button 
                onClick={checkTableStructure} 
                disabled={isLoading}
              >
                {isLoading ? "Проверяем..." : "🔄 Обновить"}
              </Button>
              {lastUpdate && (
                <Badge variant="outline">
                  Обновлено: {lastUpdate}
                </Badge>
              )}
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Обзор</TabsTrigger>
                <TabsTrigger value="structure">Структура</TabsTrigger>
                <TabsTrigger value="data">Данные</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tables.map((table, index) => {
                    const status = getTableStatus(table)
                    return (
                      <Card key={index} className={`border-l-4 ${status.color}`}>
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            {getStatusIcon(table)} {table.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Записей:</span>
                              <Badge variant="outline">{table.rowCount}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Колонок:</span>
                              <Badge variant="outline">{table.columns.length}</Badge>
                            </div>
                            {table.error && (
                              <Alert>
                                <AlertDescription className="text-sm">
                                  {table.error}
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="structure" className="space-y-4">
                {tables.map((table, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(table)} Таблица: {table.name}
                        <Badge variant="outline">{table.columns.length} колонок</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {table.error ? (
                        <Alert>
                          <AlertDescription>{table.error}</AlertDescription>
                        </Alert>
                      ) : table.columns.length === 0 ? (
                        <Alert>
                          <AlertDescription>Таблица пуста или недоступна</AlertDescription>
                        </Alert>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="border border-gray-300 px-3 py-2 text-left">Колонка</th>
                                <th className="border border-gray-300 px-3 py-2 text-left">Тип</th>
                                <th className="border border-gray-300 px-3 py-2 text-left">Пример значения</th>
                              </tr>
                            </thead>
                            <tbody>
                              {table.columns.map((column, colIndex) => (
                                <tr key={colIndex}>
                                  <td className="border border-gray-300 px-3 py-2 font-mono">
                                    {column.name}
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2">
                                    <Badge variant="secondary">{column.type}</Badge>
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2">
                                    <code className="text-sm bg-gray-100 px-1 rounded">
                                      {column.sampleValue !== null 
                                        ? JSON.stringify(column.sampleValue).substring(0, 50)
                                        : "null"
                                      }
                                    </code>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="data" className="space-y-4">
                {tables.map((table, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(table)} Данные: {table.name}
                        <Badge variant="outline">
                          {table.sampleData.length} из {table.rowCount} записей
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {table.error ? (
                        <Alert>
                          <AlertDescription>{table.error}</AlertDescription>
                        </Alert>
                      ) : table.sampleData.length === 0 ? (
                        <Alert>
                          <AlertDescription>Нет данных для отображения</AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-4">
                          {table.sampleData.map((row, rowIndex) => (
                            <Card key={rowIndex} className="bg-gray-50">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline">Запись {rowIndex + 1}</Badge>
                                </div>
                                <pre className="text-sm overflow-auto bg-white p-3 rounded border">
                                  {JSON.stringify(row, null, 2)}
                                </pre>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
