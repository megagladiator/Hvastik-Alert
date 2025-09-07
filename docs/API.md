# API Documentation - Hvastik-Alert

## 📋 Содержание

1. [Обзор API](#обзор-api)
2. [Аутентификация](#аутентификация)
3. [Endpoints](#endpoints)
4. [Модели данных](#модели-данных)
5. [Обработка ошибок](#обработка-ошибок)
6. [Примеры использования](#примеры-использования)

## 🔍 Обзор API

Hvastik-Alert использует Supabase в качестве backend-as-a-service платформы, предоставляя RESTful API и Realtime WebSocket соединения.

### Базовый URL
```
Production: https://your-project.supabase.co
Development: http://localhost:3000
```

### Формат данных
- **Content-Type**: `application/json`
- **Accept**: `application/json`

## 🔐 Аутентификация

### Типы аутентификации
1. **Anonymous Access** - Доступ к публичным данным
2. **Authenticated Access** - Доступ с JWT токеном
3. **Service Role Access** - Административный доступ

### Получение токена
```javascript
// Регистрация
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Вход
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Получение текущего пользователя
const { data: { user } } = await supabase.auth.getUser()
```

### Использование токена
```javascript
// Автоматически добавляется в заголовки
const supabase = createClient(url, key, {
  global: {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
})
```

## 📡 Endpoints

### 1. Pets API

#### Получить всех питомцев
```http
GET /rest/v1/pets
```

**Параметры запроса:**
- `type` (optional) - Фильтр по типу: `lost` или `found`
- `animal_type` (optional) - Фильтр по виду животного
- `status` (optional) - Фильтр по статусу: `active`, `found`, `archived`
- `limit` (optional) - Количество записей (по умолчанию 100)
- `offset` (optional) - Смещение для пагинации

**Пример запроса:**
```javascript
const { data, error } = await supabase
  .from('pets')
  .select('*')
  .eq('status', 'active')
  .eq('type', 'lost')
  .order('created_at', { ascending: false })
  .limit(20)
```

**Ответ:**
```json
[
  {
    "id": "uuid",
    "type": "lost",
    "animal_type": "dog",
    "breed": "Лабрадор",
    "name": "Рекс",
    "description": "Дружелюбный золотистый лабрадор",
    "color": "Золотистый",
    "location": "Центральный пляж",
    "latitude": 44.8951,
    "longitude": 37.3142,
    "contact_phone": "+7 (918) 123-45-67",
    "contact_name": "Анна",
    "reward": 5000,
    "photo_url": "https://...",
    "status": "active",
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

#### Получить питомца по ID
```http
GET /rest/v1/pets?id=eq.{pet_id}
```

**Пример запроса:**
```javascript
const { data, error } = await supabase
  .from('pets')
  .select('*')
  .eq('id', petId)
  .single()
```

#### Создать объявление о питомце
```http
POST /rest/v1/pets
```

**Тело запроса:**
```json
{
  "type": "lost",
  "animal_type": "dog",
  "breed": "Лабрадор",
  "name": "Рекс",
  "description": "Дружелюбный золотистый лабрадор",
  "color": "Золотистый",
  "location": "Центральный пляж",
  "latitude": 44.8951,
  "longitude": 37.3142,
  "contact_phone": "+7 (918) 123-45-67",
  "contact_name": "Анна",
  "reward": 5000,
  "photo_url": "https://example.com/photo.jpg"
}
```

**Пример запроса:**
```javascript
const { data, error } = await supabase
  .from('pets')
  .insert({
    type: 'lost',
    animal_type: 'dog',
    breed: 'Лабрадор',
    name: 'Рекс',
    description: 'Дружелюбный золотистый лабрадор',
    color: 'Золотистый',
    location: 'Центральный пляж',
    latitude: 44.8951,
    longitude: 37.3142,
    contact_phone: '+7 (918) 123-45-67',
    contact_name: 'Анна',
    reward: 5000,
    photo_url: 'https://example.com/photo.jpg'
  })
  .select()
```

#### Обновить объявление
```http
PATCH /rest/v1/pets?id=eq.{pet_id}
```

**Пример запроса:**
```javascript
const { data, error } = await supabase
  .from('pets')
  .update({ status: 'found' })
  .eq('id', petId)
  .select()
```

#### Удалить объявление
```http
DELETE /rest/v1/pets?id=eq.{pet_id}
```

**Пример запроса:**
```javascript
const { error } = await supabase
  .from('pets')
  .delete()
  .eq('id', petId)
```

### 2. Chats API

#### Получить чаты пользователя
```http
GET /rest/v1/chats
```

**Пример запроса:**
```javascript
const { data, error } = await supabase
  .from('chats')
  .select(`
    *,
    pets (
      id,
      name,
      breed,
      photo_url,
      type
    )
  `)
  .or(`user_id.eq.${userId},owner_id.eq.${userId}`)
  .order('updated_at', { ascending: false })
```

#### Создать чат
```http
POST /rest/v1/chats
```

**Тело запроса:**
```json
{
  "pet_id": "uuid",
  "user_id": "uuid",
  "owner_id": "uuid"
}
```

**Пример запроса:**
```javascript
const { data, error } = await supabase
  .from('chats')
  .insert({
    pet_id: petId,
    user_id: userId,
    owner_id: ownerId
  })
  .select()
```

### 3. Messages API

#### Получить сообщения чата
```http
GET /rest/v1/messages?chat_id=eq.{chat_id}
```

**Пример запроса:**
```javascript
const { data, error } = await supabase
  .from('messages')
  .select('*')
  .eq('chat_id', chatId)
  .order('created_at', { ascending: true })
```

#### Отправить сообщение
```http
POST /rest/v1/messages
```

**Тело запроса:**
```json
{
  "chat_id": "uuid",
  "sender_id": "uuid",
  "sender_type": "user",
  "text": "Привет! Я нашел вашего питомца"
}
```

**Пример запроса:**
```javascript
const { data, error } = await supabase
  .from('messages')
  .insert({
    chat_id: chatId,
    sender_id: userId,
    sender_type: 'user',
    text: 'Привет! Я нашел вашего питомца'
  })
  .select()
```

### 4. App Settings API

#### Получить настройки приложения
```http
GET /rest/v1/app_settings
```

**Пример запроса:**
```javascript
const { data, error } = await supabase
  .from('app_settings')
  .select('*')
  .eq('id', '00000000-0000-0000-0000-000000000001')
  .single()
```

#### Обновить настройки
```http
PATCH /rest/v1/app_settings?id=eq.{settings_id}
```

**Пример запроса:**
```javascript
const { data, error } = await supabase
  .from('app_settings')
  .update({
    background_image_url: 'https://example.com/bg.jpg',
    background_darkening_percentage: 60
  })
  .eq('id', settingsId)
  .select()
```

## 🔄 Realtime API

### Подписка на сообщения
```javascript
const channel = supabase
  .channel('chat:messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `chat_id=eq.${chatId}`
    },
    (payload) => {
      console.log('New message:', payload.new)
      // Обновить UI с новым сообщением
    }
  )
  .subscribe()
```

### Подписка на обновления питомцев
```javascript
const channel = supabase
  .channel('pets:updates')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'pets'
    },
    (payload) => {
      console.log('Pet updated:', payload)
      // Обновить карту или список
    }
  )
  .subscribe()
```

### Отписка от канала
```javascript
supabase.removeChannel(channel)
```

## 📊 Модели данных

### Pet Model
```typescript
interface Pet {
  id: string
  user_id: string
  type: 'lost' | 'found'
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
  status: 'active' | 'found' | 'archived'
  created_at: string
}
```

### Chat Model
```typescript
interface Chat {
  id: string
  pet_id: string
  user_id: string
  owner_id: string
  created_at: string
  updated_at: string
}
```

### Message Model
```typescript
interface Message {
  id: string
  chat_id: string
  sender_id: string
  sender_type: 'user' | 'owner'
  text: string
  created_at: string
  updated_at: string
}
```

### App Settings Model
```typescript
interface AppSettings {
  id: string
  background_image_url?: string
  background_darkening_percentage: number
  updated_at: string
}
```

## ⚠️ Обработка ошибок

### Стандартные коды ошибок
- `400` - Неверный запрос
- `401` - Не авторизован
- `403` - Доступ запрещен
- `404` - Не найдено
- `409` - Конфликт (например, дублирование)
- `422` - Ошибка валидации
- `500` - Внутренняя ошибка сервера

### Формат ошибки
```json
{
  "code": "23505",
  "details": "Key (email)=(user@example.com) already exists.",
  "hint": null,
  "message": "duplicate key value violates unique constraint \"users_email_key\""
}
```

### Обработка ошибок в коде
```javascript
const { data, error } = await supabase
  .from('pets')
  .insert(petData)

if (error) {
  console.error('Error creating pet:', error.message)
  
  // Обработка специфических ошибок
  if (error.code === '23505') {
    // Дублирование данных
    setError('Питомец с такими данными уже существует')
  } else if (error.code === '42501') {
    // Недостаточно прав
    setError('У вас нет прав для выполнения этого действия')
  } else {
    // Общая ошибка
    setError('Произошла ошибка при создании объявления')
  }
}
```

## 📝 Примеры использования

### Полный пример создания объявления
```javascript
async function createPetListing(petData) {
  try {
    // 1. Загрузить изображение в Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pet-photos')
      .upload(`${Date.now()}-${petData.photo.name}`, petData.photo)

    if (uploadError) throw uploadError

    // 2. Получить публичный URL изображения
    const { data: { publicUrl } } = supabase.storage
      .from('pet-photos')
      .getPublicUrl(uploadData.path)

    // 3. Создать объявление в базе данных
    const { data, error } = await supabase
      .from('pets')
      .insert({
        ...petData,
        photo_url: publicUrl,
        user_id: (await supabase.auth.getUser()).data.user.id
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error creating pet listing:', error)
    return { success: false, error: error.message }
  }
}
```

### Пример поиска с фильтрами
```javascript
async function searchPets(filters) {
  let query = supabase
    .from('pets')
    .select('*')
    .eq('status', 'active')

  // Применить фильтры
  if (filters.type) {
    query = query.eq('type', filters.type)
  }
  
  if (filters.animal_type) {
    query = query.eq('animal_type', filters.animal_type)
  }
  
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,breed.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }
  
  if (filters.location) {
    // Поиск по радиусу (упрощенный)
    query = query.ilike('location', `%${filters.location}%`)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(filters.limit || 20)

  if (error) throw error
  return data
}
```

### Пример работы с чатом
```javascript
class ChatService {
  constructor(chatId) {
    this.chatId = chatId
    this.channel = null
  }

  async loadMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', this.chatId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  }

  async sendMessage(text) {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: this.chatId,
        sender_id: user.id,
        sender_type: 'user',
        text
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  subscribeToMessages(callback) {
    this.channel = supabase
      .channel(`chat:${this.chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${this.chatId}`
        },
        callback
      )
      .subscribe()
  }

  unsubscribe() {
    if (this.channel) {
      supabase.removeChannel(this.channel)
    }
  }
}
```

## 🔧 Утилиты и хелперы

### Валидация данных
```javascript
function validatePetData(data) {
  const errors = []
  
  if (!data.name || data.name.length < 2) {
    errors.push('Имя должно содержать минимум 2 символа')
  }
  
  if (!data.breed || data.breed.length < 2) {
    errors.push('Порода должна содержать минимум 2 символа')
  }
  
  if (!data.description || data.description.length < 10) {
    errors.push('Описание должно содержать минимум 10 символов')
  }
  
  if (!data.contact_phone || !/^\+?[1-9]\d{1,14}$/.test(data.contact_phone)) {
    errors.push('Неверный формат номера телефона')
  }
  
  if (!data.latitude || !data.longitude) {
    errors.push('Необходимо указать местоположение на карте')
  }
  
  return errors
}
```

### Форматирование данных
```javascript
function formatPetForDisplay(pet) {
  return {
    ...pet,
    formattedDate: new Date(pet.created_at).toLocaleDateString('ru-RU'),
    formattedReward: pet.reward ? `${pet.reward.toLocaleString()} ₽` : null,
    shortDescription: pet.description.length > 100 
      ? pet.description.substring(0, 100) + '...' 
      : pet.description
  }
}
```

---

*API документация обновлена: 7 сентября 2025*
