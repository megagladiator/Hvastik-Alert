"use client"

import { useState, type ChangeEvent, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider" // Assuming Slider is available from shadcn/ui
import { Upload, ImageIcon, CheckCircle, Loader2 } from "lucide-react"
import { safeSupabase as supabase } from "@/lib/supabase"

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
      const { data, error } = await supabase.from("app_settings").select("*").eq("id", SETTINGS_ROW_ID).single()

      if (error) {
        console.error("Error fetching app settings:", error)
        // Fallback to default if settings not found or error
        setDarkeningPercentage([50])
        setCurrentImageUrl("/placeholder.svg?height=1080&width=1920")
      } else if (data) {
        setDarkeningPercentage([data.background_darkening_percentage])
        setCurrentImageUrl(data.background_image_url)
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
      // Real upload to Supabase Storage
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const filePath = `backgrounds/homepage-bg-${Date.now()}-${selectedFile.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("background-images") // Ensure you have a bucket named 'background-images' in Supabase Storage
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          console.error("Error uploading image to Supabase Storage:", uploadError)
          alert("Ошибка загрузки изображения в хранилище.")
          setUploading(false)
          return
        }

        const publicUrl = supabase.storage.from("background-images").getPublicUrl(uploadData.path).data.publicUrl

        // Update the app_settings table with the new URL
        const { error: updateError } = await supabase
          .from("app_settings")
          .update({ background_image_url: publicUrl, updated_at: new Date().toISOString() })
          .eq("id", SETTINGS_ROW_ID)

        if (updateError) {
          console.error("Error updating app settings in DB:", updateError)
          alert("Ошибка сохранения URL изображения в базе данных.")
        } else {
          setCurrentImageUrl(publicUrl) // Update current image URL in state
          alert("Изображение успешно загружено и установлено как фон!")
          setUploadSuccess(true)
        }
      } else {
        // Demo mode if Supabase env vars are not set
        await new Promise((resolve) => setTimeout(resolve, 2000))
        console.log("Simulated upload of:", selectedFile.name)
        alert("Изображение успешно загружено и установлено как фон (демо-режим)!")
        setUploadSuccess(true)
        // In demo, we don't actually change the background, just show success
      }
    } catch (error) {
      console.error("Unexpected error during upload:", error)
      alert("Произошла непредвиденная ошибка.")
    } finally {
      setUploading(false)
    }
  }

  const handleDarkeningChange = async (value: number[]) => {
    setDarkeningPercentage(value)
    try {
      // Update the app_settings table with the new darkening percentage
      const { error } = await supabase
        .from("app_settings")
        .update({ background_darkening_percentage: value[0], updated_at: new Date().toISOString() })
        .eq("id", SETTINGS_ROW_ID)

      if (error) {
        console.error("Error updating darkening percentage:", error)
        alert("Ошибка сохранения процента затемнения.")
      } else {
        console.log("Darkening percentage updated successfully:", value[0])
      }
    } catch (error) {
      console.error("Unexpected error during darkening update:", error)
    }
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

        {/* Darkening Percentage Slider */}
        <div className="space-y-4 pt-4 border-t">
          <Label htmlFor="darkening-slider">Процент затемнения фона: {darkeningPercentage[0]}%</Label>
          <Slider
            id="darkening-slider"
            min={0}
            max={100}
            step={1}
            value={darkeningPercentage}
            onValueChange={handleDarkeningChange}
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
