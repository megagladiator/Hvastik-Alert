"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Search,
  Plus,
  Heart,
  MessageCircle,
  Phone,
  Star,
  CheckCircle,
  Users,
  Clock,
  Award,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { safeSupabase as supabase } from "@/lib/supabase" // Use safeSupabase
import PetMap from "@/components/pet-map"
import dynamic from "next/dynamic"

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

interface Testimonial {
  id: string
  name: string
  petName: string
  petType: string
  story: string
  photo: string
  location: string
  daysToFind: number
}

const AuthPage = dynamic(() => import("./auth/page"), { ssr: false })

export default function HomePage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [filteredPets, setFilteredPets] = useState<Pet[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [animalFilter, setAnimalFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [foundPetsCount, setFoundPetsCount] = useState(0)
  // State for background image URL and darkening percentage
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>("/placeholder.svg?height=1080&width=1920")
  const [backgroundDarkeningPercentage, setBackgroundDarkeningPercentage] = useState<number>(50)
  const [showAuth, setShowAuth] = useState(false)
  const [user, setUser] = useState<any>(null)

  const testimonials: Testimonial[] = [
    {
      id: "1",
      name: "Анна",
      petName: "Рекс",
      petType: "лабрадор",
      story: "Нашли через 2 дня благодаря вашему сайту! Спасибо огромное!",
      photo: "/placeholder.svg?height=60&width=60",
      location: "Центральный пляж",
      daysToFind: 2,
    },
    {
      id: "2",
      name: "Михаил",
      petName: "Мурка",
      petType: "персидская кошка",
      story: "Потерялась на даче, нашли через ваш сервис за 4 дня!",
      photo: "/placeholder.svg?height=60&width=60",
      location: "Витязево",
      daysToFind: 4,
    },
    {
      id: "3",
      name: "Елена",
      petName: "Барон",
      petType: "немецкая овчарка",
      story: "Убежал во время грозы. Благодаря карте нашли за день!",
      photo: "/placeholder.svg?height=60&width=60",
      location: "Джемете",
      daysToFind: 1,
    },
  ]

  const SETTINGS_ROW_ID = "00000000-0000-0000-0000-000000000001" // Fixed ID for the single settings row

  useEffect(() => {
    fetchPets()
    fetchAppSettings() // Fetch app settings
    // Анимация счетчика найденных питомцев
    const timer = setInterval(() => {
      setFoundPetsCount((prev) => {
        if (prev < 500) return prev + 5
        clearInterval(timer)
        return 500
      })
    }, 50)

    // Автопрокрутка отзывов
    const testimonialTimer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => {
      clearInterval(timer)
      clearInterval(testimonialTimer)
    }
  }, [])

  useEffect(() => {
    filterPets()
  }, [pets, searchQuery, typeFilter, animalFilter])

  const fetchAppSettings = async () => {
    try {
      const { data, error } = await supabase.from("app_settings").select("*").eq("id", SETTINGS_ROW_ID).single()

      if (error) {
        console.error("Error fetching app settings:", error)
        // Fallback to default values if error
        setBackgroundImageUrl("/placeholder.svg?height=1080&width=1920")
        setBackgroundDarkeningPercentage(50)
      } else if (data) {
        setBackgroundImageUrl(data.background_image_url || "/placeholder.svg?height=1080&width=1920")
        setBackgroundDarkeningPercentage(data.background_darkening_percentage)
      }
    } catch (error) {
      console.error("Unexpected error fetching app settings:", error)
      // Fallback to default values on unexpected error
      setBackgroundImageUrl("/placeholder.svg?height=1080&width=1920")
      setBackgroundDarkeningPercentage(50)
    }
  }

  const fetchPets = async () => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { data, error } = await supabase
          .from("pets")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false })

        if (error) throw error
        if (data && data.length > 0) {
          setPets(data)
        }
        return
      }

      const demoData: Pet[] = [
        {
          id: "1",
          type: "lost",
          animal_type: "dog",
          breed: "Лабрадор",
          name: "Рекс",
          description: "Дружелюбный золотистый лабрадор, очень активный.",
          color: "Золотистый",
          location: "Центральный пляж",
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
          description: "Найден серый кот с белыми лапками.",
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
          description: "Пушистая персидская кошка, белого цвета.",
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
      ]
      setPets(demoData)
    } catch (error) {
      console.error("Error fetching pets:", error)
      setPets([])
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
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Вчера"
    if (diffDays <= 7) return `${diffDays} дн. назад`
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
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

  const handleAuthChange = (newUser: any) => {
    setUser(newUser)
    setShowAuth(false)
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${backgroundImageUrl})` }}>
      {/* Overlay for better readability */}
      <div
        className="min-h-screen backdrop-blur-sm"
        style={{ backgroundColor: `rgba(0, 0, 0, ${backgroundDarkeningPercentage / 100})` }}
      >
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-orange-500" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Хвостик Alert</h1>
                  <p className="text-xs text-gray-500">Анапа - поиск питомцев</p>
                </div>
              </Link>

              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/search" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Поиск
                </Link>
                <Link href="/chats" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Мои чаты
                </Link>
                <Link href="/add?type=lost" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Потерялся питомец
                </Link>
                <Link href="/add?type=found" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Нашли питомца
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section - Улучшенный */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-5xl mx-auto">
            {/* Усиленный заголовок */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              Потеряли питомца в Анапе?
              <br />
              <span className="text-orange-500">Вернем его за 24 часа!</span>
            </h1>

            {/* УТП крупным шрифтом */}
            <p className="text-xl md:text-2xl text-gray-700 mb-8 font-semibold">
              Крупнейшая база потерянных и найденных животных в Анапе –<br />
              <span className="text-green-600">90% питомцев находят через наш сервис!</span>
            </p>

            {/* Социальное доказательство */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-12 inline-block">
              <div className="flex items-center justify-center space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500 mb-1">{foundPetsCount}+</div>
                  <div className="text-sm text-gray-600">питомцев найдено</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500 mb-1">24ч</div>
                  <div className="text-sm text-gray-600">средний поиск</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500 mb-1">90%</div>
                  <div className="text-sm text-gray-600">успешных поисков</div>
                </div>
              </div>
            </div>

            {/* Улучшенные CTA кнопки */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/add?type=lost">
                <Button
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 text-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                >
                  <Plus className="h-6 w-6 mr-3" />
                  Разместить объявление БЕСПЛАТНО
                </Button>
              </Link>
              <Link href="/search">
                <Button
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white px-10 py-6 text-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                >
                  <Search className="h-6 w-6 mr-3" />
                  Найти питомца сейчас
                </Button>
              </Link>
            </div>

            {/* Доверительные элементы */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Полностью бесплатно
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-blue-500 mr-2" />
                Работаем 24/7
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-purple-500 mr-2" />
                5000+ пользователей
              </div>
            </div>
          </div>
        </section>

        {/* Отзывы - Новая секция */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Истории успеха</h2>

            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-orange-50 to-green-50 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center space-x-6">
                  <img
                    src={testimonials[currentTestimonial].photo || "/placeholder.svg"}
                    alt={testimonials[currentTestimonial].petName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-current" />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        Найден за {testimonials[currentTestimonial].daysToFind} дня
                      </span>
                    </div>
                    <blockquote className="text-lg text-gray-800 mb-2">
                      "{testimonials[currentTestimonial].story}"
                    </blockquote>
                    <div className="text-sm text-gray-600">
                      <strong>{testimonials[currentTestimonial].name}</strong> •{" "}
                      {testimonials[currentTestimonial].petName}, {testimonials[currentTestimonial].petType} •{" "}
                      {testimonials[currentTestimonial].location}
                    </div>
                  </div>
                </div>
              </div>

              {/* Индикаторы */}
              <div className="flex justify-center mt-6 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentTestimonial ? "bg-orange-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - Улучшенный */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Как это работает</h2>
          <p className="text-center text-gray-600 mb-16 text-lg">Простой процесс в 3 шага</p>

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Plus className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Создайте объявление</h3>
              <p className="text-gray-600 leading-relaxed">
                Опубликуйте информацию о потерянном или найденном питомце с фотографиями и описанием
              </p>
              <div className="mt-4 text-sm text-orange-600 font-medium">⏱️ Займет 2 минуты</div>
            </div>

            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Search className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Ищите и находите</h3>
              <p className="text-gray-600 leading-relaxed">
                Просматривайте объявления других пользователей, используйте поиск и фильтры
              </p>
              <div className="mt-4 text-sm text-green-600 font-medium">🗺️ Интерактивная карта</div>
            </div>

            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Phone className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Свяжитесь с владельцем</h3>
              <p className="text-gray-600 leading-relaxed">
                Найдя совпадение, свяжитесь с владельцем напрямую для воссоединения с питомцем
              </p>
              <div className="mt-4 text-sm text-blue-600 font-medium">💬 Встроенный чат</div>
            </div>
          </div>
        </section>

        {/* Упрощенные карточки объявлений */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Последние объявления</h2>
            <Link href="/search">
              <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50 bg-transparent">
                Смотреть все
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPets.slice(0, 6).map((pet) => (
              <Card key={pet.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={pet.photo_url || "/placeholder.svg?height=200&width=300"}
                      alt={pet.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge
                      className={`absolute top-3 left-3 ${
                        pet.type === "lost" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                      } text-white border-0`}
                    >
                      {pet.type === "lost" ? "Ищет хозяина" : "Найден"}
                    </Badge>
                    {pet.reward && (
                      <Badge className="absolute top-3 right-3 bg-orange-500 text-white border-0">
                        {pet.reward.toLocaleString()} ₽
                      </Badge>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      {pet.name} • {pet.breed}
                    </h3>

                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{pet.location}</span>
                      <span className="mx-2">•</span>
                      <span className="text-sm">{formatDate(pet.created_at)}</span>
                    </div>

                    <Link href={`/pet/${pet.id}`}>
                      <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Связаться
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Компактная карта - Новая секция */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Карта поиска</h2>
            <p className="text-gray-600 text-lg">Посмотрите, где сейчас ищут и находят питомцев в Анапе</p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Card className="overflow-hidden shadow-xl border-0">
              <CardContent className="p-0">
                <div className="relative">
                  {/* Мини-карта */}
                  <div className="h-96 lg:h-[500px]">
                    <PetMap pets={filteredPets.slice(0, 10)} />
                  </div>

                  {/* Упрощенная легенда поверх карты */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        <span>Потерялись</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span>Найдены</span>
                      </div>
                    </div>
                  </div>

                  {/* Статистика поверх карты */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-500">{filteredPets.length}</div>
                      <div className="text-xs text-gray-600">активных объявлений</div>
                    </div>
                  </div>

                  {/* Кнопка для полной карты */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <Link href="/search">
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 shadow-lg">
                        <MapPin className="h-4 w-4 mr-2" />
                        Открыть полную карту
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Быстрые фильтры под картой */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                variant={typeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("all")}
                className={typeFilter === "all" ? "bg-orange-500 hover:bg-orange-600" : "bg-transparent"}
              >
                Все ({pets.length})
              </Button>
              <Button
                variant={typeFilter === "lost" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("lost")}
                className={typeFilter === "lost" ? "bg-red-500 hover:bg-red-600" : "bg-transparent"}
              >
                Потерялись ({pets.filter((p) => p.type === "lost").length})
              </Button>
              <Button
                variant={typeFilter === "found" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("found")}
                className={typeFilter === "found" ? "bg-green-500 hover:bg-green-600" : "bg-transparent"}
              >
                Найдены ({pets.filter((p) => p.type === "found").length})
              </Button>
            </div>

            {/* Подсказка */}
            <div className="mt-4 text-center text-sm text-gray-500">
              💡 Кликните на метку, чтобы увидеть информацию о питомце
            </div>
          </div>
        </section>

        {/* Партнеры */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Наши партнеры</h2>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="bg-white px-6 py-3 rounded-lg shadow">
                <span className="font-semibold text-gray-700">Ветклиника "Айболит"</span>
              </div>
              <div className="bg-white px-6 py-3 rounded-lg shadow">
                <span className="font-semibold text-gray-700">Приют "Дружок"</span>
              </div>
              <div className="bg-white px-6 py-3 rounded-lg shadow">
                <span className="font-semibold text-gray-700">Зоомагазин "Четыре лапы"</span>
              </div>
              <div className="bg-white px-6 py-3 rounded-lg shadow">
                <span className="font-semibold text-gray-700">Администрация Анапы</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Улучшенный */}
        <section className="bg-gradient-to-r from-orange-500 to-red-500 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Начните поиск прямо сейчас</h2>
            <p className="text-orange-100 mb-8 text-xl">
              Каждая минута важна, когда речь идет о поиске любимого питомца
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/add">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-orange-500 hover:bg-gray-100 px-10 py-6 text-lg font-semibold shadow-xl"
                >
                  Подать объявление БЕСПЛАТНО
                </Button>
              </Link>
              <Link href="/search">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-orange-500 px-10 py-6 text-lg font-semibold bg-transparent"
                >
                  Просмотреть объявления
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Heart className="h-6 w-6 text-orange-500" />
                  <span className="font-bold">Хвостик Alert</span>
                </div>
                <p className="text-gray-400 text-sm">Помогаем найти потерянных питомцев в Анапе</p>
                <div className="mt-4 flex items-center text-sm text-gray-400">
                  <Award className="h-4 w-4 mr-2 text-yellow-500" />
                  500+ успешных воссоединений
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Сервис</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <Link href="/search" className="hover:text-white">
                      Поиск питомцев
                    </Link>
                  </li>
                  <li>
                    <Link href="/add" className="hover:text-white">
                      Подать объявление
                    </Link>
                  </li>
                  <li>
                    <Link href="/search" className="hover:text-white">
                      Карта находок
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Помощь</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white">
                      Как это работает
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Советы по поиску
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Контакты
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Контакты</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>г. Анапа</li>
                  <li>+7 (918) 123-45-67</li>
                  <li>info@hvostik-alert.ru</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>&copy; 2024 Хвостик Alert. Все права защищены.</p>
            </div>
          </div>
        </footer>

        {/* Плавающая CTA кнопка */}
        <div className="fixed bottom-6 right-6 z-50">
          <Link href="/add">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300">
              <Plus className="h-5 w-5 mr-2" />
              Добавить объявление
            </Button>
          </Link>
        </div>
      </div>
      <AuthPage open={showAuth} onOpenChange={setShowAuth} onAuthChange={handleAuthChange} />
    </div>
  )
}
  )
}

