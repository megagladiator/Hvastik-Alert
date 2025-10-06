# Инструкция по тестированию исправлений сброса пароля v1.2.75

**Дата:** 28 января 2025  
**Статус:** ✅ Готово к тестированию

## 🚀 Что было исправлено

1. **Обновлен модуль аутентификации** - поддержка всех типов токенов Supabase
2. **Улучшена страница сброса пароля** - правильная обработка разных токенов
3. **Добавлена отладочная информация** - полная техническая информация на странице запроса сброса
4. **Созданы страницы обработки ошибок** - понятные сообщения вместо технических ошибок

## 🔧 Настройка Supabase (ОБЯЗАТЕЛЬНО!)

### 1. Перейдите в Supabase Dashboard
URL: https://supabase.com/dashboard/project/erjszhoaxapnkluezwpy/auth/settings

### 2. Настройте Site URL
```
https://hvostikalert.ru
```

### 3. Настройте Redirect URLs
Добавьте все эти URL:
```
https://hvostikalert.ru/auth/callback
https://hvostikalert.ru/auth/error
https://hvostikalert.ru/auth/reset-password
https://hvostikalert.ru/auth/verify-email
```

## 🧪 Тестирование

### 1. Деплой изменений
```bash
git add .
git commit -m "Fix password reset system v1.2.75 - add debug info and improve token handling"
git push origin main
```

### 2. Проверка отладочной информации
1. Перейдите на https://hvostikalert.ru/auth/forgot-password
2. Прокрутите вниз до секции "🔍 Техническая информация"
3. Проверьте:
   - **URL Information** - должен показывать правильный домен
   - **Environment** - Node Env: production, Supabase URL: правильный
   - **User & Session** - статус аутентификации
   - **Local Storage** - наличие/отсутствие pkce_code_verifier
   - **Cookies** - наличие auth cookies

### 3. Тест сброса пароля
1. **Запрос сброса:**
   - Введите email зарегистрированного пользователя
   - Нажмите "Отправить ссылку для сброса"
   - Проверьте консоль браузера на логи

2. **Проверка email:**
   - Проверьте почту
   - Убедитесь, что ссылка ведет на `https://hvostikalert.ru/auth/callback`

3. **Переход по ссылке:**
   - Кликните по ссылке в email
   - Должно произойти перенаправление на `/auth/reset-password`
   - Проверьте консоль браузера на логи обработки токена

4. **Установка нового пароля:**
   - Введите новый пароль
   - Подтвердите пароль
   - Нажмите "Установить новый пароль"

## 📊 Что смотреть в логах

### Успешный flow:
```
🔍 Forgot password request for: user@example.com
🔑 Generated code_verifier: ABC123...
💾 Saved to localStorage
📧 Sending password reset email...
📧 Password reset request result: { email: 'user@example.com', error: null }
🔑 Code verifier from localStorage: found
Trying exchangeCodeForSession with code_verifier...
✅ exchangeCodeForSession successful
🔑 Updating password...
✅ Password successfully updated
🧹 Cleaned up code_verifier from localStorage
```

### Ошибка:
```
🔑 Code verifier from localStorage: not found
Error: Code verifier missing, please request password reset again.
```

## 🔍 Отладочная информация

На странице `/auth/forgot-password` теперь показывается:

- **📍 URL Information** - полная информация о URL
- **🌐 Environment** - настройки окружения
- **👤 User & Session** - информация о текущем пользователе и сессии
- **💾 Local Storage** - содержимое localStorage
- **🗂️ Session Storage** - содержимое sessionStorage
- **🍪 Cookies** - все cookies браузера
- **🔍 URL Parameters** - параметры из URL
- **⏰ Timestamp** - время загрузки страницы

## 🚨 Возможные проблемы

### 1. "Code verifier missing"
**Решение:** Запросить новую ссылку для сброса пароля

### 2. Ссылка ведет на localhost
**Решение:** Обновить Site URL в Supabase Dashboard

### 3. "Could not parse request body as JSON"
**Решение:** Используйте обновленную версию с поддержкой всех типов токенов

## 📋 Чек-лист тестирования

- [ ] Настроены Site URL и Redirect URLs в Supabase
- [ ] Деплоены изменения на хостинг
- [ ] Проверена отладочная информация на странице
- [ ] Протестирован полный flow сброса пароля
- [ ] Проверены логи в консоли браузера
- [ ] Проверена обработка ошибок
- [ ] Протестировано на разных браузерах

## 🎯 Ожидаемый результат

После применения всех исправлений:

- ✅ Отладочная информация отображается корректно
- ✅ Сброс пароля работает без ошибок
- ✅ Понятные сообщения об ошибках
- ✅ Подробное логирование для отладки
- ✅ Поддержка всех типов токенов Supabase

---

**Версия:** 1.2.75  
**Дата:** 28 января 2025  
**Статус:** ✅ Готово к продакшену
