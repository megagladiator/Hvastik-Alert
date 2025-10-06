# API Документация v1.2.74

## 📋 Обзор

Версия 1.2.74 включает **полную реализацию PKCE flow для сброса пароля** и **централизованный модуль аутентификации**. Все API используют Supabase для работы с данными и требуют права администратора.

## 🔐 Аутентификация

### ⚠️ ВАЖНЫЕ ИЗМЕНЕНИЯ v1.2.74

#### Удаленные API endpoints:
- ❌ **`POST /api/auth/forgot-password`** - удален, заменен на прямые вызовы Supabase

#### Новый подход к аутентификации:
- ✅ **Централизованный модуль** `lib/auth.ts` для всех auth операций
- ✅ **Прямые вызовы Supabase** вместо промежуточных API endpoints
- ✅ **Полная поддержка PKCE flow** для сброса пароля
- ✅ **Автоматическое управление** `code_verifier` в localStorage

### Требования
- Supabase сессия
- Email администратора: `agentgl007@gmail.com`
- Service Role Key для серверных операций

### Headers
```http
Authorization: Bearer <supabase-access-token>
Content-Type: application/json
```

## 🔄 Сброс пароля (PKCE Flow)

### ⚠️ МИГРАЦИЯ: С API на прямые вызовы

#### Старый способ (v1.1.3 и ранее):
```javascript
// Через API endpoint
const response = await fetch('/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
})
```

#### Новый способ (v1.2.74):
```javascript
// Прямой вызов Supabase через модуль
import { requestPasswordReset } from '@/lib/auth'

const { error } = await requestPasswordReset('user@example.com')
```

### Преимущества нового подхода:
- ✅ **Меньше кода** - нет промежуточных API endpoints
- ✅ **Лучшая производительность** - прямые вызовы Supabase
- ✅ **Типобезопасность** - полная поддержка TypeScript
- ✅ **Централизованная логика** - все в одном модуле
- ✅ **Автоматическое управление** - code_verifier, ошибки, очистка

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

## 🆕 Новые endpoints v1.2.74

### GET /api/test-redirect-urls

Тестовый endpoint для проверки redirect URLs.

#### Запрос
```http
GET /api/test-redirect-urls
```

#### Ответ
```json
{
  "currentUrl": "https://hvostikalert.ru/auth/callback",
  "baseUrl": "https://hvostikalert.ru",
  "environment": {
    "NODE_ENV": "production",
    "VERCEL_URL": null,
    "NEXTAUTH_URL": null
  },
  "headers": {
    "origin": "https://hvostikalert.ru",
    "host": "hvostikalert.ru",
    "x-forwarded-proto": "https",
    "x-forwarded-host": "hvostikalert.ru"
  },
  "message": "Test endpoint working"
}
```

### GET /api/test-supabase

Тестовый endpoint для проверки подключения к Supabase.

#### Запрос
```http
GET /api/test-supabase
```

#### Ответ
```json
{
  "success": true,
  "environment": {
    "SUPABASE_URL": "present",
    "SUPABASE_ANON_KEY": "present",
    "NODE_ENV": "production"
  },
  "supabase": {
    "isNull": false,
    "isUndefined": false,
    "hasAuth": true,
    "hasFrom": true
  },
  "testResult": "success",
  "message": "Supabase test completed"
}
```

### GET /api/test-env

Тестовый endpoint для проверки environment variables.

#### Запрос
```http
GET /api/test-env
```

#### Ответ
```json
{
  "environment": {
    "NODE_ENV": "production",
    "NEXT_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key",
    "VERCEL_URL": null,
    "NEXTAUTH_URL": null
  },
  "message": "Environment variables test completed"
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

### Новые типы ошибок v1.2.74

#### Ошибки PKCE flow
```json
{
  "error": "Code verifier missing, please request password reset again."
}
```

```json
{
  "error": "invalid request: both auth code and code verifier should be non-empty"
}
```

```json
{
  "error": "Email link is invalid or has expired"
}
```

### Типы ошибок

#### Ошибки аутентификации
- Неверный токен
- Истекший токен
- Недостаточно прав
- **Новые:** PKCE flow ошибки

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

### PKCE Flow Security v1.2.74
- ✅ **Code Verifier** генерируется на клиенте (128 символов)
- ✅ **Code Challenge** генерируется Supabase на основе verifier
- ✅ **Одноразовое использование** - verifier удаляется после использования
- ✅ **Автоматическая очистка** при ошибках
- ✅ **localStorage** для временного хранения code_verifier

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

### Новое логирование v1.2.74
```javascript
// PKCE flow логирование
console.log('🔑 Generated code_verifier:', codeVerifier.substring(0, 20) + '...')
console.log('💾 Saved to localStorage')
console.log('🔑 Code verifier from localStorage:', codeVerifier ? 'found' : 'not found')
console.log('Trying exchangeCodeForSession with code_verifier...')
console.log('exchangeCodeForSession successful')
```

### Метрики
- Количество запросов к API
- Время ответа
- Частота ошибок
- Использование ресурсов
- **Новые:** Успешность PKCE flow

## 🚀 Производительность

### Оптимизации
- Кэширование часто запрашиваемых данных
- Пагинация для больших наборов данных
- Ленивая загрузка
- Сжатие ответов
- **Новые:** Прямые вызовы Supabase (убрали промежуточные API)

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
- Текущая версия: v1.2.74
- Обратная совместимость
- **Breaking changes:** Удален `/api/auth/forgot-password`

## 🔄 Миграция с v1.1.3 на v1.2.74

### Шаги миграции:

1. **Обновить импорты:**
```javascript
// Старый способ
import { supabase } from '@/lib/supabase'

// Новый способ
import { requestPasswordReset, exchangeCodeForSession } from '@/lib/auth'
```

2. **Заменить API вызовы:**
```javascript
// Старый способ
const response = await fetch('/api/auth/forgot-password', {
  method: 'POST',
  body: JSON.stringify({ email })
})

// Новый способ
const { error } = await requestPasswordReset(email)
```

3. **Обновить обработку ошибок:**
```javascript
// Старый способ
if (!response.ok) {
  const data = await response.json()
  setError(data.error)
}

// Новый способ
if (error) {
  setError(error.message)
}
```

### Преимущества после миграции:
- ✅ **Меньше кода** - убрали промежуточные API endpoints
- ✅ **Лучшая производительность** - прямые вызовы Supabase
- ✅ **Типобезопасность** - полная поддержка TypeScript
- ✅ **Централизованная логика** - все auth операции в одном месте
- ✅ **Автоматическое управление** - code_verifier, ошибки, очистка

---

*Документация обновлена: 28 января 2025*  
*Версия API: 1.2.74*
