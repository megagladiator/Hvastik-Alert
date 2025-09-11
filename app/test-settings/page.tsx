"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function TestSettingsPage() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>([])

  const SETTINGS_ROW_ID = "00000000-0000-0000-0000-000000000001"

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const fetchSettings = async () => {
    setLoading(true)
    addLog("Начинаем загрузку настроек...")
    
    try {
      if (!supabase) {
        addLog("❌ Supabase не настроен")
        return
      }

      addLog("✅ Supabase настроен, делаем запрос к БД...")
      
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .eq("id", SETTINGS_ROW_ID)
        .single()

      if (error) {
        addLog(`❌ Ошибка при загрузке: ${error.message}`)
        return
      }

      if (data) {
        addLog(`✅ Настройки загружены: ${JSON.stringify(data, null, 2)}`)
        setSettings(data)
      } else {
        addLog("❌ Настройки не найдены")
      }
    } catch (error: any) {
      addLog(`❌ Неожиданная ошибка: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async () => {
    addLog("Начинаем обновление настроек...")
    
    try {
      if (!supabase) {
        addLog("❌ Supabase не настроен")
        return
      }

      // Чередуем между разными изображениями
      const currentUrl = settings?.background_image_url
      const newImageUrl = currentUrl === "/kitten-dog-friendship.jpg" 
        ? "/adorable-looking-kitten-with-dog.jpg" 
        : "/kitten-dog-friendship.jpg"
      
      addLog(`Текущий URL: ${currentUrl}`)
      addLog(`Обновляем URL изображения на: ${newImageUrl}`)

      const updateData = { 
        background_image_url: newImageUrl,
        updated_at: new Date().toISOString() 
      }
      
      addLog(`Данные для обновления: ${JSON.stringify(updateData)}`)

      const { error } = await supabase
        .from("app_settings")
        .update(updateData)
        .eq("id", SETTINGS_ROW_ID)

      if (error) {
        addLog(`❌ Ошибка при обновлении: ${error.message}`)
        addLog(`Детали ошибки: ${JSON.stringify(error)}`)
        return
      }

      addLog("✅ Настройки обновлены в БД")
      
      // Перезагружаем настройки
      await fetchSettings()
      
    } catch (error: any) {
      addLog(`❌ Неожиданная ошибка при обновлении: ${error.message}`)
    }
  }

  const testEvent = () => {
    addLog("Отправляем событие settingsUpdated...")
    window.dispatchEvent(new CustomEvent('settingsUpdated'))
    addLog("✅ Событие отправлено")
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Тест настроек фонового изображения</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Текущие настройки */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Текущие настройки</h2>
          {loading ? (
            <p>Загрузка...</p>
          ) : settings ? (
            <div>
              <p><strong>ID:</strong> {settings.id}</p>
              <p><strong>Background Image URL:</strong> {settings.background_image_url || "НЕ УСТАНОВЛЕН"}</p>
              <p><strong>Darkening %:</strong> {settings.background_darkening_percentage}</p>
              <p><strong>Updated At:</strong> {settings.updated_at}</p>
              
              {settings.background_image_url && (
                <div className="mt-4">
                  <p><strong>Предварительный просмотр:</strong></p>
                  <img 
                    src={settings.background_image_url} 
                    alt="Background preview" 
                    className="w-full h-32 object-cover rounded"
                    onError={(e) => {
                      addLog(`❌ Ошибка загрузки изображения: ${settings.background_image_url}`)
                      e.currentTarget.style.display = 'none'
                    }}
                    onLoad={() => addLog(`✅ Изображение загружено: ${settings.background_image_url}`)}
                  />
                </div>
              )}
            </div>
          ) : (
            <p>Настройки не найдены</p>
          )}
        </div>

        {/* Действия */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Действия</h2>
          <div className="space-y-2">
            <button 
              onClick={fetchSettings}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Обновить настройки
            </button>
            
            <button 
              onClick={updateSettings}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Установить новое изображение
            </button>
            
            <button 
              onClick={testEvent}
              className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Отправить событие settingsUpdated
            </button>
            
            <button 
              onClick={async () => {
                addLog("Принудительно обновляем на другое изображение...")
                const newUrl = "/view-cats-dogs-being-friends.jpg"
                addLog(`Устанавливаем: ${newUrl}`)
                
                const { error } = await supabase
                  .from("app_settings")
                  .update({ 
                    background_image_url: newUrl,
                    updated_at: new Date().toISOString() 
                  })
                  .eq("id", SETTINGS_ROW_ID)
                
                if (error) {
                  addLog(`❌ Ошибка: ${error.message}`)
                } else {
                  addLog("✅ Принудительное обновление выполнено")
                  await fetchSettings()
                }
              }}
              className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Принудительное обновление
            </button>
            
            <button 
              onClick={async () => {
                addLog("Тестируем upsert (вставка/обновление)...")
                const newUrl = "/adorable-looking-kitten-with-dog (1).jpg"
                addLog(`Upsert с URL: ${newUrl}`)
                
                const { error } = await supabase
                  .from("app_settings")
                  .upsert({ 
                    id: SETTINGS_ROW_ID,
                    background_image_url: newUrl,
                    background_darkening_percentage: 30,
                    updated_at: new Date().toISOString() 
                  })
                
                if (error) {
                  addLog(`❌ Ошибка upsert: ${error.message}`)
                  addLog(`Детали: ${JSON.stringify(error)}`)
                } else {
                  addLog("✅ Upsert выполнен")
                  await fetchSettings()
                }
              }}
              className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Тест Upsert
            </button>
          </div>
        </div>
      </div>

      {/* Логи */}
      <div className="mt-6 bg-black text-green-400 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Логи:</h3>
        <div className="max-h-64 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="text-sm font-mono">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
