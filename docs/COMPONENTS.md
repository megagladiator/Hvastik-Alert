# Документация компонентов - Hvastik-Alert

## 📋 Содержание

1. [Обзор компонентов](#обзор-компонентов)
2. [UI компоненты](#ui-компоненты)
3. [Бизнес компоненты](#бизнес-компоненты)
4. [Хуки](#хуки)
5. [Утилиты](#утилиты)
6. [Примеры использования](#примеры-использования)

## 🧩 Обзор компонентов

Hvastik-Alert использует модульную архитектуру компонентов, построенную на основе:
- **Radix UI** - Базовые примитивы
- **Tailwind CSS** - Стилизация
- **TypeScript** - Типизация
- **React Hooks** - Логика состояния

### Структура компонентов
```
components/
├── ui/                    # Базовые UI компоненты (Radix UI)
├── admin/                 # Админ компоненты
├── pet-map.tsx           # Карта питомцев
├── chat-notification.tsx # Уведомления чата
├── contact-info.tsx      # Контактная информация
├── theme-provider.tsx    # Провайдер темы
├── background-image-uploader.tsx
└── user-email-indicator.tsx
```

## 🎨 UI компоненты

### Базовые компоненты (components/ui/)

Все базовые компоненты основаны на Radix UI и стилизованы с помощью Tailwind CSS.

#### Button
```typescript
import { Button } from "@/components/ui/button"

// Основные варианты
<Button variant="default">Кнопка</Button>
<Button variant="destructive">Удалить</Button>
<Button variant="outline">Отмена</Button>
<Button variant="secondary">Вторичная</Button>
<Button variant="ghost">Призрачная</Button>
<Button variant="link">Ссылка</Button>

// Размеры
<Button size="sm">Маленькая</Button>
<Button size="default">Обычная</Button>
<Button size="lg">Большая</Button>
<Button size="icon">Иконка</Button>

// Состояния
<Button disabled>Отключена</Button>
<Button loading>Загрузка...</Button>
```

#### Input
```typescript
import { Input } from "@/components/ui/input"

<Input 
  type="text" 
  placeholder="Введите текст"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

<Input 
  type="email" 
  placeholder="email@example.com"
  required
/>

<Input 
  type="password" 
  placeholder="Пароль"
  autoComplete="current-password"
/>
```

#### Card
```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Заголовок карточки</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Содержимое карточки</p>
  </CardContent>
</Card>
```

#### Dialog
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Открыть диалог</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Заголовок диалога</DialogTitle>
    </DialogHeader>
    <p>Содержимое диалога</p>
  </DialogContent>
</Dialog>
```

#### Badge
```typescript
import { Badge } from "@/components/ui/badge"

<Badge variant="default">Обычный</Badge>
<Badge variant="secondary">Вторичный</Badge>
<Badge variant="destructive">Опасный</Badge>
<Badge variant="outline">Контурный</Badge>
```

#### Select
```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Выберите опцию" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Опция 1</SelectItem>
    <SelectItem value="option2">Опция 2</SelectItem>
  </SelectContent>
</Select>
```

#### Toast
```typescript
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()

// Использование
toast({
  title: "Успех",
  description: "Операция выполнена успешно",
})

toast({
  title: "Ошибка",
  description: "Произошла ошибка",
  variant: "destructive",
})
```

## 🏢 Бизнес компоненты

### PetMap
Интерактивная карта для отображения питомцев.

```typescript
import PetMap from "@/components/pet-map"

interface Pet {
  id: string
  name: string
  latitude: number
  longitude: number
  type: 'lost' | 'found'
  photo_url?: string
}

<PetMap 
  pets={pets} 
  onPetClick={(pet) => console.log('Clicked pet:', pet)}
  center={[44.8951, 37.3142]} // Координаты Анапы
  zoom={13}
/>
```

**Функциональность:**
- Отображение меток питомцев на карте
- Разные цвета для потерянных/найденных
- Попапы с информацией о питомце
- Клик для перехода к деталям

### ChatNotification
Система уведомлений для чатов.

```typescript
import ChatNotification from "@/components/chat-notification"

<ChatNotification 
  userId={userId}
  onNewMessage={(message) => {
    // Обработка нового сообщения
    showNotification(message)
  }}
/>
```

**Функциональность:**
- Подписка на новые сообщения
- Визуальные уведомления
- Звуковые уведомления (опционально)
- Счетчик непрочитанных

### ContactInfo
Отображение контактной информации.

```typescript
import ContactInfo from "@/components/contact-info"

<ContactInfo 
  name="Анна Иванова"
  phone="+7 (918) 123-45-67"
  email="anna@example.com"
  showPhone={true}
  showEmail={false}
/>
```

**Функциональность:**
- Безопасное отображение контактов
- Кнопки для звонка/письма
- Защита от спама

### BackgroundImageUploader
Загрузка фоновых изображений для админки.

```typescript
import BackgroundImageUploader from "@/components/background-image-uploader"

<BackgroundImageUploader 
  onUpload={(url) => {
    // Обновление фонового изображения
    updateBackgroundImage(url)
  }}
  currentImage={currentBackgroundUrl}
/>
```

**Функциональность:**
- Загрузка изображений в Supabase Storage
- Предварительный просмотр
- Валидация размера и формата
- Обрезка изображений

### UserEmailIndicator
Индикатор статуса пользователя.

```typescript
import UserEmailIndicator from "@/components/user-email-indicator"

<UserEmailIndicator />
```

**Функциональность:**
- Отображение email авторизованного пользователя
- Кнопки входа/выхода
- Состояние загрузки
- Обработка ошибок аутентификации

## 🎣 Хуки

### useChat
Основной хук для работы с чатами.

```typescript
import { useChat } from "@/hooks/use-chat"

const { 
  messages, 
  loading, 
  sending, 
  error, 
  sendMessage 
} = useChat({
  petId: "pet-uuid",
  currentUserId: "user-uuid"
})

// Отправка сообщения
await sendMessage("Привет! Я нашел вашего питомца")

// Состояния
if (loading) return <div>Загрузка чата...</div>
if (error) return <div>Ошибка: {error}</div>
```

**Возвращаемые значения:**
- `messages` - Массив сообщений
- `loading` - Состояние загрузки
- `sending` - Состояние отправки
- `error` - Ошибка (если есть)
- `sendMessage` - Функция отправки сообщения

### useChatSimple
Упрощенная версия хука чата для демо-режима.

```typescript
import { useChatSimple } from "@/hooks/use-chat-simple"

const { 
  messages, 
  sendMessage 
} = useChatSimple({
  petId: "demo-pet"
})
```

### useDebounce
Хук для дебаунсинга значений.

```typescript
import { useDebounce } from "@/hooks/use-debounce"

const [searchTerm, setSearchTerm] = useState("")
const debouncedSearchTerm = useDebounce(searchTerm, 500)

useEffect(() => {
  if (debouncedSearchTerm) {
    // Выполнить поиск
    searchPets(debouncedSearchTerm)
  }
}, [debouncedSearchTerm])
```

### useMobile
Хук для определения мобильного устройства.

```typescript
import { useMobile } from "@/hooks/use-mobile"

const isMobile = useMobile()

return (
  <div className={isMobile ? "mobile-layout" : "desktop-layout"}>
    {isMobile ? <MobileMenu /> : <DesktopMenu />}
  </div>
)
```

### useToast
Хук для показа уведомлений.

```typescript
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()

const handleSuccess = () => {
  toast({
    title: "Успех",
    description: "Объявление создано успешно",
  })
}

const handleError = () => {
  toast({
    title: "Ошибка",
    description: "Не удалось создать объявление",
    variant: "destructive",
  })
}
```

## 🛠️ Утилиты

### lib/utils.ts
Общие утилиты для работы с данными.

```typescript
import { cn } from "@/lib/utils"

// Объединение классов
const className = cn(
  "base-class",
  condition && "conditional-class",
  "another-class"
)

// Форматирование даты
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU')
}

// Форматирование телефона
export function formatPhone(phone: string): string {
  return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5')
}

// Валидация email
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
```

### lib/supabase.ts
Конфигурация Supabase клиента.

```typescript
import { createClient } from "@supabase/supabase-js"

// Создание клиента
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Безопасный клиент для случаев, когда Supabase не настроен
export const safeSupabase = supabase || {
  from: () => ({
    select: () => ({
      eq: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") })
    })
  })
}
```

## 📝 Примеры использования

### Создание формы добавления питомца

```typescript
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export default function AddPetForm() {
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    type: "lost",
    animal_type: "dog",
    description: "",
    contact_phone: "",
    contact_name: ""
  })
  
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('pets')
        .insert(formData)
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Успех",
        description: "Объявление создано успешно",
      })

      // Сброс формы
      setFormData({
        name: "",
        breed: "",
        type: "lost",
        animal_type: "dog",
        description: "",
        contact_phone: "",
        contact_name: ""
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать объявление",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Добавить объявление</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Имя питомца</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Введите имя питомца"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Порода</label>
            <Input
              value={formData.breed}
              onChange={(e) => setFormData({...formData, breed: e.target.value})}
              placeholder="Введите породу"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Тип объявления</label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData({...formData, type: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lost">Потерялся</SelectItem>
                <SelectItem value="found">Найден</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Создание..." : "Создать объявление"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

### Компонент чата

```typescript
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useChat } from "@/hooks/use-chat"
import { Send } from "lucide-react"

interface ChatProps {
  petId: string
  userId: string
}

export default function Chat({ petId, userId }: ChatProps) {
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { messages, loading, sending, sendMessage } = useChat({
    petId,
    currentUserId: userId
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    await sendMessage(newMessage)
    setNewMessage("")
  }

  if (loading) {
    return <div>Загрузка чата...</div>
  }

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader>
        <CardTitle>Чат</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Сообщения */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === userId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  message.sender_id === userId
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Форма отправки */}
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Введите сообщение..."
              disabled={sending}
            />
            <Button type="submit" disabled={sending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
```

### Компонент карточки питомца

```typescript
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, MessageCircle, Heart } from "lucide-react"
import Link from "next/link"

interface PetCardProps {
  pet: {
    id: string
    name: string
    breed: string
    type: 'lost' | 'found'
    location: string
    photo_url?: string
    reward?: number
    created_at: string
  }
}

export default function PetCard({ pet }: PetCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Вчера"
    if (diffDays <= 7) return `${diffDays} дн. назад`
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        {/* Фото */}
        <div className="relative">
          <img
            src={pet.photo_url || "/placeholder.svg"}
            alt={pet.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <Badge
            className={`absolute top-3 left-3 ${
              pet.type === "lost" 
                ? "bg-red-500 hover:bg-red-600" 
                : "bg-green-500 hover:bg-green-600"
            } text-white`}
          >
            {pet.type === "lost" ? "Ищет хозяина" : "Найден"}
          </Badge>
          {pet.reward && (
            <Badge className="absolute top-3 right-3 bg-orange-500 text-white">
              {pet.reward.toLocaleString()} ₽
            </Badge>
          )}
        </div>

        {/* Информация */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">
            {pet.name} • {pet.breed}
          </h3>

          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{pet.location}</span>
            <span className="mx-2">•</span>
            <span className="text-sm">{formatDate(pet.created_at)}</span>
          </div>

          <Link href={`/pet/${pet.id}`}>
            <Button className="w-full bg-orange-500 hover:bg-orange-600">
              <MessageCircle className="h-4 w-4 mr-2" />
              Связаться
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
```

## 🎨 Стилизация

### Tailwind CSS классы

```typescript
// Основные цвета
"bg-orange-500"     // Основной оранжевый
"bg-green-500"      // Зеленый для найденных
"bg-red-500"        // Красный для потерянных
"bg-blue-500"       // Синий для акцентов

// Размеры
"text-sm"           // Маленький текст
"text-base"         // Обычный текст
"text-lg"           // Большой текст
"text-xl"           // Очень большой текст

// Отступы
"p-4"               // Padding 16px
"m-4"               // Margin 16px
"space-y-4"         // Вертикальные отступы между элементами

// Flexbox
"flex"              // display: flex
"flex-col"          // flex-direction: column
"justify-center"    // justify-content: center
"items-center"      // align-items: center

// Grid
"grid"              // display: grid
"grid-cols-3"       // grid-template-columns: repeat(3, 1fr)
"gap-4"             // gap: 16px
```

### Кастомные стили

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors;
  }
  
  .card-hover {
    @apply hover:shadow-xl transition-all duration-300;
  }
  
  .text-gradient {
    @apply bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent;
  }
}
```

---

*Документация компонентов обновлена: 7 сентября 2025*
