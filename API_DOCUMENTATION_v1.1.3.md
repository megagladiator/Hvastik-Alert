# API Документация v1.1.3

## 📋 Обзор

Версия 1.1.3 включает новые API endpoints для управления базой данных, статистики и уведомлений. Все API используют Supabase для работы с данными и требуют права администратора.

## 🔐 Аутентификация

### Требования
- Supabase сессия
- Email администратора: `agentgl007@gmail.com`
- Service Role Key для серверных операций

### Headers
```http
Authorization: Bearer <supabase-access-token>
Content-Type: application/json
```

## 📊 Статистика базы данных

### GET /api/admin/database-stats

Получение статистики базы данных в реальном времени.

#### Запрос
```http
GET /api/admin/database-stats
```

#### Ответ
```json
{
  "users": 2,
  "pets": 9,
  "activePets": 6,
  "lostPets": 4,
  "foundPets": 2,
  "archivedPets": 3,
  "appSettings": 1,
  "totalSize": 0
}
```

#### Поля ответа
- **`users`** - количество пользователей
- **`pets`** - общее количество объявлений
- **`activePets`** - активные объявления
- **`lostPets`** - потерянные питомцы
- **`foundPets`** - найденные питомцы
- **`archivedPets`** - архивированные объявления
- **`appSettings`** - количество настроек
- **`totalSize`** - размер базы данных (пока не реализован)

#### Ошибки
```json
{
  "error": "Supabase server client not configured"
}
```

## 🗂️ Управление таблицами

### GET /api/admin/database-tables

Получение данных из таблиц базы данных.

#### Запрос
```http
GET /api/admin/database-tables?table=pets
GET /api/admin/database-tables?table=users
GET /api/admin/database-tables?table=settings
```

#### Параметры
- **`table`** (required) - название таблицы: `pets`, `users`, `settings`

#### Ответ для таблицы pets
```json
{
  "data": [
    {
      "id": "e766893e-1234-5678-9abc-def012345678",
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
      "photo_url": "/adorable-looking-kitten-with-dog.jpg",
      "status": "active",
      "user_id": "user-uuid-here",
      "created_at": "2025-01-14T15:06:47.000Z",
      "updated_at": "2025-01-14T15:06:47.000Z"
    }
  ]
}
```

#### Ответ для таблицы users
```json
{
  "data": [
    {
      "id": "user-uuid-here",
      "email": "user@example.com",
      "email_confirmed_at": "2025-01-14T10:00:00.000Z",
      "created_at": "2025-01-14T10:00:00.000Z",
      "last_sign_in_at": "2025-01-14T15:00:00.000Z",
      "user_metadata": {}
    }
  ]
}
```

#### Ответ для таблицы settings
```json
{
  "data": [
    {
      "id": "settings-uuid-here",
      "background_image_url": "/background.jpg",
      "background_darkening_percentage": 50,
      "updated_at": "2025-01-14T15:00:00.000Z"
    }
  ]
}
```

### DELETE /api/admin/database-tables

Удаление записей из таблиц.

#### Запрос
```http
DELETE /api/admin/database-tables
Content-Type: application/json

{
  "table": "pets",
  "id": "e766893e-1234-5678-9abc-def012345678"
}
```

#### Параметры
- **`table`** (required) - название таблицы
- **`id`** (required) - UUID записи для удаления

#### Ответ
```json
{
  "success": true,
  "message": "Record deleted successfully"
}
```

#### Ошибки
```json
{
  "error": "Table and ID are required"
}
```

### PUT /api/admin/database-tables

Обновление записей в таблицах.

#### Запрос
```http
PUT /api/admin/database-tables
Content-Type: application/json

{
  "table": "pets",
  "id": "e766893e-1234-5678-9abc-def012345678",
  "data": {
    "status": "archived"
  }
}
```

#### Параметры
- **`table`** (required) - название таблицы
- **`id`** (required) - UUID записи
- **`data`** (required) - объект с полями для обновления

#### Ответ
```json
{
  "success": true,
  "message": "Record updated successfully"
}
```

## 🔔 Уведомления

### POST /api/admin/notify-new-pet

Отправка уведомления администратору о новом объявлении.

#### Запрос
```http
POST /api/admin/notify-new-pet
Content-Type: application/json

{
  "petData": {
    "id": "e766893e-1234-5678-9abc-def012345678",
    "type": "lost",
    "name": "Рекс",
    "breed": "Лабрадор",
    "location": "Центральный пляж",
    "contact_name": "Анна",
    "contact_phone": "+7 (918) 123-45-67"
  },
  "userEmail": "user@example.com"
}
```

#### Параметры
- **`petData`** (required) - данные объявления
- **`userEmail`** (optional) - email пользователя

