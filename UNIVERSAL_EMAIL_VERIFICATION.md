# Универсальное решение для подтверждения email

## 🎯 Проблема
Firebase Console требует ручного изменения URL для каждого окружения (локальное, продакшн), что неудобно и неправильно.

## ✅ Решение
Создана универсальная система, которая автоматически определяет правильный URL в зависимости от окружения.

## 🔧 Как это работает

### 1. Универсальная функция определения URL
```typescript
// lib/utils.ts
export function getAppBaseUrl(): string {
  // В браузере - используем текущий домен
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // На сервере - используем переменные окружения
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  
  // Fallback для разработки
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }
  
  // Fallback для продакшена
  return 'https://your-domain.vercel.app'
}

export function getEmailVerificationUrl(): string {
  return `${getAppBaseUrl()}/auth/verify-email`
}
```

### 2. Автоматическое определение окружения

**В браузере (клиент):**
- Использует `window.location.origin`
- Автоматически: `http://localhost:3000` или `https://your-domain.com`

**На сервере:**
- Использует `process.env.NEXTAUTH_URL`
- Fallback на `NODE_ENV` для разработки

## 🚀 Преимущества

1. **Автоматическое определение URL** - не нужно менять настройки
2. **Работает везде** - локально, на Vercel, на любом хостинге
3. **Безопасность** - не нужно хранить URL в коде
4. **Простота** - один раз настроил, работает везде

## 📋 Настройка переменных окружения

### Для локальной разработки:
```env
NEXTAUTH_URL=http://localhost:3000
```

### Для продакшена (Vercel):
```env
NEXTAUTH_URL=https://your-domain.vercel.app
```

## 🧪 Тестирование

### Локально:
1. Запустите `npm run dev`
2. Зарегистрируйте пользователя
3. Проверьте письмо - ссылка будет `http://localhost:3000/auth/verify-email`

### На продакшене:
1. Деплой на Vercel
2. Зарегистрируйте пользователя
3. Проверьте письмо - ссылка будет `https://your-domain.vercel.app/auth/verify-email`

## 🔄 Что изменилось

1. **lib/utils.ts** - добавлены функции `getAppBaseUrl()` и `getEmailVerificationUrl()`
2. **app/register/page.tsx** - использует `getEmailVerificationUrl()`
3. **app/api/users/send-verification/route.ts** - использует `getEmailVerificationUrl()`

## ✨ Результат

Теперь система автоматически:
- Определяет правильный URL для текущего окружения
- Отправляет письма с корректными ссылками
- Работает без изменения настроек Firebase Console
- Легко переносится между окружениями
