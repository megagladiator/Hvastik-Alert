"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Calendar, Heart, Share2 } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { safeSupabase as supabase } from "@/lib/supabase"
import { ContactInfo } from "@/components/contact-info"

interface Pet {
  id: string
  type: "lost" | "found"
  animal_type: string
  breed: string
  name: string
  description: string
  color: string
  location: string
  latitude: number
  longitude: number
  contact_phone: string
  contact_name: string
  user_id?: string
  reward?: number
  photo_url?: string
  created_at: string
  status: "active" | "found" | "archived"
}

export default function PetDetailPage() {
  const params = useParams()
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    fetchPet()
    fetchCurrentUser()
  }, [params.id])

  const fetchCurrentUser = async () => {
    try {
      if (supabase && 'auth' in supabase) {
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user)
      }
    } catch (error) {
      console.error("Error fetching current user:", error)
    }
  }

  const fetchPet = async () => {
    try {
      // Only try Supabase if properly configured
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { data, error } = await supabase.from("pets").select("*").eq("id", params.id).single()

        if (!error && data) {
          setPet(data)
          return
        }
      }

      // Fallback to demo data based on ID
      console.log("Using demo data for pet detail")
      const demoData: Pet = {
        id: params.id as string,
        type: "lost",
        animal_type: "dog",
        breed: "Лабрадор",
        name: "Рекс",
        description:
          "Дружелюбный золотистый лабрадор, очень активный. Потерялся в районе центрального пляжа во время вечерней прогулки. Очень любит детей и других собак. Откликается на кличку Рекс. Носит красный ошейник с медальоном.",
        color: "Золотистый",
        location: "Центральный пляж, Анапа",
        latitude: 44.8951,
        longitude: 37.3142,
        contact_phone: "+7 (918) 123-45-67",
        contact_name: "Анна",
        reward: 5000,
        photo_url: "/placeholder.svg?height=400&width=600",
        created_at: "2024-01-15T10:00:00Z",
        status: "active",
      }
      setPet(demoData)
    } catch (error) {
      console.error("Error fetching pet:", error)
      // Show demo data even on error
      const demoData: Pet = {
        id: params.id as string,
        type: "lost",
        animal_type: "dog",
        breed: "Лабрадор",
        name: "Рекс",
        description: "Дружелюбный золотистый лабрадор, очень активный. Потерялся в районе центрального пляжа.",
        color: "Золотистый",
        location: "Центральный пляж, Анапа",
        latitude: 44.8951,
        longitude: 37.3142,
        contact_phone: "+7 (918) 123-45-67",
        contact_name: "Анна",
        reward: 5000,
        photo_url: "/placeholder.svg?height=400&width=600",
        created_at: "2024-01-15T10:00:00Z",
        status: "active",
      }
      setPet(demoData)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${pet?.type === "lost" ? "Потерялся" : "Найден"} ${pet?.name} - ${pet?.breed}`,
          text: pet?.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Ссылка скопирована в буфер обмена!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загружаем информацию...</p>
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Объявление не найдено</p>
          <Link href="/">
            <Button>Вернуться на главную</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-orange-500" />
                <h1 className="text-xl font-bold text-gray-900">Хвостик Alert</h1>
              </div>
            </div>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Поделиться
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo */}
            <Card>
              <CardContent className="p-0">
                <img
                  src={pet.photo_url || "/placeholder.svg?height=400&width=600"}
                  alt={pet.name}
                  className="w-full h-64 md:h-96 object-cover rounded-t-lg"
                />
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={pet.type === "lost" ? "destructive" : "default"}
                        className={`${pet.type === "lost" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"} text-sm`}
                      >
                        {pet.type === "lost" ? "Потерялся" : "Найден"}
                      </Badge>
                      {pet.reward && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200 text-sm">
                          Вознаграждение: {pet.reward.toLocaleString()} ₽
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl">
                      {pet.name} • {pet.breed}
                    </CardTitle>
                    <p className="text-gray-600 mt-1">
                      {pet.animal_type === "dog" ? "Собака" : pet.animal_type === "cat" ? "Кошка" : "Другое"} •{" "}
                      {pet.color}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Описание</h3>
                    <p className="text-gray-700 leading-relaxed">{pet.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-2 text-orange-500" />
                      <div>
                        <p className="font-medium">Местоположение</p>
                        <p className="text-sm">{pet.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                      <div>
                        <p className="font-medium">Дата</p>
                        <p className="text-sm">{formatDate(pet.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-orange-500" />
                  Место на карте
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Карта будет здесь</p>
                    <p className="text-sm">
                      Координаты: {pet.latitude}, {pet.longitude}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact */}
            <ContactInfo
              contact_name={pet.contact_name}
              contact_phone={pet.contact_phone}
              petId={pet.id}
              showPhone={false}
              isOwner={currentUser?.id === pet.user_id}
              isAdmin={false}
              currentUserId={currentUser?.id}
            />

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {pet.type === "lost" ? "Советы по поиску" : "Что делать дальше"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pet.type === "lost" ? (
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Обойдите места, где питомец мог спрятаться</li>
                    <li>• Расклейте объявления в районе</li>
                    <li>• Сообщите в местные приюты</li>
                    <li>• Проверьте группы в соцсетях</li>
                    <li>• Не теряйте надежду!</li>
                  </ul>
                ) : (
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Проверьте наличие микрочипа</li>
                    <li>• Обратитесь к ветеринару</li>
                    <li>• Сообщите в приюты</li>
                    <li>• Разместите в соцсетях</li>
                    <li>• Будьте осторожны при передаче</li>
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Emergency */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-800">Экстренные контакты</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div>
                    <p className="font-medium text-orange-900">Служба отлова</p>
                    <p className="text-orange-700">+7 (86133) 5-XX-XX</p>
                  </div>
                  <div>
                    <p className="font-medium text-orange-900">Приют "Дружок"</p>
                    <p className="text-orange-700">+7 (918) XXX-XX-XX</p>
                  </div>
                  <div>
                    <p className="font-medium text-orange-900">Ветклиника 24/7</p>
                    <p className="text-orange-700">+7 (918) XXX-XX-XX</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
