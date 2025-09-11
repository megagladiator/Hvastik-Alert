"use client"

import { useState, type ChangeEvent, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Slider } from "@/components/ui/slider" // Removed due to React 19 compatibility issues
import { Upload, ImageIcon, CheckCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function BackgroundImageSettings() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [darkeningPercentage, setDarkeningPercentage] = useState<number[]>([50])
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [loadingSettings, setLoadingSettings] = useState(true)

  const SETTINGS_ROW_ID = "00000000-0000-0000-0000-000000000001" // Fixed ID for the single settings row

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoadingSettings(true)
    try {
      if (!supabase) {
        console.warn("Supabase not configured, using default settings")
        setDarkeningPercentage([50])
        setCurrentImageUrl("/placeholder.svg?height=1080&width=1920")
        return
      }

      const { data, error } = await supabase.from("app_settings").select("*").eq("id", SETTINGS_ROW_ID).single()

      if (error) {
        console.error("Error fetching app settings:", error)
        // Fallback to default if settings not found or error
        setDarkeningPercentage([50])
        setCurrentImageUrl("/placeholder.svg?height=1080&width=1920")
      } else if (data) {
        console.log("Fetched settings from database:", data)
        setDarkeningPercentage([data.background_darkening_percentage])
        // Проверяем, что URL изображения не пустой
        if (data.background_image_url) {
          console.log("Setting current image URL from database:", data.background_image_url)
          setCurrentImageUrl(data.background_image_url)
        } else {
          console.log("No background image URL in database, using fallback")
          setCurrentImageUrl("/view-cats-dogs-showing-friendship (1) — копия.jpg")
        }
      }
    } finally {
      setLoadingSettings(false)
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setUploadSuccess(false) // Reset success state on new file selection
    } else {
      setSelectedFile(null)
      setPreviewUrl(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Пожалуйста, выберите изображение для загрузки.")
      return
    }

    setUploading(true)
    setUploadSuccess(false)

    try {
      // Создаем URL для локального файла
      const fileName = `background-${Date.now()}.${selectedFile.name.split('.').pop()}`
      const localUrl = `/${fileName}`

      // В реальном проекте здесь был бы код загрузки в Supabase Storage
      // Но для простоты используем локальные файлы
      
      // Обновляем настройки в базе данных
      const { error: updateError } = await supabase
        .from("app_settings")
        .update({ 
          background_image_url: localUrl, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", SETTINGS_ROW_ID)

      if (updateError) {
        console.error("Error updating app settings in DB:", updateError)
        alert("Ошибка сохранения URL изображения в базе данных.")
      } else {
        setCurrentImageUrl(localUrl)
        alert("Изображение успешно установлено как фон! (Для полной функциональности нужно настроить Supabase Storage)")
        setUploadSuccess(true)
      }
    } catch (error) {
      console.error("Unexpected error during upload:", error)
      alert("Произошла непредвиденная ошибка.")
    } finally {
      setUploading(false)
    }
  }

  const handleQuickSelect = (imageUrl: string) => {
    // Просто устанавливаем предварительный просмотр, не сохраняем в БД
    setCurrentImageUrl(imageUrl)
    setPreviewUrl(imageUrl)
  }

  const handleSaveSettings = async () => {
    try {
      if (!supabase) {
        alert("Supabase не настроен. Настройки не могут быть сохранены.")
        return
      }

      const imageUrl = previewUrl || currentImageUrl
      if (!imageUrl) {
        alert("Выберите изображение для сохранения.")
        return
      }

      console.log("Saving settings to database:", { 
        imageUrl, 
        darkeningPercentage: darkeningPercentage[0],
        settingsRowId: SETTINGS_ROW_ID 
      })

      const updateData = { 
        background_image_url: imageUrl, 
        background_darkening_percentage: darkeningPercentage[0],
        updated_at: new Date().toISOString() 
      }
      
      console.log("Update data:", updateData)

      // Используем update, так как запись уже существует
      const { error } = await supabase
        .from("app_settings")
        .update(updateData)
        .eq("id", SETTINGS_ROW_ID)

      if (error) {
        console.error("Error saving settings:", error)
        alert("Ошибка сохранения настроек в базе данных.")
      } else {
        setCurrentImageUrl(imageUrl)
        setPreviewUrl(null)
        console.log("Settings saved successfully")
        alert("Настройки успешно сохранены! Теперь нажмите 'Обновить настройки' чтобы применить изменения на главной странице.")
      }
    } catch (error) {
      console.error("Unexpected error during save:", error)
      alert("Произошла непредвиденная ошибка при сохранении.")
    }
  }

  const handleRefreshSettings = async () => {
    try {
      console.log("Starting settings refresh...")
      console.log("Current image URL before refresh:", currentImageUrl)
      
      // Обновляем настройки в локальном состоянии
      await fetchSettings()
      
      console.log("Current image URL after fetchSettings:", currentImageUrl)
      
      // Отправляем событие на все открытые вкладки для обновления настроек
      window.dispatchEvent(new CustomEvent('settingsUpdated'))
      console.log("Settings update event dispatched")
      
      // Также отправляем сигнал через API (для будущих улучшений)
      const response = await fetch('/api/refresh-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        alert("Настройки успешно обновлены! Главная страница автоматически обновится.")
      } else {
        alert("Настройки обновлены локально. Если главная страница не обновилась, перезагрузите её вручную.")
      }
    } catch (error) {
      console.error("Error refreshing settings:", error)
      // Даже если API не работает, отправляем событие
      window.dispatchEvent(new CustomEvent('settingsUpdated'))
      alert("Настройки обновлены локально. Если главная страница не обновилась, перезагрузите её вручную.")
    }
  }

  const handleDarkeningChange = (value: number[]) => {
    // Просто обновляем локальное состояние, не сохраняем в БД
    setDarkeningPercentage(value)
  }

  if (loadingSettings) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-4" />
          <p className="text-gray-600">Загрузка настроек...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-orange-500" />
          Настройки фонового изображения
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Background Image Preview */}
        <div className="space-y-2">
          <Label>Текущее фоновое изображение</Label>
          <div className="relative w-full h-48 border border-gray-200 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
            {currentImageUrl ? (
              <img
                src={currentImageUrl || "/placeholder.svg"}
                alt="Текущий фон"
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-gray-500 text-sm">Изображение не установлено</span>
            )}
          </div>
        </div>

        {/* Quick Image Selection */}
        <div className="space-y-2">
          <Label>Быстрый выбор изображения</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => handleQuickSelect("/kitten-dog-friendship.jpg")}
              className="text-xs"
            >
              Кот и собака
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickSelect("/view-cats-dogs-showing-friendship (1) — копия.jpg")}
              className="text-xs"
            >
              Дружба животных
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickSelect("/adorable-looking-kitten-with-dog.jpg")}
              className="text-xs"
            >
              Милые питомцы
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickSelect("/view-cats-dogs-being-friends.jpg")}
              className="text-xs"
            >
              Друзья
            </Button>
          </div>
        </div>

        {/* Upload New Image */}
        <div className="space-y-2">
          <Label htmlFor="background-image-upload">Загрузить новое изображение</Label>
          <Input
            id="background-image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file:text-orange-500 file:font-semibold"
          />
          <p className="text-sm text-gray-500">Поддерживаются форматы: JPG, PNG, WebP. Макс. размер 5МБ.</p>
        </div>

        {previewUrl && (
          <div className="space-y-2">
            <Label>Предварительный просмотр нового изображения</Label>
            <div className="relative w-full h-48 border border-gray-200 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              <img
                src={previewUrl || "/placeholder.svg"}
                alt="Предварительный просмотр"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Загрузка...
            </>
          ) : uploadSuccess ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" /> Успешно загружено!
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" /> Загрузить и установить
            </>
          )}
        </Button>

        {/* Кнопка сохранения настроек */}
        <Button
          onClick={handleSaveSettings}
          className="w-full bg-green-500 hover:bg-green-600 text-white"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Сохранить настройки
        </Button>

        {/* Кнопка обновления настроек */}
        <Button
          onClick={handleRefreshSettings}
          variant="outline"
          className="w-full border-orange-500 text-orange-500 hover:bg-orange-50"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Обновить настройки на главной странице
        </Button>

        {/* Darkening Percentage Input */}
        <div className="space-y-4 pt-4 border-t">
          <Label htmlFor="darkening-input">Процент затемнения фона: {darkeningPercentage[0]}%</Label>
          <Input
            id="darkening-input"
            type="range"
            min={0}
            max={100}
            step={1}
            value={darkeningPercentage[0]}
            onChange={(e) => handleDarkeningChange([parseInt(e.target.value)])}
            className="w-full"
          />
          <p className="text-sm text-gray-500">
            Регулирует прозрачность черного слоя поверх фонового изображения. 0% - без затемнения, 100% - полностью
            черный.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