#### Ответ
```json
{
  "success": true,
  "message": "Pet created and admin notification logged (email setup pending)"
}
```

#### Функциональность
- Формирует email с деталями объявления
- Логирует уведомление в консоль
- Подготавливает инфраструктуру для email отправки

## 🐾 Управление питомцами

### POST /api/pets

Создание или обновление объявления о питомце.

#### Запрос
```http
POST /api/pets
Content-Type: application/json

{
  "petData": {
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
    "photo_url": "/image.jpg",
    "status": "active"
  },
  "userId": "user-uuid-here",
  "userEmail": "user@example.com",
  "editId": null
}
```

#### Параметры
- **`petData`** (required) - данные питомца
- **`userId`** (optional) - ID пользователя
- **`userEmail`** (optional) - email пользователя
- **`editId`** (optional) - ID для редактирования

#### Ответ
```json
{
  "data": {
    "id": "e766893e-1234-5678-9abc-def012345678",
    "type": "lost",
    "name": "Рекс",
    "created_at": "2025-01-14T15:06:47.000Z"
  }
}
```

#### Дополнительная функциональность
- Автоматически отправляет уведомление админу при создании
- Не отправляет уведомление при редактировании

## 👥 Управление пользователями

### GET /api/users

Получение списка пользователей (только для админов).

#### Запрос
```http
GET /api/users
Authorization: Bearer <supabase-access-token>
```

#### Ответ
```json
{
  "users": [
    {
      "id": "user-uuid-here",
      "email": "user@example.com",
      "email_confirmed_at": "2025-01-14T10:00:00.000Z",
      "created_at": "2025-01-14T10:00:00.000Z",
      "last_sign_in_at": "2025-01-14T15:00:00.000Z"
    }
  ]
}
```

### PUT /api/users

Обновление пользователя (бан/разбан).

#### Запрос
```http
PUT /api/users
Content-Type: application/json
Authorization: Bearer <supabase-access-token>

{
  "userId": "user-uuid-here",
  "updates": {
    "ban_user": true
  }
}
```

### DELETE /api/users

Удаление пользователя.

#### Запрос
```http
DELETE /api/users
Content-Type: application/json
Authorization: Bearer <supabase-access-token>

{
  "userId": "user-uuid-here"
}
```

## 🔧 Конфигурация

### GET /api/supabase-config

Получение конфигурации Supabase с динамическими URL.

#### Запрос
```http
GET /api/supabase-config
```

#### Ответ
```json
{
  "supabaseUrl": "https://your-project.supabase.co",
  "supabaseAnonKey": "your-anon-key",
  "redirectUrls": {
    "verifyEmail": "https://your-domain.com/auth/verify-email",
    "resetPassword": "https://your-domain.com/auth/reset-password",
    "callback": "https://your-domain.com/auth/callback",
    "error": "https://your-domain.com/auth/error"
  }
}
```

## 🚨 Обработка ошибок

### Стандартные коды ошибок

#### 400 Bad Request
```json
{
  "error": "Table parameter is required"
}
```

#### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

#### 404 Not Found
```json
{
  "error": "User not found in Firebase"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Supabase server client not configured"
}
```

### Типы ошибок

#### Ошибки аутентификации
- Неверный токен
- Истекший токен
- Недостаточно прав

#### Ошибки валидации
- Отсутствующие обязательные поля
- Неверный формат данных
- Недопустимые значения

#### Ошибки базы данных
- Проблемы подключения к Supabase
- Ошибки SQL запросов
- Нарушения ограничений

## 🔒 Безопасность

### Проверка прав доступа
```javascript
// Проверка администратора
const isAdmin = user?.email === 'agentgl007@gmail.com'
if (!isAdmin) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Валидация данных
- Проверка всех входящих параметров
- Санитизация пользовательского ввода
- Валидация UUID и email

### Rate Limiting
- Ограничение на количество запросов
- Защита от спама
- Логирование подозрительной активности

## 📊 Мониторинг

### Логирование
```javascript
console.log('API called:', endpoint, params)
console.error('API error:', error)
console.log('Admin notification sent')
```

### Метрики
- Количество запросов к API
- Время ответа
- Частота ошибок
- Использование ресурсов

## 🚀 Производительность

### Оптимизации
- Кэширование часто запрашиваемых данных
- Пагинация для больших наборов данных
- Ленивая загрузка
- Сжатие ответов

### Ограничения
- Максимум 100 записей на запрос
- Таймаут 10 секунд
- Лимит размера запроса 1MB

## 📱 Совместимость

### Поддерживаемые форматы
- JSON для всех запросов и ответов
- UTF-8 кодировка
- CORS для веб-приложений

### Версионирование
- Текущая версия: v1.1.3
- Обратная совместимость
- Планы миграции для будущих версий
