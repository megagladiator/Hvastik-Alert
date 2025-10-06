# 🔍 ПРАВИЛЬНЫЙ ДИАГНОЗ: Проблема с localhost в ссылках

## ✅ ЧТО ПРОВЕРЕНО И ПОДТВЕРЖДЕНО

### 1. Supabase Dashboard настройки - ПРАВИЛЬНЫЕ ✅
- **Site URL:** `https://hvostikalert.ru` ✅
- **Redirect URLs:** Настроены правильно ✅
- **Email Templates:** Используют правильный домен ✅

### 2. Код приложения - ПРАВИЛЬНЫЙ ✅
- **lib/auth.ts:** Использует правильную логику определения baseUrl ✅
- **Route Handler:** `/auth/callback/route.ts` настроен правильно ✅
- **Supabase клиенты:** Используют @supabase/ssr правильно ✅

## 🔍 ВОЗМОЖНЫЕ ПРИЧИНЫ ПРОБЛЕМЫ

### 1. NODE_ENV на сервере не установлен как 'production'
**Проверка:** Зайдите на https://hvostikalert.ru/debug-env

**Если NODE_ENV ≠ 'production':**
- Код использует `http://localhost:3000` вместо `https://hvostikalert.ru`
- **Решение:** Установить `NODE_ENV=production` на сервере

### 2. Кеширование Supabase
**Возможная причина:** Supabase кеширует старые настройки
**Решение:** Подождать 5-10 минут после изменения настроек

### 3. Неправильный подход к сбросу пароля
**Проблема:** Использовали `signInWithOtp` вместо `resetPasswordForEmail`
**Решение:** Вернулись к стандартному `resetPasswordForEmail`

## 🛠️ ИСПРАВЛЕНИЯ В v1.2.105

### 1. Вернулись к стандартному подходу
```typescript
// БЫЛО (неправильно):
const result = await supabase.auth.signInWithOtp({
  email: email,
  options: {
    emailRedirectTo: `${baseUrl}/auth/callback`,
    shouldCreateUser: false
  }
})

// СТАЛО (правильно):
const result = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${baseUrl}/auth/callback`
})
```

### 2. Добавлена страница диагностики
- **URL:** https://hvostikalert.ru/debug-env
- **Показывает:** NODE_ENV, переменные окружения, ожидаемые vs фактические значения

## 🧪 ПЛАН ТЕСТИРОВАНИЯ

### Шаг 1: Проверить переменные окружения
1. Зайдите на https://hvostikalert.ru/debug-env
2. Убедитесь, что NODE_ENV = 'production'
3. Если нет - установите NODE_ENV=production на сервере

### Шаг 2: Протестировать сброс пароля
1. Зайдите на https://hvostikalert.ru/auth/forgot-password
2. Введите email и запросите сброс пароля
3. Проверьте письмо - ссылка должна вести на `https://hvostikalert.ru/auth/callback`

### Шаг 3: Проверить логи в консоли
В консоли браузера должны быть логи:
```
🌐 Base URL for password reset: https://hvostikalert.ru
🌐 NODE_ENV: production
📧 Sending password reset email using resetPasswordForEmail...
```

## 🚨 КРИТИЧЕСКИ ВАЖНО

**Если NODE_ENV не установлен как 'production' на сервере:**
- Все ссылки будут вести на localhost
- Система сброса пароля не будет работать
- Это основная причина проблемы

## 📝 Версия
**v1.2.105** - Правильный диагноз и исправление проблемы с localhost

## 🎯 ОЖИДАЕМЫЙ РЕЗУЛЬТАТ
После исправления NODE_ENV на сервере:
- Ссылки в письмах будут вести на `https://hvostikalert.ru/auth/callback`
- Система сброса пароля заработает корректно
- Не будет ошибки `ERR_CONNECTION_REFUSED`
