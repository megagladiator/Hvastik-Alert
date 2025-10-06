# 🚨 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: NODE_ENV на сервере

## 🎯 ПРОБЛЕМА НАЙДЕНА!

**Причина ошибки `PKCEGrantParams.auth_code`:** `NODE_ENV` не установлен как `'production'` на боевом сервере.

### 🔍 Как это приводило к ошибке:

1. **Код использует тернарный оператор:**
   ```typescript
   const baseUrl = process.env.NODE_ENV === 'production' 
     ? 'https://hvostikalert.ru'  // ← НЕ используется
     : 'http://localhost:3000'    // ← Используется вместо этого
   ```

2. **Результат:** Все ссылки в письмах ведут на `localhost:3000`
3. **Ошибка:** Браузер не может перенаправить на localhost, PKCE flow нарушается

## ✅ РЕШЕНИЕ

### Вариант 1: Автоматическое исправление (Рекомендуется)

**Запустите файл:** `check_and_fix_env.bat`

Этот скрипт:
- Проверит текущие переменные окружения PM2
- Установит `NODE_ENV=production`
- Перезапустит PM2 процесс
- Проверит результат

### Вариант 2: Полная переконфигурация PM2

**Запустите файл:** `fix_pm2_config.bat`

Этот скрипт:
- Создаст новый `ecosystem.config.js` с правильными настройками
- Перезапустит PM2 с новой конфигурацией
- Установит все необходимые переменные окружения

### Вариант 3: Ручное исправление через SSH

```bash
# Подключитесь к серверу
ssh -i C:\Users\SuperBoss007\.ssh\id_rsa root@212.34.138.16

# Установите NODE_ENV для текущего процесса
pm2 set NODE_ENV production

# Перезапустите процесс
pm2 restart hvastik-alert

# Проверьте результат
pm2 env 0
```

## 🧪 ПРОВЕРКА РЕЗУЛЬТАТА

### 1. Проверьте страницу диагностики
Зайдите на: **https://hvostikalert.ru/debug-env**

**Ожидаемый результат:**
- NODE_ENV: `production` ✅
- Base URL: `https://hvostikalert.ru` ✅

### 2. Протестируйте сброс пароля
1. Зайдите на https://hvostikalert.ru/auth/forgot-password
2. Введите email и запросите сброс пароля
3. Проверьте письмо - ссылка должна вести на `https://hvostikalert.ru/auth/callback`
4. НЕ должно быть ошибки `ERR_CONNECTION_REFUSED`

### 3. Проверьте логи в консоли браузера
```
🌐 Base URL for password reset: https://hvostikalert.ru
🌐 NODE_ENV: production
📧 Sending password reset email using resetPasswordForEmail...
```

## 🚨 КРИТИЧЕСКИ ВАЖНО

**NODE_ENV на сервере** - это ключевая переменная, которая определяет:
- Какой URL используется для ссылок в письмах
- Какие настройки применяются в приложении
- Как работает система сброса пароля

**Без `NODE_ENV=production` система сброса пароля НЕ РАБОТАЕТ!**

## 📋 ЧЕКЛИСТ ИСПРАВЛЕНИЯ

- [ ] Запустить `check_and_fix_env.bat` или `fix_pm2_config.bat`
- [ ] Проверить https://hvostikalert.ru/debug-env
- [ ] Убедиться, что NODE_ENV = 'production'
- [ ] Протестировать сброс пароля
- [ ] Проверить, что ссылки ведут на правильный домен
- [ ] Убедиться, что нет ошибки ERR_CONNECTION_REFUSED

## 🎯 ОЖИДАЕМЫЙ РЕЗУЛЬТАТ

После исправления NODE_ENV:
- ✅ Ссылки в письмах ведут на `https://hvostikalert.ru/auth/callback`
- ✅ Система сброса пароля работает корректно
- ✅ Нет ошибки `PKCEGrantParams.auth_code`
- ✅ Нет ошибки `ERR_CONNECTION_REFUSED`
- ✅ Пользователи могут успешно сбрасывать пароли

## 📝 Версия
**v1.2.107** - Критическое исправление NODE_ENV на сервере

## 🔧 Файлы для исправления
- `check_and_fix_env.bat` - Быстрое исправление NODE_ENV
- `fix_pm2_config.bat` - Полная переконфигурация PM2
- `fix_pm2_config.sh` - Скрипт для сервера
- `app/debug-env/page.tsx` - Страница диагностики
