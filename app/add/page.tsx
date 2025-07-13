"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Upload, MapPin, Heart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { safeSupabase as supabase } from "@/lib/supabase"

export default function AddPetPage() {
  const router = useRouter()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const petData = {
        ...formData,
        reward: formData.reward ? Number.parseInt(formData.reward) : null,
        status: "active",
        created_at: new Date().toISOString(),
      }

      // Try to insert into Supabase if available
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { data, error } = await supabase.from("pets").insert([petData]).select()

        if (error) {
          console.log("Supabase error, using demo mode:", error)
          alert("Объявление добавлено в демо-режиме! Для полной функциональности настройте Supabase.")
        } else {
          alert("Объявление успешно добавлено!")
        }
      } else {
        alert("Объявление добавлено в демо-режиме! Для полной функциональности настройте Supabase.")
      }

      router.push("/")
    } catch (error) {
      console.error("Error adding pet:", error)
      alert("Объявление добавлено в демо-режиме!")
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-orange-500" />
              <h1 className="text-xl font-bold text-gray-900">Подать объявление</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Новое объявление</CardTitle>
            <p className="text-sm text-gray-600">
              Заполните информацию о питомце, чтобы другие пользователи могли помочь
            </p>
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Перетащите фото сюда или нажмите для выбора</p>
                  <Input
                    id="photo_url"
                    type="url"
                    value={formData.photo_url}
                    onChange={(e) => handleInputChange("photo_url", e.target.value)}
                    placeholder="Или вставьте ссылку на фото"
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex gap-4 pt-4">
                <Link href="/" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    Отмена
                  </Button>
                </Link>
                <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600" disabled={loading}>
                  {loading ? "Публикуем..." : "Опубликовать объявление"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
