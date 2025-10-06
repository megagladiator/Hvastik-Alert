# Руководство по отладке сброса пароля v1.2.74

**Версия:** 1.2.74  
**Дата:** 28 января 2025  
**Статус:** ✅ Готово к использованию

## 📋 Обзор

Подробное руководство по отладке системы сброса пароля с использованием PKCE flow и централизованного модуля аутентификации.

## 🔍 Debug страница

### Доступ к debug странице
**URL:** `https://hvostikalert.ru/debug-password-reset`

### Что показывает debug страница:
- ✅ **Полная информация о URL** - pathname, search, hash, origin
- ✅ **Все параметры** - query string и hash parameters
- ✅ **localStorage и sessionStorage** - содержимое хранилищ браузера
- ✅ **Cookies** - все cookies браузера
- ✅ **Environment info** - user agent, language, platform
- ✅ **Raw JSON data** - полные данные в JSON формате

### Как использовать:
1. Перейти на `/debug-password-reset`
2. Посмотреть все параметры и данные
3. Скопировать JSON для анализа
4. Использовать для отладки проблем

## 🐛 Типичные проблемы и решения

### 1. "Code verifier missing"

#### Симптомы:
```
Error: Code verifier missing, please request password reset again.
```

#### Причины:
- `code_verifier` отсутствует в localStorage
- Пользователь очистил localStorage
- Ссылка была использована несколько раз

#### Решение:
1. **Проверить localStorage:**
   ```javascript
   // В консоли браузера
   console.log('Code verifier:', localStorage.getItem('pkce_code_verifier'))
   ```

2. **Запросить новую ссылку:**
   - Перейти на `/auth/forgot-password`
   - Ввести email
   - Получить новую ссылку

3. **Проверить debug страницу:**
   - Перейти на `/debug-password-reset`
   - Посмотреть содержимое localStorage

### 2. "Email link is invalid or has expired"

#### Симптомы:
```
AuthApiError: Email link is invalid or has expired
```

#### Причины:
- Ссылка уже была использована
- Ссылка истекла (обычно 1 час)
- Неправильный `code_verifier`

#### Решение:
1. **Проверить время создания ссылки:**
   - Ссылки действительны 1 час
   - Запросить новую ссылку

2. **Проверить правильность flow:**
   ```javascript
   // Должно быть в localStorage
   const codeVerifier = localStorage.getItem('pkce_code_verifier')
   console.log('Code verifier exists:', !!codeVerifier)
   ```

3. **Использовать debug страницу:**
   - Проверить все параметры URL
   - Убедиться в наличии `code` параметра

### 3. "invalid request: both auth code and code verifier should be non-empty"

#### Симптомы:
```
AuthApiError: invalid request: both auth code and code verifier should be non-empty
```

#### Причины:
- Неправильное использование `verifyOtp` вместо `exchangeCodeForSession`
- Отсутствует `code_verifier` при вызове `exchangeCodeForSession`

#### Решение:
1. **Использовать правильную функцию:**
   ```javascript
   // Правильно - для PKCE flow
   const { data, error } = await exchangeCodeForSession(code)
   
   // Неправильно - для Magic Link flow
   const { data, error } = await verifyOtp({ token_hash: code, type: 'recovery' })
   ```

2. **Проверить наличие code_verifier:**
   ```javascript
   const codeVerifier = getCodeVerifier()
   if (!codeVerifier) {
     throw new Error('Code verifier missing')
   }
   ```

### 4. Ссылка ведет на localhost вместо продакшена

#### Симптомы:
- Ссылка в email содержит `localhost:3000`
- Перенаправление на локальный сайт

#### Причины:
- Неправильные настройки в Supabase Dashboard
- Неправильные environment variables

#### Решение:
1. **Проверить Supabase Dashboard:**
   - Site URL: `https://hvostikalert.ru`
   - Redirect URLs: `https://hvostikalert.ru/auth/reset-password`

2. **Проверить environment variables:**
   ```bash
   # На сервере
   echo $NODE_ENV
   echo $NEXT_PUBLIC_APP_URL
   ```

3. **Использовать test endpoints:**
   ```bash
   curl https://hvostikalert.ru/api/test-redirect-urls
   curl https://hvostikalert.ru/api/test-env
   ```

## 🔧 Логирование и мониторинг

### Логи в консоли браузера

#### Успешный flow:
```
🔑 Generated code_verifier: ABC123...
💾 Saved to localStorage
🔑 Code verifier from localStorage: found
Trying exchangeCodeForSession with code_verifier...
exchangeCodeForSession successful
Password successfully updated
```

#### Ошибка:
```
🔑 Code verifier from localStorage: not found
Error: Code verifier missing, please request password reset again.
```

### Логи на сервере

#### Успешная отправка email:
```
🔍 Forgot password request for: user@example.com
🔑 Code verifier provided: true
📧 Sending password reset email...
📧 Password reset request result: { email: 'user@example.com', error: null }
```

#### Ошибка отправки:
```
❌ Error sending password reset email: { message: 'User not found' }
```

## 🧪 Тестирование

### Тестовые сценарии

#### 1. Полный flow сброса пароля:
1. **Запрос сброса:**
   - Перейти на `/auth/forgot-password`
   - Ввести email
   - Проверить логи в консоли

2. **Получение email:**
   - Проверить почту
   - Убедиться в правильности ссылки

3. **Переход по ссылке:**
   - Кликнуть по ссылке
   - Проверить debug страницу
   - Убедиться в наличии `code` параметра

