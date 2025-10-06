# 🚨 СРОЧНАЯ ПРОВЕРКА: Ссылки все еще ведут на localhost

## ❌ ПРОБЛЕМА ОСТАЕТСЯ
Несмотря на правильный NODE_ENV='production', ссылки по-прежнему ведут на `localhost:3001`

## 🔍 ВОЗМОЖНЫЕ ПРИЧИНЫ

### 1. Проблема в настройках Supabase Dashboard
**Проверьте:** https://supabase.com/dashboard/project/erjszhoaxapnkluezwpy/auth/url-configuration

**Возможные проблемы:**
- В Redirect URLs есть `http://localhost:3000` или `http://localhost:3001`
- Supabase использует первый URL из списка Redirect URLs
- Site URL переопределяется Redirect URLs

### 2. Кеширование Supabase
- Supabase может кешировать старые настройки
- Подождите 10-15 минут после изменения настроек

### 3. Проблема в коде
- `resetPasswordForEmail` может игнорировать `redirectTo` параметр
- Supabase может использовать настройки из Dashboard вместо параметров

## ✅ ИСПРАВЛЕНИЯ В v1.2.110

### 1. Принудительное указание URL в коде
```typescript
// ПРИНУДИТЕЛЬНО используем продакшн URL
const baseUrl = 'https://hvostikalert.ru'

// Используем signInWithOtp с принудительным URL
const result = await supabase.auth.signInWithOtp({
  email: email,
  options: {
    emailRedirectTo: `${baseUrl}/auth/callback`,
    shouldCreateUser: false
  }
})
```

### 2. Добавлено подробное логирование
```typescript
console.log('🌐 FORCED Base URL for password reset:', baseUrl)
console.log('📧 Redirect URL used:', `${baseUrl}/auth/callback`)
```

## 🧪 ПЛАН ДЕЙСТВИЙ

### Шаг 1: Проверить настройки Supabase Dashboard
1. Зайдите на: https://supabase.com/dashboard/project/erjszhoaxapnkluezwpy/auth/url-configuration
2. **Удалите все localhost URLs из Redirect URLs:**
   - Удалите `http://localhost:3000/auth/callback`
   - Удалите `http://localhost:3000/auth/reset-password`
   - Удалите `http://localhost:3000/auth/error`
   - Удалите `http://localhost:3000/auth/verify-email`
3. **Оставьте только продакшн URLs:**
   ```
   https://hvostikalert.ru/auth/callback
   https://hvostikalert.ru/auth/reset-password
   https://hvostikalert.ru/auth/error
   https://hvostikalert.ru/auth/verify-email
   ```
4. **Сохраните настройки**

### Шаг 2: Протестировать с новым кодом
1. Запросите новую ссылку для сброса пароля
2. Проверьте логи в консоли:
   ```
   🌐 FORCED Base URL for password reset: https://hvostikalert.ru
   📧 Redirect URL used: https://hvostikalert.ru/auth/callback
   ```
3. Проверьте письмо - ссылка должна вести на правильный домен

### Шаг 3: Если проблема остается
1. Подождите 10-15 минут (кеширование Supabase)
2. Очистите кеш браузера
3. Попробуйте в режиме инкогнито

## 🚨 КРИТИЧЕСКИ ВАЖНО

**Redirect URLs в Supabase Dashboard имеют приоритет над параметрами в коде!**

Если в Redirect URLs есть localhost URL, Supabase будет использовать его вместо параметра `emailRedirectTo`.

## 📋 ЧЕКЛИСТ ИСПРАВЛЕНИЯ

- [ ] Удалить все localhost URLs из Redirect URLs в Supabase Dashboard
- [ ] Оставить только продакшн URLs в Redirect URLs
- [ ] Сохранить настройки в Supabase Dashboard
- [ ] Подождать 10-15 минут
- [ ] Протестировать сброс пароля
- [ ] Проверить логи в консоли
- [ ] Убедиться, что ссылка ведет на правильный домен

## 🎯 ОЖИДАЕМЫЙ РЕЗУЛЬТАТ

После удаления localhost URLs из Redirect URLs:
- ✅ Ссылки в письмах будут вести на `https://hvostikalert.ru/auth/callback`
- ✅ Нет ошибки `ERR_CONNECTION_REFUSED`
- ✅ Система сброса пароля заработает корректно

## 📝 Версия
**v1.2.110** - Принудительное указание URL и проверка настроек Supabase Dashboard

