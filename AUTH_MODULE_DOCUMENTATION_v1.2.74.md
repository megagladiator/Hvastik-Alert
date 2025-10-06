# Документация модуля аутентификации v1.2.74

**Файл:** `lib/auth.ts`  
**Версия:** 1.2.74  
**Дата:** 28 января 2025  
**Статус:** ✅ Протестировано и готово к продакшену

## 📋 Обзор

Централизованный модуль аутентификации для работы с Supabase Auth, включающий полную поддержку PKCE flow для сброса пароля и все основные операции аутентификации.

## 🚀 Быстрый старт

```typescript
import { 
  signUp, 
  signIn, 
  requestPasswordReset, 
  exchangeCodeForSession,
  updatePassword 
} from '@/lib/auth'

// Регистрация
const { data, error } = await signUp('user@example.com', 'password123')

// Вход
const { data, error } = await signIn('user@example.com', 'password123')

// Сброс пароля (PKCE flow)
const { error } = await requestPasswordReset('user@example.com')
// code_verifier автоматически генерируется и сохраняется

// На странице сброса пароля
const { data, error } = await exchangeCodeForSession(code)
// code_verifier автоматически извлекается из localStorage

// Установка нового пароля
await updatePassword('newPassword123')
```

## 📚 API Reference

### 🔑 Генерация PKCE code_verifier

```typescript
generateCodeVerifier(len = 128): string
```

**Описание:** Генерирует случайную строку для PKCE flow.

**Параметры:**
- `len` (number, optional) - длина строки (по умолчанию 128)

**Возвращает:** string - случайная строка из допустимых символов

**Пример:**
```typescript
const verifier = generateCodeVerifier()
// "ABC123def456..."
```

---

### 👤 Регистрация и авторизация

#### signUp
```typescript
signUp(email: string, password: string)
```

**Описание:** Регистрация нового пользователя.

**Параметры:**
- `email` (string) - email пользователя
- `password` (string) - пароль пользователя

**Возвращает:** Promise с результатом регистрации

**Пример:**
```typescript
const { data, error } = await signUp('user@example.com', 'password123')
if (error) {
  console.error('Ошибка регистрации:', error.message)
} else {
  console.log('Пользователь зарегистрирован:', data.user)
}
```

#### signIn
```typescript
signIn(email: string, password: string)
```

**Описание:** Авторизация пользователя.

**Параметры:**
- `email` (string) - email пользователя
- `password` (string) - пароль пользователя

**Возвращает:** Promise с результатом авторизации

**Пример:**
```typescript
const { data, error } = await signIn('user@example.com', 'password123')
if (error) {
  console.error('Ошибка входа:', error.message)
} else {
  console.log('Пользователь авторизован:', data.user)
}
```

#### signOut
```typescript
signOut()
```

**Описание:** Выход из системы.

**Возвращает:** Promise с результатом выхода

**Пример:**
```typescript
const { error } = await signOut()
if (error) {
  console.error('Ошибка выхода:', error.message)
} else {
  console.log('Пользователь вышел из системы')
}
```

---

### 🔄 Сброс пароля (PKCE Flow)

#### requestPasswordReset
```typescript
requestPasswordReset(email: string)
```

**Описание:** Запрос ссылки для сброса пароля с автоматической генерацией и сохранением `code_verifier`.

**Параметры:**
- `email` (string) - email пользователя

**Возвращает:** Promise с результатом отправки email

**Особенности:**
- ✅ Автоматически генерирует `code_verifier`
- ✅ Сохраняет `code_verifier` в localStorage
- ✅ Определяет правильный redirect URL (production/development)
- ✅ Передает `code_verifier` в Supabase

**Пример:**
```typescript
const { error } = await requestPasswordReset('user@example.com')
if (error) {
  console.error('Ошибка отправки email:', error.message)
} else {
  console.log('Email для сброса пароля отправлен')
}
```

#### exchangeCodeForSession
```typescript
exchangeCodeForSession(code: string)
```

**Описание:** Обмен кода из URL на сессию пользователя.

**Параметры:**
- `code` (string) - код из URL параметра

**Возвращает:** Promise с результатом обмена

**Особенности:**
- ✅ Автоматически извлекает `code_verifier` из localStorage
- ✅ Проверяет наличие `code_verifier`
- ✅ Выбрасывает ошибку если `code_verifier` отсутствует

**Пример:**
```typescript
const code = searchParams.get('code')
if (code) {
  const { data, error } = await exchangeCodeForSession(code)
  if (error) {
    console.error('Ошибка обмена кода:', error.message)
  } else {
    console.log('Сессия установлена:', data.session)
  }
}
```

