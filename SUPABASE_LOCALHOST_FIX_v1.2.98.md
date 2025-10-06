# 🚨 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Ссылки ведут на localhost

## Проблема
Ссылки в письмах для сброса пароля ведут на `localhost:3001` вместо `https://hvostikalert.ru`

**Пример неправильной ссылки:**
```
https://erjszhoaxapnkluezwpy.supabase.co/auth/v1/verify?token=pkce_xxx&type=magiclink&redirect_to=https://hvostikalert.ru/auth/callback
```

Но при переходе по ссылке происходит редирект на `localhost:3001/auth/reset-password`

## Причина
В настройках Supabase Dashboard установлен неправильный **Site URL** - скорее всего `http://localhost:3000` или `http://localhost:3001`

## ✅ РЕШЕНИЕ

### 1. Откройте Supabase Dashboard
Перейдите по ссылке:
```
https://supabase.com/dashboard/project/erjszhoaxapnkluezwpy/auth/settings
```

### 2. Исправьте Site URL
В разделе **Site URL** должно быть:
```
https://hvostikalert.ru
```

**НЕ должно быть:**
- `http://localhost:3000`
- `http://localhost:3001`
- Любой другой localhost URL

### 3. Проверьте Redirect URLs
В разделе **Redirect URLs** должны быть все эти URL:

```
https://hvostikalert.ru/auth/callback
https://hvostikalert.ru/auth/reset-password
https://hvostikalert.ru/auth/error
https://hvostikalert.ru/auth/verify-email
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password
http://localhost:3000/auth/error
http://localhost:3000/auth/verify-email
```

### 4. Сохраните настройки
Нажмите **Save** внизу страницы

### 5. Проверьте Email Templates
Перейдите в **Authentication → Email Templates → Reset Password**

Убедитесь, что в шаблоне используется правильный домен

### 6. Протестируйте
1. Зайдите на https://hvostikalert.ru/auth/forgot-password
2. Введите email и запросите сброс пароля
3. Проверьте письмо - ссылка должна вести на `https://hvostikalert.ru/auth/callback`
4. При переходе по ссылке должно происходить перенаправление на `/auth/reset-password`

## 🔧 Дополнительные проверки

### Проверка переменных окружения
Убедитесь, что на сервере установлены правильные переменные:
```bash
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://erjszhoaxapnkluezwpy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_anon_key
```

### Проверка кода
В `lib/auth.ts` добавлено логирование для отладки:
```typescript
console.log('🌐 Base URL for password reset:', baseUrl)
console.log('🌐 NODE_ENV:', process.env.NODE_ENV)
```

## 🚨 КРИТИЧНО
**Site URL в Supabase Dashboard** - это основная настройка, которая определяет, куда будут вести все ссылки в письмах. Если там установлен localhost, то все ссылки будут вести на localhost, независимо от кода приложения.

## 📝 Версия
**v1.2.98** - Исправление проблемы с localhost в ссылках сброса пароля

## 🧪 Тестирование
После исправления настроек:
1. Очистите кеш браузера
2. Запросите новую ссылку для сброса пароля
3. Проверьте, что ссылка в письме ведет на правильный домен
4. Убедитесь, что сброс пароля работает корректно
