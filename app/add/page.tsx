"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, MapPin, Heart } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSupabaseSession } from "@/hooks/use-supabase-session"
import { safeSupabase as supabase } from "@/lib/supabase"
import { v5 as uuidv5 } from 'uuid'
import { uploadLocalImageToSupabase, isValidProductionUrl, getProductionPlaceholder, validateImage, validateImageDimensions, compressImage } from '@/lib/image-upload'

export default function AddPetPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useSupabaseSession()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: "lost",
    animal_type: "",
    breed: "",
    name: "",
    description: "",
    color: "",
    location: "",
    latitude: 44.8951,
    longitude: 37.3142,
    contact_phone: "",
    contact_name: "",
    reward: "",
    photo_url: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")

  const searchParams = useSearchParams()
  const editId = searchParams.get("id")
  const fromAdmin = searchParams.get("from") === "admin"

  // Функция для генерации UUID из NextAuth.js ID
  const generateUserId = (nextAuthId: string | undefined): string | null => {
    if (!nextAuthId) return null
    // Используем namespace UUID для генерации детерминированного UUID
    const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
    return uuidv5(nextAuthId, namespace)
  }

  // Загрузка объявления для редактирования
  useEffect(() => {
    const fetchPetForEdit = async () => {
      if (editId && supabase) {
        const { data, error } = await supabase.from("pets").select("*").eq("id", editId).single()
        if (data) {
          setFormData({
            type: data.type || "lost",
            animal_type: data.animal_type || "",
            breed: data.breed || "",
            name: data.name || "",
            description: data.description || "",
            color: data.color || "",
            location: data.location || "",
            latitude: data.latitude || 44.8951,
            longitude: data.longitude || 37.3142,
            contact_phone: data.contact_phone || "",
            contact_name: data.contact_name || "",
            reward: data.reward?.toString() || "",
            photo_url: data.photo_url || "",
          })
          if (data.photo_url) {
            // Проверяем, является ли URL валидным (не локальным blob URL)
            if (data.photo_url.startsWith('http') || data.photo_url.startsWith('data:')) {
              setPreviewUrl(data.photo_url)
              console.log('Загружено изображение из базы данных:', data.photo_url)
            } else {
              // Если это не валидный URL, очищаем предпросмотр
              setPreviewUrl("")
            }
          } else {
            setPreviewUrl("")
          }
        }
      }
    }
    fetchPetForEdit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Обрабатываем изображение для продакшена
      let finalPhotoUrl = formData.photo_url
      
      // Если есть выбранный файл, но нет URL, значит файл был загружен через handleFileSelect
      // и URL уже должен быть в formData.photo_url
      if (selectedFile && !finalPhotoUrl) {
        console.log('⚠️ Есть выбранный файл, но нет URL. Файл мог не загрузиться.')
        // Попробуем загрузить файл заново
        try {
          const formDataUpload = new FormData()
          formDataUpload.append('file', selectedFile)
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formDataUpload,
          })
          
          if (uploadResponse.ok) {
            const result = await uploadResponse.json()
            finalPhotoUrl = result.url
            console.log('✅ Файл загружен повторно:', finalPhotoUrl)
          }
        } catch (error) {
          console.error('❌ Ошибка повторной загрузки файла:', error)
        }
      }
      
      if (finalPhotoUrl) {
        console.log('🖼️ Обработка изображения:', finalPhotoUrl)
        
        // Проверяем, подходит ли URL для продакшена
        if (!isValidProductionUrl(finalPhotoUrl)) {
          console.log('🔄 Загружаем изображение в Supabase Storage...')
          
          // Пытаемся загрузить в Supabase Storage
          const uploadedUrl = await uploadLocalImageToSupabase(finalPhotoUrl)
          
          if (uploadedUrl) {
            finalPhotoUrl = uploadedUrl
            console.log('✅ Изображение загружено в Supabase Storage:', finalPhotoUrl)
          } else {
            // Если не удалось загрузить, используем placeholder
            finalPhotoUrl = getProductionPlaceholder()
            console.log('⚠️ Используем placeholder изображение:', finalPhotoUrl)
          }
        } else {
          console.log('✅ URL подходит для продакшена:', finalPhotoUrl)
        }
      }
      
      console.log('🖼️ Финальный URL изображения:', {
        originalUrl: formData.photo_url,
        finalPhotoUrl: finalPhotoUrl,
        selectedFile: selectedFile?.name
      })

      console.log('👤 Информация о пользователе:', {
        userId: user?.id,
        userEmail: user?.email,
        isAuthenticated: !!user
      })

      const petData = {
        ...formData,
        reward: formData.reward ? Number.parseInt(formData.reward) : null,
        status: "active",
        created_at: new Date().toISOString(),
        user_id: user?.id, // Используем Supabase user ID
        photo_url: finalPhotoUrl, // Сохраняем photo_url
      }

      // Используем API route для сохранения
      try {
        const response = await fetch('/api/pets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            petData,
            userId: user?.id,
            userEmail: user?.email,
            editId: editId || null
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Ошибка при сохранении объявления')
        }

        if (editId) {
          alert("Объявление успешно обновлено!")
        } else if (user) {
          alert("Объявление успешно добавлено и привязано к вашему аккаунту!")
        } else {
          alert("Объявление успешно добавлено анонимно!")
        }
      } catch (apiError: any) {
        console.error("API error:", apiError)
        alert(`Ошибка при сохранении объявления: ${apiError.message}`)
      }

      // Редиректим в зависимости от того, откуда пришел пользователь
      if (fromAdmin) {
        router.push("/admin?tab=tables")
      } else if (user) {
        router.push("/cabinet")
      } else {
        router.push("/")
      }
    } catch (error: any) {
      console.error("Error adding pet:", error)
      alert(`Произошла ошибка: ${error.message}`)
      // Редиректим в зависимости от того, откуда пришел пользователь
      if (fromAdmin) {
        router.push("/admin?tab=tables")
      } else if (user) {
        router.push("/cabinet")
      } else {
        router.push("/")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Валидируем файл
      const validation = validateImage(file)
      if (!validation.valid) {
        alert(`❌ ${validation.error}`)
        return
      }

      // Валидируем размеры изображения
      const dimensionValidation = await validateImageDimensions(file)
      if (!dimensionValidation.valid) {
        alert(`❌ ${dimensionValidation.error}`)
        return
      }

      // Сжимаем изображение если нужно
      let finalFile = file
      if (file.size > 2 * 1024 * 1024) { // Если больше 2MB, сжимаем
        console.log('🔄 Сжимаем изображение...')
        finalFile = await compressImage(file)
        console.log(`✅ Изображение сжато: ${(file.size / 1024 / 1024).toFixed(1)}MB → ${(finalFile.size / 1024 / 1024).toFixed(1)}MB`)
      }

      setSelectedFile(finalFile)
      
      // Создаем локальный предпросмотр
      const url = URL.createObjectURL(finalFile)
      setPreviewUrl(url)
      
      // Загружаем файл в Supabase Storage
      const formData = new FormData()
      formData.append('file', finalFile)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (response.ok) {
        // Сохраняем URL из Supabase Storage
        setFormData((prev) => ({ ...prev, photo_url: result.url }))
        console.log('✅ Файл успешно загружен в Supabase:', result.url)
      } else {
        console.error('❌ Ошибка загрузки файла:', result.error)
        console.log('📤 Ответ сервера:', result)
        alert('❌ Ошибка загрузки файла. Попробуйте другое изображение.')
      }
    } catch (error) {
      console.error('Ошибка обработки файла:', error)
      alert('❌ Ошибка обработки файла. Попробуйте другое изображение.')
    }
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (!file || !file.type.startsWith('image/')) return

    try {
      // Валидируем файл
      const validation = validateImage(file)
      if (!validation.valid) {
        alert(`❌ ${validation.error}`)
        return
      }

      // Валидируем размеры изображения
      const dimensionValidation = await validateImageDimensions(file)
      if (!dimensionValidation.valid) {
        alert(`❌ ${dimensionValidation.error}`)
        return
      }

      // Сжимаем изображение если нужно
      let finalFile = file
      if (file.size > 2 * 1024 * 1024) { // Если больше 2MB, сжимаем
        console.log('🔄 Сжимаем изображение...')
        finalFile = await compressImage(file)
        console.log(`✅ Изображение сжато: ${(file.size / 1024 / 1024).toFixed(1)}MB → ${(finalFile.size / 1024 / 1024).toFixed(1)}MB`)
      }

      setSelectedFile(finalFile)
      
      // Создаем локальный предпросмотр
      const url = URL.createObjectURL(finalFile)
      setPreviewUrl(url)
      
      // Загружаем файл в Supabase Storage
      const formData = new FormData()
      formData.append('file', finalFile)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (response.ok) {
        // Сохраняем URL из Supabase Storage
        setFormData((prev) => ({ ...prev, photo_url: result.url }))
        console.log('✅ Файл успешно загружен в Supabase:', result.url)
      } else {
        console.error('❌ Ошибка загрузки файла:', result.error)
        console.log('📤 Ответ сервера:', result)
        alert('❌ Ошибка загрузки файла. Попробуйте другое изображение.')
      }
    } catch (error) {
      console.error('Ошибка обработки файла:', error)
      alert('❌ Ошибка обработки файла. Попробуйте другое изображение.')
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleCancel = () => {
    // Редиректим в зависимости от того, откуда пришел пользователь
    if (fromAdmin) {
      router.push("/admin?tab=tables")
    } else if (user) {
      router.push("/cabinet")
    } else {
      router.push("/")
    }
  }

  const openFileDialog = () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement
    fileInput?.click()
  }

  const clearPreview = async () => {
    // Если есть текущее изображение из Supabase, удаляем его
    const currentUrl = formData.photo_url
    if (currentUrl && currentUrl.includes('supabase')) {
      try {
        // Извлекаем имя файла из URL
        const fileName = currentUrl.split('/').pop()
        if (fileName) {
          await fetch('/api/upload/delete', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fileName }),
          })
          console.log('Старый файл удален из Supabase Storage')
        }
      } catch (error) {
        console.error('Ошибка при удалении файла:', error)
      }
    }
    
    setPreviewUrl("")
    setSelectedFile(null)
    setFormData(prev => ({ ...prev, photo_url: "" }))
  }

  const handleLocationSelect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }))
          alert("Местоположение определено!")
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Не удалось определить местоположение")
        },
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-orange-500" />
            <h1 className="text-xl font-bold text-gray-900">Подать объявление</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{editId ? "Редактировать объявление" : "Новое объявление"}</CardTitle>
            <p className="text-sm text-gray-600">
              Заполните информацию о питомце, чтобы другие пользователи могли помочь
            </p>
            <div className="mt-2 text-xs text-gray-500">
              {user?.email ? (
                <>Вы добавляете объявление как: <span className="font-semibold">{user.email}</span></>
              ) : (
                <>Вы добавляете объявление <span className="font-semibold">анонимно</span></>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Тип объявления */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Тип объявления</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lost" id="lost" />
                    <Label htmlFor="lost" className="cursor-pointer">
                      Потерялся питомец
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="found" id="found" />
                    <Label htmlFor="found" className="cursor-pointer">
                      Найден питомец
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Основная информация */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="animal_type">Вид животного *</Label>
                  <Select
                    value={formData.animal_type}
                    onValueChange={(value) => handleInputChange("animal_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите вид" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Собака</SelectItem>
                      <SelectItem value="cat">Кошка</SelectItem>
                      <SelectItem value="bird">Птица</SelectItem>
                      <SelectItem value="rabbit">Кролик</SelectItem>
                      <SelectItem value="other">Другое</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breed">Порода *</Label>
                  <Input
                    id="breed"
                    value={formData.breed}
                    onChange={(e) => handleInputChange("breed", e.target.value)}
                    placeholder="Например: Лабрадор, Персидская"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Кличка</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder={formData.type === "found" ? "Неизвестно" : "Кличка питомца"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Окрас *</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    placeholder="Например: Рыжий, Черно-белый"
                    required
                  />
                </div>
              </div>

              {/* Описание */}
              <div className="space-y-2">
                <Label htmlFor="description">Описание *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Подробное описание питомца, особые приметы, обстоятельства потери/находки..."
                  rows={4}
                  required
                />
              </div>

              {/* Местоположение */}
              <div className="space-y-2">
                <Label htmlFor="location">Место потери/находки *</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Например: Центральный пляж, ул. Ленина"
                    required
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={handleLocationSelect}>
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Нажмите на кнопку с картой для определения текущего местоположения
                </p>
              </div>

              {/* Контакты */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Ваше имя *</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => handleInputChange("contact_name", e.target.value)}
                    placeholder="Как к вам обращаться"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Телефон *</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => handleInputChange("contact_phone", e.target.value)}
                    placeholder="+7 (918) 123-45-67"
                    required
                  />
                </div>
              </div>

              {/* Вознаграждение */}
              {formData.type === "lost" && (
                <div className="space-y-2">
                  <Label htmlFor="reward">Вознаграждение (необязательно)</Label>
                  <Input
                    id="reward"
                    type="number"
                    value={formData.reward}
                    onChange={(e) => handleInputChange("reward", e.target.value)}
                    placeholder="Сумма в рублях"
                    min="0"
                  />
                </div>
              )}

              {/* Фото */}
              <div className="space-y-2">
                <Label htmlFor="photo_url">Фото питомца</Label>
                <p className="text-xs text-gray-500">
                  Поддерживаемые форматы: JPEG, PNG, WebP, GIF. Максимальный размер: 5MB. 
                  Рекомендуемое разрешение: 100x100 - 2048x2048px. Изображения больше 2MB будут автоматически сжаты.
                </p>
                
                {/* Скрытый input для выбора файла */}
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors"
                  onClick={openFileDialog}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {previewUrl ? (
                    <div className="space-y-2">
                      <img 
                        src={previewUrl} 
                        alt="Предпросмотр" 
                        className="max-h-48 mx-auto rounded-lg object-cover"
                        onError={() => {
                          // Если изображение не загружается, очищаем предпросмотр
                          setPreviewUrl("")
                          setFormData(prev => ({ ...prev, photo_url: "" }))
                        }}
                      />
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-sm text-green-600">Фото выбрано! Нажмите для изменения</p>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            clearPreview()
                          }}
                          className="text-xs"
                        >
                          Удалить
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Перетащите фото сюда или нажмите для выбора</p>
                    </>
                  )}
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">Или вставьте ссылку на фото:</p>
                  <Input
                    id="photo_url"
                    type="url"
                    value={formData.photo_url}
                    onChange={(e) => {
                      handleInputChange("photo_url", e.target.value)
                      if (e.target.value) {
                        setPreviewUrl(e.target.value)
                        setSelectedFile(null)
                      } else {
                        setPreviewUrl("")
                      }
                    }}
                    placeholder="https://example.com/photo.jpg"
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 bg-transparent"
                  onClick={handleCancel}
                >
                  Отмена
                </Button>
                <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600" disabled={loading}>
                  {editId ? (loading ? "Сохраняем..." : "Сохранить изменения") : (loading ? "Публикуем..." : "Опубликовать объявление")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
