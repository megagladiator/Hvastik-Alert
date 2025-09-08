"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Search, Plus, Heart, MessageCircle, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PetMap } from "@/components/pet-map"
import { supabase } from "@/lib/supabase"

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
  reward?: number
  photo_url?: string
  created_at: string
  status: "active" | "found" | "archived"
}

export default function SearchPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [filteredPets, setFilteredPets] = useState<Pet[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [animalFilter, setAnimalFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPets()
  }, [])

  useEffect(() => {
    filterPets()
  }, [pets, searchQuery, typeFilter, animalFilter])

  const fetchPets = async () => {
    try {
      // Проверяем, настроен ли Supabase
      if (supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && 
          !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
        
        // Добавляем таймаут для запроса к Supabase
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Supabase timeout')), 5000)
        )
        
        const supabasePromise = supabase
          .from("pets")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false })

        try {
          const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any

          if (error) {
            console.warn("Supabase error, using demo data:", error.message)
          } else if (data && data.length > 0) {
            setPets(data)
            return
          }
        } catch (timeoutError) {
          console.warn("Supabase timeout, using demo data")
        }
      }

      // Fallback to demo data
      console.log("Using demo data - Supabase not configured or no data found")
      const demoData: Pet[] = [
        {
          id: "1",
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
          photo_url: "/placeholder.svg?height=200&width=300",
          created_at: "2024-01-15T10:00:00Z",
          status: "active",
        },
        {
          id: "2",
          type: "found",
          animal_type: "cat",
          breed: "Беспородная",
          name: "Неизвестно",
          description: "Найден серый кот с белыми лапками. Очень ласковый, ухоженный.",
          color: "Серый с белым",
          location: "Парк 30-летия Победы",
          latitude: 44.8876,
          longitude: 37.3086,
          contact_phone: "+7 (918) 987-65-43",
          contact_name: "Михаил",
          photo_url: "/placeholder.svg?height=200&width=300",
          created_at: "2024-01-14T15:30:00Z",
          status: "active",
        },
        {
          id: "3",
          type: "lost",
          animal_type: "cat",
          breed: "Персидская",
          name: "Мурка",
          description: "Пушистая персидская кошка, белого цвета. Очень пугливая.",
          color: "Белый",
          location: "Высокий берег",
          latitude: 44.8845,
          longitude: 37.3234,
          contact_phone: "+7 (918) 555-12-34",
          contact_name: "Елена",
          reward: 3000,
          photo_url: "/placeholder.svg?height=200&width=300",
          created_at: "2024-01-13T09:15:00Z",
          status: "active",
        },
        {
          id: "4",
          type: "found",
          animal_type: "dog",
          breed: "Дворняжка",
          name: "Неизвестно",
          description: "Найдена небольшая собачка рыжего цвета возле автовокзала. Очень дружелюбная.",
          color: "Рыжий",
          location: "Автовокзал Анапы",
          latitude: 44.8978,
          longitude: 37.3167,
          contact_phone: "+7 (918) 777-88-99",
          contact_name: "Дмитрий",
          photo_url: "/placeholder.svg?height=200&width=300",
          created_at: "2024-01-12T12:00:00Z",
          status: "active",
        },
        {
          id: "5",
          type: "lost",
          animal_type: "dog",
          breed: "Хаски",
          name: "Балто",
          description: "Сибирский хаски, очень активный и дружелюбный. Потерялся во время прогулки в лесопарке.",
          color: "Черно-белый",
          location: "Лесопарк Большой Утриш",
          latitude: 44.7289,
          longitude: 37.4089,
          contact_phone: "+7 (918) 333-22-11",
          contact_name: "Игорь",
          reward: 8000,
          photo_url: "/placeholder.svg?height=200&width=300",
          created_at: "2024-01-11T16:45:00Z",
          status: "active",
        },
      ]
      setPets(demoData)
    } catch (error) {
      console.warn("Unexpected error fetching pets, using demo data:", error)
      // Even if there's an error, show demo data
      const demoData: Pet[] = [
        {
          id: "1",
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
          photo_url: "/placeholder.svg?height=200&width=300",
          created_at: "2024-01-15T10:00:00Z",
          status: "active",
        },
        {
          id: "2",
          type: "found",
          animal_type: "cat",
          breed: "Беспородная",
          name: "Неизвестно",
          description: "Найден серый кот с белыми лапками. Очень ласковый, ухоженный.",
          color: "Серый с белым",
          location: "Парк 30-летия Победы",
          latitude: 44.8876,
          longitude: 37.3086,
          contact_phone: "+7 (918) 987-65-43",
          contact_name: "Михаил",
          photo_url: "/placeholder.svg?height=200&width=300",
          created_at: "2024-01-14T15:30:00Z",
          status: "active",
        },
      ]
      setPets(demoData)
    } finally {
      setLoading(false)
    }
  }

  const filterPets = () => {
    let filtered = pets

    if (searchQuery) {
      filtered = filtered.filter(
        (pet) =>
          pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pet.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((pet) => pet.type === typeFilter)
    }

    if (animalFilter !== "all") {
      filtered = filtered.filter((pet) => pet.animal_type === animalFilter)
    }

    setFilteredPets(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загружаем объявления...</p>
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
                  На главную
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-orange-500" />
                <h1 className="text-xl font-bold text-gray-900">Поиск питомцев</h1>
              </div>
            </div>
            <Link href="/add">
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                Подать объявление
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Поиск по кличке, породе, описанию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Тип объявления" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все объявления</SelectItem>
                <SelectItem value="lost">Потерялся</SelectItem>
                <SelectItem value="found">Найден</SelectItem>
              </SelectContent>
            </Select>
            <Select value={animalFilter} onValueChange={setAnimalFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Вид животного" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все животные</SelectItem>
                <SelectItem value="dog">Собаки</SelectItem>
                <SelectItem value="cat">Кошки</SelectItem>
                <SelectItem value="other">Другие</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="h-96 lg:h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-orange-500" />
                  Карта объявлений
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <PetMap pets={filteredPets} />
              </CardContent>
            </Card>
          </div>

          {/* Pet List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Объявления ({filteredPets.length})</h2>

            {filteredPets.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">Объявления не найдены</p>
                  <p className="text-sm text-gray-400 mt-2">Попробуйте изменить фильтры поиска</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredPets.map((pet) => (
                  <Card key={pet.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={pet.photo_url || "/placeholder.svg?height=80&width=80"}
                          alt={pet.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Badge
                                variant={pet.type === "lost" ? "destructive" : "default"}
                                className={
                                  pet.type === "lost" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                                }
                              >
                                {pet.type === "lost" ? "Потерялся" : "Найден"}
                              </Badge>
                              {pet.reward && (
                                <Badge variant="outline" className="ml-2 text-orange-600 border-orange-200">
                                  {pet.reward.toLocaleString()} ₽
                                </Badge>
                              )}
                            </div>
                          </div>

                          <h3 className="font-semibold text-gray-900 mb-1">
                            {pet.name} • {pet.breed}
                          </h3>

                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{pet.description}</p>

                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate">{pet.location}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(pet.created_at)}
                            </div>

                            <div className="flex gap-2">
                              <Link href={`/pet/${pet.id}`}>
                                <Button size="sm" variant="outline">
                                  Подробнее
                                </Button>
                              </Link>
                              <Link href={`/chat/${pet.id}`}>
                                <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                                  <MessageCircle className="h-3 w-3 mr-1" />
                                  Чат
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">{pets.filter((p) => p.type === "lost").length}</div>
              <div className="text-sm text-gray-600">Потерялись</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{pets.filter((p) => p.type === "found").length}</div>
              <div className="text-sm text-gray-600">Найдены</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">
                {pets.filter((p) => p.animal_type === "dog").length}
              </div>
              <div className="text-sm text-gray-600">Собаки</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-500">
                {pets.filter((p) => p.animal_type === "cat").length}
              </div>
              <div className="text-sm text-gray-600">Кошки</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