4. **Установка пароля:**
   - Ввести новый пароль
   - Проверить успешное обновление

#### 2. Тестирование ошибок:
1. **Истекшая ссылка:**
   - Подождать 1+ час
   - Попробовать использовать ссылку

2. **Отсутствующий code_verifier:**
   - Очистить localStorage
   - Попробовать использовать ссылку

3. **Неправильный email:**
   - Ввести несуществующий email
   - Проверить сообщение об ошибке

### Автоматические тесты

#### Проверка модуля аутентификации:
```javascript
// В консоли браузера
import { generateCodeVerifier, getCodeVerifier, clearCodeVerifier } from '@/lib/auth'

// Тест генерации
const verifier = generateCodeVerifier()
console.log('Generated:', verifier.length === 128)

// Тест сохранения
localStorage.setItem('pkce_code_verifier', verifier)
console.log('Saved:', getCodeVerifier() === verifier)

// Тест очистки
clearCodeVerifier()
console.log('Cleared:', getCodeVerifier() === null)
```

## 📊 Мониторинг

### Ключевые метрики

#### Успешность сброса пароля:
- Количество запросов сброса
- Количество успешных обновлений пароля
- Время от запроса до обновления

#### Ошибки:
- "Code verifier missing"
- "Email link is invalid or has expired"
- "User not found"
- "Too many requests"

### Логи для анализа

#### В консоли браузера:
```javascript
// Фильтр логов по сбросу пароля
console.log = function(...args) {
  if (args[0]?.includes('🔑') || args[0]?.includes('💾')) {
    console.info(...args)
  }
}
```

#### На сервере:
```bash
# Поиск логов сброса пароля
grep "Forgot password request" /var/log/nextjs.log
grep "Password reset request result" /var/log/nextjs.log
```

## 🛠️ Инструменты отладки

### Browser DevTools

#### Application Tab:
- **Local Storage** - проверить `pkce_code_verifier`
- **Session Storage** - проверить временные данные
- **Cookies** - проверить auth cookies

#### Network Tab:
- **XHR/Fetch** - проверить API вызовы
- **Response** - проверить ответы Supabase

#### Console:
- **Логи** - все логи аутентификации
- **Ошибки** - JavaScript ошибки

### Supabase Dashboard

#### Authentication:
- **Users** - проверить пользователей
- **Settings** - проверить настройки
- **Logs** - проверить логи аутентификации

#### Database:
- **auth.users** - проверить таблицу пользователей
- **auth.sessions** - проверить активные сессии

### Test Endpoints

#### Проверка redirect URLs:
```bash
curl https://hvostikalert.ru/api/test-redirect-urls
```

#### Проверка Supabase:
```bash
curl https://hvostikalert.ru/api/test-supabase
```

#### Проверка environment:
```bash
curl https://hvostikalert.ru/api/test-env
```

## 🚨 Экстренная диагностика

### Если сброс пароля не работает:

#### 1. Быстрая проверка:
```bash
# Проверить статус сервера
curl -I https://hvostikalert.ru

# Проверить API endpoints
curl https://hvostikalert.ru/api/test-supabase
curl https://hvostikalert.ru/api/test-env
```

#### 2. Проверить Supabase:
- Зайти в Supabase Dashboard
- Проверить статус проекта
- Проверить настройки Authentication
- Проверить Site URL и Redirect URLs

#### 3. Проверить логи:
```bash
# На сервере
tail -f /var/log/nextjs.log | grep -i "password\|auth"
```

#### 4. Использовать debug страницу:
- Перейти на `/debug-password-reset`
- Проверить все параметры
- Скопировать JSON для анализа

### Восстановление работоспособности:

#### 1. Перезапуск сервисов:
```bash
# На сервере
pm2 restart hvostik-alert
systemctl restart nginx
```

#### 2. Очистка кэша:
```bash
# Очистить кэш браузера
# Очистить localStorage
localStorage.clear()
```

#### 3. Проверка конфигурации:
- Проверить environment variables
- Проверить Supabase настройки
- Проверить redirect URLs

## 📋 Чек-лист отладки

### Перед началом отладки:
- [ ] Проверить статус сервера
- [ ] Проверить Supabase Dashboard
- [ ] Открыть debug страницу
- [ ] Включить логирование в консоли

### При отладке:
- [ ] Проверить все параметры URL
- [ ] Проверить localStorage/sessionStorage
- [ ] Проверить логи в консоли
- [ ] Проверить Network tab
- [ ] Проверить Supabase logs

### После исправления:
- [ ] Протестировать полный flow
- [ ] Проверить на разных браузерах
- [ ] Проверить на мобильных устройствах
- [ ] Задокументировать решение

## 📞 Поддержка

### Если проблема не решается:

1. **Собрать информацию:**
   - Скриншот debug страницы
   - Логи из консоли браузера
   - Логи с сервера
   - Описание шагов воспроизведения

2. **Проверить документацию:**
   - [AUTH_MODULE_DOCUMENTATION_v1.2.74.md](./AUTH_MODULE_DOCUMENTATION_v1.2.74.md)
   - [API_DOCUMENTATION_v1.2.74.md](./API_DOCUMENTATION_v1.2.74.md)
   - [CHANGELOG_v1.2.74.md](./CHANGELOG_v1.2.74.md)

3. **Обратиться к разработчику:**
   - Предоставить собранную информацию
   - Описать ожидаемое поведение
   - Указать версию браузера и ОС

---

*Руководство обновлено: 28 января 2025*  
*Версия: 1.2.74*