#### updatePassword
```typescript
updatePassword(newPassword: string)
```

**Описание:** Обновление пароля пользователя.

**Параметры:**
- `newPassword` (string) - новый пароль

**Возвращает:** Promise (выбрасывает ошибку при неудаче)

**Особенности:**
- ✅ Автоматически удаляет `code_verifier` после успешного обновления
- ✅ Требует активную сессию пользователя

**Пример:**
```typescript
try {
  await updatePassword('newPassword123')
  console.log('Пароль успешно обновлен')
} catch (error) {
  console.error('Ошибка обновления пароля:', error.message)
}
```

---

### 🔐 Управление сессией

#### getCurrentUser
```typescript
getCurrentUser()
```

**Описание:** Получение текущего пользователя.

**Возвращает:** Promise с данными пользователя

**Пример:**
```typescript
try {
  const user = await getCurrentUser()
  console.log('Текущий пользователь:', user)
} catch (error) {
  console.error('Пользователь не авторизован:', error.message)
}
```

#### getCurrentSession
```typescript
getCurrentSession()
```

**Описание:** Получение текущей сессии.

**Возвращает:** Promise с данными сессии

**Пример:**
```typescript
try {
  const session = await getCurrentSession()
  console.log('Текущая сессия:', session)
} catch (error) {
  console.error('Сессия не найдена:', error.message)
}
```

#### setSession
```typescript
setSession(accessToken: string, refreshToken: string)
```

**Описание:** Установка сессии из токенов (для Implicit flow).

**Параметры:**
- `accessToken` (string) - access token
- `refreshToken` (string) - refresh token

**Возвращает:** Promise с результатом установки сессии

**Пример:**
```typescript
const { error } = await setSession(accessToken, refreshToken)
if (error) {
  console.error('Ошибка установки сессии:', error.message)
} else {
  console.log('Сессия установлена')
}
```

---

### 🔍 Верификация токенов

#### verifyOtp
```typescript
verifyOtp(token: string, type: string)
```

**Описание:** Верификация OTP токена (для Magic Link flow).

**Параметры:**
- `token` (string) - токен для верификации
- `type` (string) - тип токена ('recovery', 'email', etc.)

**Возвращает:** Promise с результатом верификации

**Пример:**
```typescript
const { data, error } = await verifyOtp(token, 'recovery')
if (error) {
  console.error('Ошибка верификации:', error.message)
} else {
  console.log('Токен верифицирован:', data)
}
```

#### getSessionFromUrl
```typescript
getSessionFromUrl()
```

**Описание:** Получение сессии из URL (автоматическая обработка всех типов токенов).

**Возвращает:** Promise с результатом обработки URL

**Пример:**
```typescript
const { data, error } = await getSessionFromUrl()
if (error) {
  console.error('Ошибка обработки URL:', error.message)
} else if (data.session) {
  console.log('Сессия получена из URL:', data.session)
}
```

---

### 🛠️ Утилиты

#### getCodeVerifier
```typescript
getCodeVerifier(): string | null
```

**Описание:** Получение `code_verifier` из localStorage.

**Возвращает:** string | null - code_verifier или null если не найден

**Пример:**
```typescript
const verifier = getCodeVerifier()
if (verifier) {
  console.log('Code verifier найден')
} else {
  console.log('Code verifier отсутствует')
}
```

#### clearCodeVerifier
```typescript
clearCodeVerifier()
```

**Описание:** Удаление `code_verifier` из localStorage.

**Пример:**
```typescript
clearCodeVerifier()
console.log('Code verifier удален')
```

#### isAuthenticated
```typescript
isAuthenticated(): boolean
```

**Описание:** Проверка авторизации пользователя.

**Возвращает:** boolean - true если пользователь авторизован

**Пример:**
```typescript
if (isAuthenticated()) {
  console.log('Пользователь авторизован')
} else {
  console.log('Пользователь не авторизован')
}
```

---

## 🔄 Полный Flow сброса пароля

### 1. Запрос сброса пароля
```typescript
// На странице /auth/forgot-password
const { error } = await requestPasswordReset('user@example.com')
// code_verifier автоматически генерируется и сохраняется в localStorage
```

### 2. Обработка ссылки из email
```typescript
// На странице /auth/reset-password
const code = searchParams.get('code')
if (code) {
  const { data, error } = await exchangeCodeForSession(code)
  // code_verifier автоматически извлекается из localStorage
}
```

