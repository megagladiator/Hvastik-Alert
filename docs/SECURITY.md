# Руководство по безопасности - Hvastik-Alert

## 📋 Содержание

1. [Обзор безопасности](#обзор-безопасности)
2. [Аутентификация и авторизация](#аутентификация-и-авторизация)
3. [Защита данных](#защита-данных)
4. [Row Level Security (RLS)](#row-level-security-rls)
5. [Валидация и санитизация](#валидация-и-санитизация)
6. [Защита от атак](#защита-от-атак)
7. [Безопасность API](#безопасность-api)
8. [Мониторинг и аудит](#мониторинг-и-аудит)
9. [Рекомендации по безопасности](#рекомендации-по-безопасности)

## 🔒 Обзор безопасности

Hvastik-Alert реализует многоуровневую систему безопасности, включающую:
- **Аутентификацию** через Supabase Auth
- **Авторизацию** через Row Level Security
- **Валидацию данных** на клиенте и сервере
- **Защиту от основных веб-атак**
- **Шифрование** данных в покое и при передаче

### Принципы безопасности
1. **Принцип минимальных привилегий** - пользователи имеют доступ только к необходимым данным
2. **Защита в глубину** - множественные уровни защиты
3. **Не доверяй пользовательскому вводу** - валидация всех данных
4. **Логирование и мониторинг** - отслеживание подозрительной активности

## 🔐 Аутентификация и авторизация

### Supabase Auth

#### Настройка аутентификации
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

#### Регистрация пользователя
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securePassword123!'
})

if (error) {
  // Обработка ошибок регистрации
  console.error('Registration error:', error.message)
}
```

#### Вход в систему
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securePassword123!'
})

if (error) {
  // Обработка ошибок входа
  console.error('Login error:', error.message)
}
```

#### Получение текущего пользователя
```typescript
const { data: { user }, error } = await supabase.auth.getUser()

if (user) {
  // Пользователь авторизован
  console.log('User ID:', user.id)
  console.log('User Email:', user.email)
}
```

#### Выход из системы
```typescript
const { error } = await supabase.auth.signOut()
if (error) {
  console.error('Logout error:', error.message)
}
```

### Защищенные маршруты

#### Middleware для защиты маршрутов
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Защищенные маршруты
  const protectedRoutes = ['/cabinet', '/add', '/chats']
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !session) {
    // Перенаправление на страницу входа
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  return res
}

export const config = {
  matcher: ['/cabinet/:path*', '/add/:path*', '/chats/:path*']
}
```

#### Компонент для проверки авторизации
```typescript
// components/auth-guard.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)

      if (!user) {
        router.push('/auth')
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        if (event === 'SIGNED_OUT') {
          router.push('/auth')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  if (loading) {
    return fallback || <div>Загрузка...</div>
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
```

## 🛡️ Защита данных

### Шифрование

#### Передача данных (HTTPS)
```typescript
// Все запросы к Supabase автоматически используют HTTPS
const supabase = createClient(
  'https://your-project.supabase.co', // Обязательно HTTPS
  'your-anon-key'
)
```

#### Хранение данных
- **База данных**: PostgreSQL с шифрованием на уровне диска
- **Пароли**: Хеширование с bcrypt через Supabase Auth
- **JWT токены**: Подписанные токены с истечением срока действия

### Конфиденциальные данные

#### Обработка персональных данных
```typescript
// Валидация и санитизация контактных данных
function sanitizeContactInfo(phone: string, name: string) {
  // Удаление небезопасных символов
  const sanitizedPhone = phone.replace(/[^\d+\-\(\)\s]/g, '')
  const sanitizedName = name.replace(/[<>\"'&]/g, '')
  
  return {
    phone: sanitizedPhone,
    name: sanitizedName
  }
}

// Маскирование чувствительных данных в логах
function logUserAction(userId: string, action: string) {
  console.log(`User ${userId.slice(0, 8)}... performed ${action}`)
  // Не логируем полный ID пользователя
}
```

#### Защита контактной информации
```typescript
// components/contact-info.tsx
interface ContactInfoProps {
  phone: string
  name: string
  showPhone?: boolean
}

export default function ContactInfo({ phone, name, showPhone = true }: ContactInfoProps) {
  const [revealed, setRevealed] = useState(false)
  
  const maskedPhone = phone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 (***) ***-$4-$5')
  
  return (
    <div>
      <p>{name}</p>
      {showPhone && (
        <div>
          {revealed ? (
            <a href={`tel:${phone}`} className="text-blue-600">
              {phone}
            </a>
          ) : (
            <button 
              onClick={() => setRevealed(true)}
              className="text-gray-500"
            >
              {maskedPhone} (показать)
            </button>
          )}
        </div>
      )}
    </div>
  )
}
```

## 🔒 Row Level Security (RLS)

### Настройка RLS политик

#### Политики для таблицы pets
```sql
-- Включение RLS
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Политика: все могут читать объявления
CREATE POLICY "Pets are viewable by everyone" ON pets
  FOR SELECT USING (true);

-- Политика: только авторизованные пользователи могут создавать объявления
CREATE POLICY "Authenticated users can create pets" ON pets
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Политика: только владелец может обновлять свое объявление
CREATE POLICY "Users can update their own pets" ON pets
  FOR UPDATE USING (auth.uid() = user_id);

-- Политика: только владелец может удалять свое объявление
CREATE POLICY "Users can delete their own pets" ON pets
  FOR DELETE USING (auth.uid() = user_id);
```

#### Политики для таблицы chats
```sql
-- Политика: пользователи могут видеть только свои чаты
CREATE POLICY "Users can view their chats" ON chats
  FOR SELECT USING (
    auth.uid() = user_id OR auth.uid() = owner_id
  );

-- Политика: пользователи могут создавать чаты
CREATE POLICY "Users can create chats" ON chats
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND auth.uid() != owner_id
  );
```

#### Политики для таблицы messages
```sql
-- Политика: пользователи могут видеть сообщения только в своих чатах
CREATE POLICY "Users can view messages in their chats" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = messages.chat_id 
      AND (chats.user_id = auth.uid() OR chats.owner_id = auth.uid())
    )
  );

-- Политика: пользователи могут отправлять сообщения только в своих чатах
CREATE POLICY "Users can send messages in their chats" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = messages.chat_id 
      AND (chats.user_id = auth.uid() OR chats.owner_id = auth.uid())
    )
  );
```

### Проверка RLS в коде

```typescript
// Проверка прав доступа перед операциями
async function updatePet(petId: string, updates: Partial<Pet>) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Необходима авторизация')
  }

  // Проверяем, что пользователь является владельцем
  const { data: pet } = await supabase
    .from('pets')
    .select('user_id')
    .eq('id', petId)
    .single()

  if (!pet || pet.user_id !== user.id) {
    throw new Error('У вас нет прав для изменения этого объявления')
  }

  // Обновляем объявление
  const { data, error } = await supabase
    .from('pets')
    .update(updates)
    .eq('id', petId)
    .select()

  if (error) throw error
  return data
}
```

## ✅ Валидация и санитизация

### Валидация на клиенте

```typescript
// utils/validation.ts
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validatePetData(data: any): ValidationResult {
  const errors: string[] = []

  // Валидация имени
  if (!data.name || data.name.length < 2) {
    errors.push('Имя должно содержать минимум 2 символа')
  }
  if (data.name && data.name.length > 100) {
    errors.push('Имя не должно превышать 100 символов')
  }

  // Валидация породы
  if (!data.breed || data.breed.length < 2) {
    errors.push('Порода должна содержать минимум 2 символа')
  }

  // Валидация описания
  if (!data.description || data.description.length < 10) {
    errors.push('Описание должно содержать минимум 10 символов')
  }
  if (data.description && data.description.length > 1000) {
    errors.push('Описание не должно превышать 1000 символов')
  }

  // Валидация телефона
  if (!data.contact_phone) {
    errors.push('Необходимо указать номер телефона')
  } else if (!/^\+?[1-9]\d{1,14}$/.test(data.contact_phone.replace(/[\s\-\(\)]/g, ''))) {
    errors.push('Неверный формат номера телефона')
  }

  // Валидация координат
  if (!data.latitude || !data.longitude) {
    errors.push('Необходимо указать местоположение на карте')
  } else {
    if (data.latitude < -90 || data.latitude > 90) {
      errors.push('Неверная широта')
    }
    if (data.longitude < -180 || data.longitude > 180) {
      errors.push('Неверная долгота')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Пароль должен содержать минимум 8 символов')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать заглавную букву')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Пароль должен содержать строчную букву')
  }
  if (!/\d/.test(password)) {
    errors.push('Пароль должен содержать цифру')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
```

### Санитизация данных

```typescript
// utils/sanitization.ts
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html)
}

export function sanitizeText(text: string): string {
  return text
    .replace(/[<>\"'&]/g, '') // Удаление HTML символов
    .replace(/\s+/g, ' ')     // Нормализация пробелов
    .trim()                   // Удаление пробелов в начале и конце
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+\-\(\)\s]/g, '')
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Замена небезопасных символов
    .replace(/_{2,}/g, '_')          // Удаление множественных подчеркиваний
    .toLowerCase()
}
```

### Валидация файлов

```typescript
// utils/file-validation.ts
export interface FileValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateImageFile(file: File): FileValidationResult {
  const errors: string[] = []
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

  // Проверка размера
  if (file.size > maxSize) {
    errors.push('Размер файла не должен превышать 5MB')
  }

  // Проверка типа
  if (!allowedTypes.includes(file.type)) {
    errors.push('Поддерживаются только файлы JPEG, PNG и WebP')
  }

  // Проверка имени файла
  if (file.name.length > 255) {
    errors.push('Имя файла слишком длинное')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
```

## 🛡️ Защита от атак

### Защита от XSS

```typescript
// Автоматическая санитизация в React
function PetDescription({ description }: { description: string }) {
  // React автоматически экранирует HTML
  return <p>{description}</p>
}

// Для HTML контента используйте DOMPurify
import DOMPurify from 'isomorphic-dompurify'

function SafeHtmlContent({ html }: { html: string }) {
  const cleanHtml = DOMPurify.sanitize(html)
  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
}
```

### Защита от CSRF

```typescript
// Supabase автоматически защищает от CSRF
// Дополнительная защита через SameSite cookies
const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

### Защита от SQL Injection

```typescript
// Supabase использует параметризованные запросы
// НЕ ДЕЛАЙТЕ ТАК:
// const query = `SELECT * FROM pets WHERE name = '${userInput}'`

// ДЕЛАЙТЕ ТАК:
const { data, error } = await supabase
  .from('pets')
  .select('*')
  .eq('name', userInput) // Безопасно
```

### Rate Limiting

```typescript
// utils/rate-limiting.ts
class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []
    
    // Удаляем старые запросы
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }

    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    return true
  }
}

// Использование
const rateLimiter = new RateLimiter(60000, 10) // 10 запросов в минуту

export function checkRateLimit(userId: string): boolean {
  return rateLimiter.isAllowed(userId)
}
```

## 🔐 Безопасность API

### Валидация заголовков

```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  // Проверка Content-Type
  const contentType = req.headers.get('content-type')
  if (req.method === 'POST' && !contentType?.includes('application/json')) {
    return new Response('Invalid Content-Type', { status: 400 })
  }

  // Проверка Origin
  const origin = req.headers.get('origin')
  const allowedOrigins = [
    'http://localhost:3000',
    'https://your-domain.com'
  ]
  
  if (origin && !allowedOrigins.includes(origin)) {
    return new Response('Forbidden', { status: 403 })
  }

  return NextResponse.next()
}
```

### Обработка ошибок

```typescript
// utils/error-handling.ts
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      message: error.message
    }
  }

  // Не логируем детали внутренних ошибок
  console.error('Internal error:', error)
  return {
    status: 500,
    message: 'Внутренняя ошибка сервера'
  }
}
```

## 📊 Мониторинг и аудит

### Логирование безопасности

```typescript
// utils/security-logger.ts
interface SecurityEvent {
  type: 'AUTH_FAILURE' | 'RATE_LIMIT' | 'SUSPICIOUS_ACTIVITY' | 'DATA_ACCESS'
  userId?: string
  ip: string
  userAgent: string
  details: any
  timestamp: Date
}

export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>) {
  const securityEvent: SecurityEvent = {
    ...event,
    timestamp: new Date()
  }

  // Логирование в Supabase
  supabase
    .from('security_logs')
    .insert(securityEvent)
    .then(({ error }) => {
      if (error) {
        console.error('Failed to log security event:', error)
      }
    })

  // Логирование в консоль для разработки
  console.warn('Security Event:', securityEvent)
}
```

### Мониторинг подозрительной активности

```typescript
// utils/security-monitor.ts
export function monitorAuthAttempts(email: string, success: boolean) {
  if (!success) {
    logSecurityEvent({
      type: 'AUTH_FAILURE',
      ip: getClientIP(),
      userAgent: getUserAgent(),
      details: { email, attempt: 'failed' }
    })
  }
}

export function monitorDataAccess(userId: string, resource: string) {
  // Проверка на подозрительные паттерны доступа
  const accessPattern = `${userId}:${resource}`
  
  logSecurityEvent({
    type: 'DATA_ACCESS',
    userId,
    ip: getClientIP(),
    userAgent: getUserAgent(),
    details: { resource, accessPattern }
  })
}
```

## 📋 Рекомендации по безопасности

### Для разработчиков

1. **Регулярно обновляйте зависимости**
```bash
npm audit
npm audit fix
```

2. **Используйте TypeScript для типизации**
```typescript
// Строгая типизация предотвращает ошибки
interface User {
  id: string
  email: string
  role: 'user' | 'admin'
}
```

3. **Валидируйте все пользовательские данные**
```typescript
// Всегда валидируйте входные данные
const validatedData = validatePetData(userInput)
if (!validatedData.isValid) {
  throw new Error(validatedData.errors.join(', '))
}
```

4. **Используйте HTTPS везде**
```typescript
// Проверяйте, что все запросы используют HTTPS
if (process.env.NODE_ENV === 'production' && !req.secure) {
  return res.redirect(`https://${req.headers.host}${req.url}`)
}
```

### Для администраторов

1. **Регулярно проверяйте логи**
2. **Мониторьте использование ресурсов**
3. **Обновляйте Supabase до последней версии**
4. **Настройте резервное копирование**
5. **Используйте сильные пароли для сервисных аккаунтов**

### Для пользователей

1. **Используйте сильные пароли**
2. **Не передавайте контактную информацию в открытом виде**
3. **Встречайтесь в безопасных местах**
4. **Проверяйте документы на животных**

## 🚨 План реагирования на инциденты

### При обнаружении уязвимости

1. **Немедленно** изолируйте затронутые системы
2. **Оцените** масштаб проблемы
3. **Исправьте** уязвимость
4. **Протестируйте** исправление
5. **Разверните** исправление
6. **Уведомите** пользователей при необходимости
7. **Проведите** анализ инцидента

### Контакты для экстренных случаев

- **Техническая поддержка**: security@hvostik-alert.ru
- **Supabase Support**: support@supabase.com
- **Vercel Support**: support@vercel.com

---

*Руководство по безопасности обновлено: 7 сентября 2025*
