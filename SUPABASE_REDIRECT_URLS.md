# Настройка Redirect URLs в Supabase

## 🎯 Проблема
При деплое на Vercel получается 404 ошибка на `/auth/error` и `/auth/callback`.

## ✅ Решение
Добавьте следующие URL в настройки Supabase:

### 1. Site URL
```
https://your-app-name.vercel.app
```

### 2. Redirect URLs
Добавьте все эти URL в раздел "Redirect URLs":

```
# Для разработки
http://localhost:3000/auth/verify-email
http://localhost:3000/auth/reset-password
http://localhost:3000/auth/callback
http://localhost:3000/auth/error

# Для продакшена
https://your-app-name.vercel.app/auth/verify-email
https://your-app-name.vercel.app/auth/reset-password
https://your-app-name.vercel.app/auth/callback
https://your-app-name.vercel.app/auth/error
```

## 🔧 Как настроить

### В Supabase Dashboard:
1. Перейдите в **Authentication** → **Settings**
2. В разделе **Site URL** укажите ваш Vercel URL
3. В разделе **Redirect URLs** добавьте все URL из списка выше
4. Нажмите **Save**

### Пример для вашего проекта:
```
Site URL: https://v0-hvastik-alert-project-git-main-agentgl007-7440s-projects.vercel.app

Redirect URLs:
- https://v0-hvastik-alert-project-git-main-agentgl007-7440s-projects.vercel.app/auth/verify-email
- https://v0-hvastik-alert-project-git-main-agentgl007-7440s-projects.vercel.app/auth/reset-password
- https://v0-hvastik-alert-project-git-main-agentgl007-7440s-projects.vercel.app/auth/callback
- https://v0-hvastik-alert-project-git-main-agentgl007-7440s-projects.vercel.app/auth/error
```

## 📋 Созданные страницы

### 1. `/auth/error` - Обработка ошибок аутентификации
- Показывает понятные сообщения об ошибках
- Предлагает действия для решения проблемы
- Ссылки на повторную попытку или главную страницу

### 2. `/auth/callback` - Обработка callback'ов от Supabase
- Обрабатывает успешную аутентификацию
- Перенаправляет в личный кабинет
- Показывает статус обработки

## 🚀 После настройки

1. **Обновите настройки** в Supabase Dashboard
2. **Перезапустите приложение** на Vercel
3. **Протестируйте аутентификацию**:
   - Регистрация
   - Вход
   - Восстановление пароля
   - Email верификация

## 🔍 Проверка

После настройки все должно работать:
- ✅ Регистрация → перенаправление в кабинет
- ✅ Вход → перенаправление в кабинет  
- ✅ Восстановление пароля → перенаправление на страницу сброса
- ✅ Email верификация → перенаправление в кабинет
- ✅ Ошибки → показ понятных сообщений

---

**Дата:** 14 января 2025  
**Статус:** ✅ Готово к настройке