### 3. Установка нового пароля
```typescript
// После успешного обмена кода на сессию
await updatePassword('newPassword123')
// code_verifier автоматически удаляется после успешного обновления
```

## 🛡️ Безопасность

### PKCE Flow
- ✅ **Code Verifier** генерируется на клиенте (128 символов)
- ✅ **Code Challenge** генерируется Supabase на основе verifier
- ✅ **Одноразовое использование** - verifier удаляется после использования
- ✅ **Автоматическая очистка** при ошибках

### Управление токенами
- ✅ **localStorage** для code_verifier (временное хранение)
- ✅ **Автоматическая очистка** после использования
- ✅ **Проверка наличия** перед использованием
- ✅ **Обработка ошибок** с очисткой данных

## 🐛 Отладка

### Логирование
Все функции модуля включают подробное логирование:

```typescript
// В консоли браузера
🔑 Generated code_verifier: ABC123...
💾 Saved to localStorage
🔑 Code verifier from localStorage: found
Trying exchangeCodeForSession with code_verifier...
exchangeCodeForSession successful
```

### Debug страница
Используйте `/debug-password-reset` для анализа:
- Все параметры URL
- Содержимое localStorage/sessionStorage
- Cookies и environment info
- Raw JSON данные

### Типичные ошибки

#### "Code verifier missing"
```typescript
// Проблема: code_verifier отсутствует в localStorage
// Решение: запросить новую ссылку для сброса пароля
```

#### "Email link is invalid or has expired"
```typescript
// Проблема: токен истек или уже использован
// Решение: запросить новую ссылку
```

#### "invalid request: both auth code and code verifier should be non-empty"
```typescript
// Проблема: неправильный PKCE flow
// Решение: использовать exchangeCodeForSession вместо verifyOtp
```

## 📝 Примеры использования

### React компонент для сброса пароля
```typescript
"use client"
import { useState } from 'react'
import { requestPasswordReset } from '@/lib/auth'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await requestPasswordReset(email)
      if (error) {
        setError(error.message)
      } else {
        // Успех - показать сообщение пользователю
      }
    } catch (err: any) {
      setError('Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Отправка...' : 'Сбросить пароль'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  )
}
```

### Обработка сброса пароля
```typescript
"use client"
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { exchangeCodeForSession, updatePassword } from '@/lib/auth'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      handleCodeExchange(code)
    } else {
      setError('Код восстановления отсутствует')
      setIsProcessing(false)
    }
  }, [searchParams])

  const handleCodeExchange = async (code: string) => {
    try {
      const { error } = await exchangeCodeForSession(code)
      if (error) {
        setError(error.message)
      }
    } catch (err: any) {
      setError('Ошибка обработки ссылки')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updatePassword(password)
      // Успех - перенаправить на страницу входа
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (isProcessing) {
    return <div>Обработка ссылки...</div>
  }

  if (error) {
    return <div>Ошибка: {error}</div>
  }

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Новый пароль"
        required
        minLength={6}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Обновление...' : 'Установить пароль'}
      </button>
    </form>
  )
}
```

## 🚀 Миграция

### С API endpoints на прямые вызовы
```typescript
// Старый способ (через API)
const response = await fetch('/api/auth/forgot-password', {
  method: 'POST',
  body: JSON.stringify({ email })
})

// Новый способ (прямой вызов)
const { error } = await requestPasswordReset(email)
```

### Преимущества миграции:
- ✅ **Меньше кода** - нет промежуточных API endpoints
- ✅ **Лучшая производительность** - прямые вызовы Supabase
- ✅ **Типобезопасность** - полная поддержка TypeScript
- ✅ **Централизованная логика** - все в одном модуле
- ✅ **Автоматическое управление** - code_verifier, ошибки, очистка

## 📋 Чек-лист

### Перед использованием:
- [ ] Supabase настроен с правильными redirect URLs
- [ ] Environment variables установлены
- [ ] PKCE flow включен в Supabase Dashboard
- [ ] Email templates настроены

### При разработке:
- [ ] Использовать функции из `lib/auth.ts`
- [ ] Обрабатывать ошибки правильно
- [ ] Логировать для отладки
- [ ] Тестировать на разных браузерах

### При деплое:
- [ ] Проверить environment variables
- [ ] Убедиться в правильности redirect URLs
- [ ] Протестировать полный flow
- [ ] Проверить логи на ошибки

---

*Документация обновлена: 28 января 2025*  
*Версия модуля: 1.2.74*
