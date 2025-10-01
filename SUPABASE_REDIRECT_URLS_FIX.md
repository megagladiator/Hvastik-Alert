# Исправление Redirect URLs для Supabase

## Проблема
При сбросе пароля на продакшене (https://hvostikalert.ru) ссылка ведет на localhost:3000 вместо продакшена.

## Решение

### 1. Настройки в Supabase Dashboard

Перейдите в: https://supabase.com/dashboard/project/erjszhoaxapnkluezwpy/auth/settings

#### Site URL:
```
https://hvostikalert.ru
```

#### Redirect URLs (добавьте все эти URL):
```
https://hvostikalert.ru/auth/verify-email
https://hvostikalert.ru/auth/reset-password
https://hvostikalert.ru/auth/callback
https://hvostikalert.ru/auth/error
http://localhost:3000/auth/verify-email
http://localhost:3000/auth/reset-password
http://localhost:3000/auth/callback
http://localhost:3000/auth/error
```

### 2. Переменные окружения

В Vercel Dashboard (или где хостится продакшен) добавьте:
```
NEXTAUTH_URL=https://hvostikalert.ru
NODE_ENV=production
```

### 3. Что было исправлено в коде

1. **Обновлена функция `getBaseUrl`** - теперь правильно определяет продакшен URL
2. **Добавлена функция `getAllSupabaseRedirectUrls`** - возвращает все необходимые URL
3. **Улучшено логирование** в API для отладки

### 4. Тестирование

После настройки:
1. Зайдите на https://hvostikalert.ru/auth/forgot-password
2. Введите email и запросите сброс пароля
3. Проверьте, что ссылка в письме ведет на https://hvostikalert.ru/auth/callback
4. Убедитесь, что сброс пароля работает корректно

### 5. Проверка настроек

Можно проверить текущие настройки, вызвав в консоли браузера:
```javascript
// На продакшене должно вернуть https://hvostikalert.ru
console.log(window.location.origin)
```

## Важно!

После изменения настроек в Supabase Dashboard может потребоваться 1-2 минуты для применения изменений.
