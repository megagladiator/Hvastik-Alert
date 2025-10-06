# Исправление системы сброса пароля v1.2.75

**Дата:** 28 января 2025  
**Статус:** ✅ Готово к применению  
**Проблема:** Ошибка "Could not parse request body as JSON: json: cannot unmarshal object into Go struct field PKCEGrantParams.auth_code of type string"

## 🔍 Анализ проблемы

Ошибка возникала из-за неправильной обработки токенов в URL. Supabase отправляет разные типы токенов в зависимости от настроек:

1. **PKCE Flow** - использует параметр `code` + `code_verifier`
2. **Magic Link Flow** - использует параметр `token` + `type`
3. **Implicit Flow** - использует токены в hash

## ✅ Внесенные исправления

### 1. Обновлен модуль аутентификации (`lib/auth.ts`)

- ✅ Добавлено подробное логирование для отладки
- ✅ Создана функция `verifyPasswordResetToken()` для обработки токенов без type
- ✅ Улучшена обработка ошибок во всех функциях
- ✅ Добавлена автоматическая очистка `code_verifier` после использования

### 2. Обновлена страница сброса пароля (`app/auth/reset-password/page.tsx`)

- ✅ Добавлена обработка токенов без `type` параметра
- ✅ Улучшена логика определения типа токена
- ✅ Добавлена функция `handlePasswordResetToken()` для новых токенов
- ✅ Расширено логирование для отладки

### 3. Созданы новые страницы обработки ошибок

- ✅ `app/auth/error/page.tsx` - обработка ошибок аутентификации
- ✅ `app/auth/callback/page.tsx` - обработка redirect'ов от Supabase

## 🔧 Настройка Supabase Dashboard

### 1. Перейдите в Supabase Dashboard
URL: https://supabase.com/dashboard/project/erjszhoaxapnkluezwpy/auth/settings

### 2. Настройте Site URL
```
https://hvostikalert.ru
```

### 3. Настройте Redirect URLs
Добавьте все эти URL в раздел "Redirect URLs":

```
https://hvostikalert.ru/auth/callback
https://hvostikalert.ru/auth/error
https://hvostikalert.ru/auth/reset-password
https://hvostikalert.ru/auth/verify-email
```

### 4. Настройки Email Templates

В разделе **Authentication** → **Email Templates** → **Reset Password**:

- **Subject:** `Сброс пароля для Hvostik Alert`
- **Body:** Используйте стандартный шаблон Supabase

### 5. Настройки Rate Limits

В разделе **Authentication** → **Settings** → **Rate Limits**:

- **Email sends per hour:** 100+
- **Email sends per day:** 1000+

## 🧪 Тестирование

### 1. Тест полного flow сброса пароля

1. **Запрос сброса:**
   - Перейти на https://hvostikalert.ru/auth/forgot-password
   - Ввести email зарегистрированного пользователя
   - Нажать "Отправить ссылку для сброса"

2. **Проверка email:**
   - Проверить почту
   - Убедиться, что ссылка ведет на `https://hvostikalert.ru/auth/callback`

3. **Переход по ссылке:**
   - Кликнуть по ссылке в email
   - Должно произойти перенаправление на `/auth/reset-password`

4. **Установка нового пароля:**
   - Ввести новый пароль
   - Подтвердить пароль
   - Нажать "Установить новый пароль"

### 2. Тест обработки ошибок

1. **Истекшая ссылка:**
   - Подождать 1+ час после получения ссылки
   - Попробовать использовать ссылку
   - Должна появиться понятная ошибка

2. **Неправильная ссылка:**
   - Перейти на `/auth/reset-password` без параметров
   - Должна появиться ошибка с предложением запросить новую ссылку

### 3. Debug информация

Для отладки используйте:
- **Debug страница:** https://hvostikalert.ru/debug-password-reset
- **Консоль браузера:** все операции логируются с эмодзи
- **Network tab:** проверка API вызовов

## 📊 Логирование

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

## 🚨 Возможные проблемы и решения

### 1. "Code verifier missing"
**Причина:** `code_verifier` отсутствует в localStorage  
**Решение:** Запросить новую ссылку для сброса пароля

### 2. "Email link is invalid or has expired"
**Причина:** Ссылка уже использована или истекла  
**Решение:** Запросить новую ссылку

### 3. "Could not parse request body as JSON"
**Причина:** Неправильный тип токена в URL  
**Решение:** Используйте обновленную версию с поддержкой всех типов токенов

### 4. Ссылка ведет на localhost
**Причина:** Неправильные настройки в Supabase  
**Решение:** Обновить Site URL и Redirect URLs в Supabase Dashboard

## 🔄 Откат изменений

Если что-то пойдет не так, можно откатиться к предыдущей версии:

1. Восстановить файлы из git:
   ```bash
   git checkout HEAD~1 -- lib/auth.ts
   git checkout HEAD~1 -- app/auth/reset-password/page.tsx
   ```

2. Удалить новые файлы:
   ```bash
   rm app/auth/error/page.tsx
   rm app/auth/callback/page.tsx
   ```

## 📋 Чек-лист после применения

- [ ] Обновлены настройки в Supabase Dashboard
- [ ] Протестирован полный flow сброса пароля
- [ ] Проверена обработка ошибок
- [ ] Протестировано на разных браузерах
- [ ] Проверены логи в консоли браузера
- [ ] Убедиться, что debug страница работает

## 🎯 Ожидаемый результат

После применения всех исправлений:

- ✅ Сброс пароля работает без ошибок
- ✅ Понятные сообщения об ошибках
- ✅ Подробное логирование для отладки
- ✅ Поддержка всех типов токенов Supabase
- ✅ Автоматическая очистка временных данных
- ✅ Graceful обработка ошибок

---

**Версия:** 1.2.75  
**Дата:** 28 января 2025  
**Статус:** ✅ Готово к продакшену
