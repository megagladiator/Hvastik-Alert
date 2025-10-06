# 🚨 СРОЧНОЕ ИСПРАВЛЕНИЕ: Ссылки ведут на localhost

## ❌ ПРОБЛЕМА
Ссылки в письмах для сброса пароля ведут на `localhost:3001` вместо `https://hvostikalert.ru`

**Доказательство:** Скриншот показывает `ERR_CONNECTION_REFUSED` при попытке доступа к `localhost:3001/auth/reset-password`

## 🔍 ПРИЧИНА
В настройках **Supabase Dashboard** установлен неправильный **Site URL** - скорее всего `http://localhost:3000` или `http://localhost:3001`

## ✅ СРОЧНОЕ РЕШЕНИЕ

### 1. Откройте Supabase Dashboard
```
https://supabase.com/dashboard/project/erjszhoaxapnkluezwpy/auth/settings
```

### 2. Найдите раздел "Site URL"
**ТЕКУЩЕЕ ЗНАЧЕНИЕ (неправильное):**
```
http://localhost:3000
```
или
```
http://localhost:3001
```

**ИЗМЕНИТЬ НА (правильное):**
```
https://hvostikalert.ru
```

### 3. Проверьте Redirect URLs
В разделе **Redirect URLs** должны быть:

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

## 🚨 КРИТИЧНО ВАЖНО

**Site URL в Supabase Dashboard** - это основная настройка, которая определяет:
- Куда будут вести все ссылки в письмах
- Какой домен будет использоваться для redirect'ов
- Какой домен будет в magic link'ах

**Если Site URL = localhost, то ВСЕ ссылки будут вести на localhost!**

## 🧪 ТЕСТИРОВАНИЕ ПОСЛЕ ИСПРАВЛЕНИЯ

1. **Очистите кеш браузера**
2. **Запросите новую ссылку для сброса пароля:**
   - Перейдите на https://hvostikalert.ru/auth/forgot-password
   - Введите email
   - Нажмите "Отправить ссылку для сброса"
3. **Проверьте письмо:**
   - Ссылка должна вести на `https://hvostikalert.ru/auth/callback`
   - НЕ должна вести на `localhost`
4. **Перейдите по ссылке:**
   - Должно произойти перенаправление на `/auth/reset-password`
   - НЕ должно быть ошибки `ERR_CONNECTION_REFUSED`

## 📋 ЧЕКЛИСТ ИСПРАВЛЕНИЯ

- [ ] Открыть Supabase Dashboard
- [ ] Найти раздел "Site URL"
- [ ] Изменить Site URL на `https://hvostikalert.ru`
- [ ] Проверить Redirect URLs
- [ ] Сохранить настройки
- [ ] Протестировать сброс пароля
- [ ] Убедиться, что ссылка ведет на правильный домен

## 🔧 ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА

Если проблема не решается, проверьте:

1. **Переменные окружения на сервере:**
   ```bash
   NODE_ENV=production
   NEXT_PUBLIC_SUPABASE_URL=https://erjszhoaxapnkluezwpy.supabase.co
   ```

2. **Кеш Supabase:**
   - Подождите 5-10 минут после изменения настроек
   - Supabase может кешировать настройки

3. **Проверьте логи в консоли браузера:**
   ```
   🌐 Base URL for password reset: https://hvostikalert.ru
   🌐 NODE_ENV: production
   ```

## 📝 Версия
**v1.2.103** - Срочное исправление localhost в ссылках сброса пароля

## ⚡ СРОЧНОСТЬ
**КРИТИЧЕСКАЯ** - Система сброса пароля не работает из-за неправильных настроек Supabase
