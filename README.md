# Hvastik Alert - Платформа поиска домашних животных

[![Version](https://img.shields.io/badge/version-1.2.74-blue.svg)](https://github.com/megagladiator/Hvastik-Alert)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com)
[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org)

## 🎯 Обзор

**Hvastik Alert** - это современная веб-платформа для поиска потерянных и найденных домашних животных в Анапе. Система позволяет пользователям создавать объявления о пропавших питомцах, просматривать интерактивную карту с местоположениями и общаться в реальном времени.

## 🚀 Версия 1.2.74 - Полная реализация PKCE flow для сброса пароля

### 🆕 НОВОЕ: Централизованный модуль аутентификации
- **✅ Создан модуль `lib/auth.ts`** - все auth операции в одном месте
- **✅ Полная поддержка PKCE flow** - правильная реализация сброса пароля
- **✅ Автоматическое управление `code_verifier`** - генерация, сохранение, очистка
- **✅ Прямые вызовы Supabase** - убраны промежуточные API endpoints
- **✅ Типобезопасность** - полная поддержка TypeScript
- **✅ Debug страница** - `/debug-password-reset` для отладки

### 🆕 НОВОЕ: Исправления сброса пароля (v1.2.33)
- **✅ Исправлена функциональность сброса пароля** - убрана проблемная проверка через admin API
- **✅ Улучшено логирование ошибок** - добавлены подробные логи для отладки
- **✅ Добавлена обработка rate limiting** от Supabase
- **✅ Исправлено определение URL для продакшена** - теперь правильно работает на hvostikalert.ru
- **✅ Добавлены bat файлы для автоматизации деплоя** - упрощен процесс развертывания
- **✅ Обновлены модули аутентификации** - улучшена обработка ошибок

### 🆕 НОВОЕ: Полноценная система управления чатами (v1.2.1)
- **✅ Админ-панель для чатов** - просмотр всех чатов в системе
- **✅ Управление чатами** - архивирование, восстановление, удаление
- **✅ Фильтры и поиск** - по питомцам, пользователям, статусу
- **✅ Система уведомлений** - всплывающие уведомления о новых сообщениях
- **✅ Ограничения чатов** - максимум 10 чатов на пользователя
- **✅ Автоматическое архивирование** - неактивные чаты через 30 дней

### ⚠️ ВАЖНО: Полная миграция на Supabase (v1.1.2)
- **❌ Firebase полностью удален** - больше не используется
- **✅ Supabase Authentication** - новая система аутентификации
- **✅ Улучшенная админ панель** - показывает реальных пользователей
- **✅ Исправлена система восстановления пароля**
- **✅ Обработка rate limit ошибок** во всех формах

> 📋 **Подробная документация:** [MIGRATION_TO_SUPABASE_v1.1.2.md](./MIGRATION_TO_SUPABASE_v1.1.2.md)

## 🛠️ Технологии

- **Frontend:** Next.js 15.2.4, React 18, TypeScript
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **UI:** Tailwind CSS, shadcn/ui компоненты
- **Аутентификация:** Supabase Auth (полная замена Firebase)
- **База данных:** PostgreSQL через Supabase
- **Файлы:** Supabase Storage
- **Чат:** Real-time через Supabase
- **Карты:** Интерактивные карты для местоположений

## ✨ Основные функции

### 🔐 Аутентификация (v1.2.74)
- ✅ Регистрация и вход через Supabase
- ✅ **НОВОЕ:** PKCE flow для сброса пароля
- ✅ **НОВОЕ:** Централизованный модуль аутентификации
- ✅ **НОВОЕ:** Автоматическое управление code_verifier
- ✅ Email верификация
- ✅ Защита от rate limit атак
- ✅ Админ панель с управлением пользователями
- ✅ **НОВОЕ:** Debug страница для отладки auth

### 📢 Система объявлений
- ✅ Создание объявлений о потерянных/найденных питомцах
- ✅ Загрузка фотографий с Drag & Drop
- ✅ Редактирование и архивирование объявлений
- ✅ Поиск и фильтрация

### 🗺️ Интерактивная карта
- ✅ Отображение местоположений на карте
- ✅ Детальная информация о каждом объявлении
- ✅ Геолокация и маркеры

### 💬 Система чатов (v1.2.1)
- ✅ Real-time общение между пользователями
- ✅ Всплывающие уведомления о новых сообщениях
- ✅ История переписки с полным сохранением
- ✅ Ограничение чатов (максимум 10 на пользователя)
- ✅ Система архивирования неактивных чатов
- ✅ Автоматическое архивирование через 30 дней
- ✅ Восстановление архивированных чатов

### 👨‍💼 Админ панель (v1.2.1)
- ✅ Управление пользователями
- ✅ Статистика системы в реальном времени
- ✅ Модерация контента
- ✅ **НОВОЕ:** Управление всеми чатами в системе
- ✅ **НОВОЕ:** Просмотр, архивирование, удаление чатов
- ✅ **НОВОЕ:** Фильтры и поиск по чатам
- ✅ **НОВОЕ:** Информация о пользователях и питомцах

## 🚀 Быстрый старт

### Требования
- Node.js 18+
- npm или yarn
- Аккаунт Supabase

### Установка
```bash
# Клонирование репозитория
git clone https://github.com/agentgl007/hvastik-alert.git
cd hvastik-alert

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env.local
# Заполните переменные Supabase в .env.local

# Запуск в режиме разработки
npm run dev
```

### Настройка Supabase
1. Создайте проект в [Supabase Dashboard](https://supabase.com)
2. Получите URL и ключи API
3. Настройте SMTP для email уведомлений
4. Увеличьте rate limits для email
5. Добавьте redirect URLs

> 📖 **Подробная инструкция:** [SUPABASE_EMAIL_SETUP_CHECK.md](./SUPABASE_EMAIL_SETUP_CHECK.md)

## 📚 Документация

### 🆕 Последние обновления
- [CHANGELOG_v1.2.74.md](./CHANGELOG_v1.2.74.md) - **Полная реализация PKCE flow для сброса пароля**
- [AUTH_MODULE_DOCUMENTATION_v1.2.74.md](./AUTH_MODULE_DOCUMENTATION_v1.2.74.md) - **Документация модуля аутентификации**
- [API_DOCUMENTATION_v1.2.74.md](./API_DOCUMENTATION_v1.2.74.md) - **Обновленная API документация**
- [PASSWORD_RESET_DEBUG_GUIDE_v1.2.74.md](./PASSWORD_RESET_DEBUG_GUIDE_v1.2.74.md) - **Руководство по отладке сброса пароля**
- [CHANGELOG_v1.2.21.md](./CHANGELOG_v1.2.21.md) - Критические исправления API endpoints
- [PRODUCTION_FIX_INSTRUCTIONS.md](./PRODUCTION_FIX_INSTRUCTIONS.md) - Инструкции по исправлению продакшена

### Основная документация
- [MIGRATION_TO_SUPABASE_v1.1.2.md](./MIGRATION_TO_SUPABASE_v1.1.2.md) - Детальная документация миграции
- [DEPLOYMENT_GUIDE_v1.1.2.md](./DEPLOYMENT_GUIDE_v1.1.2.md) - Руководство по развертыванию
- [VERSION_INFO_v1.1.2.md](./VERSION_INFO_v1.1.2.md) - Информация о версии
- [CHANGELOG_v1.1.2.md](./CHANGELOG_v1.1.2.md) - История изменений
- [SUPABASE_EMAIL_SETUP_CHECK.md](./SUPABASE_EMAIL_SETUP_CHECK.md) - Настройка Supabase
- [RATE_LIMIT_FIX_SUMMARY.md](./RATE_LIMIT_FIX_SUMMARY.md) - Исправления rate limit
- [GITHUB_COMMIT_INSTRUCTIONS.md](./GITHUB_COMMIT_INSTRUCTIONS.md) - Инструкции по коммиту

## 🎯 Deployment

Your project is live at:

**[https://vercel.com/agentgl007-7440s-projects/v0-hvastik-alert-project](https://vercel.com/agentgl007-7440s-projects/v0-hvastik-alert-project)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/VcPDUgLFpXa](https://v0.dev/chat/projects/VcPDUgLFpXa)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## 🆕 Recent Updates (v1.2.74 - 28 января 2025)

### 🚨 Критические исправления
- ✅ **Полная реализация PKCE flow** - исправлен сброс пароля с правильной обработкой токенов
- ✅ **Централизованный модуль аутентификации** - все auth операции в `lib/auth.ts`
- ✅ **Удален проблемный API endpoint** - `/api/auth/forgot-password` заменен на прямые вызовы
- ✅ **Автоматическое управление code_verifier** - генерация, сохранение, очистка
- ✅ **Debug страница** - `/debug-password-reset` для отладки auth проблем

### 🆕 Новые функции
- 🔧 **`lib/auth.ts`** - централизованный модуль аутентификации
- 🐛 **`/debug-password-reset`** - debug страница для отладки
- 🔄 **PKCE flow** - правильная реализация сброса пароля
- 🧹 **Автоматическая очистка** - code_verifier удаляется после использования

### 🎯 Улучшения UX
- 🔑 **Сброс пароля** - работает корректно с PKCE flow
- 📧 **Email уведомления** - правильные ссылки для сброса пароля
- 🐛 **Отладка** - подробные логи и debug страница
- ⚡ **Производительность** - прямые вызовы Supabase без промежуточных API

### 🔧 Технические улучшения
- 🏗️ **Архитектура** - централизованная логика аутентификации
- 🔒 **Безопасность** - правильная реализация PKCE flow
- 📊 **Логирование** - подробные логи для отладки
- 🛡️ **Типобезопасность** - полная поддержка TypeScript

## Supabase Keep-Alive System

The application includes an automatic Supabase keep-alive system to prevent the database from going into sleep mode.

### Features
- **Automatic pinging** of Supabase database
- **Configurable intervals** (5 minutes in development, 24 hours in production)
- **Error handling** with retry mechanism
- **Detailed logging** for monitoring
- **Development status widget** for real-time monitoring

### Configuration
- **Development:** Pings every 5 minutes with visual status indicator
- **Production:** Pings every 24 hours (invisible to users)
- **First ping:** 5 seconds after page load
- **Retry attempts:** Up to 3 attempts with 10-second delays

### Monitoring
- Check browser console for `[Keep-Alive]` messages
- Development mode shows status widget in bottom-right corner
- All operations are logged with timestamps

For detailed documentation, see [docs/SUPABASE_KEEP_ALIVE.md](docs/SUPABASE_KEEP_ALIVE.md)

## 🚀 Деплой на продакшен

### Автоматический деплой (Windows)
1. **Подключение к серверу**: Запустите `public/Conect_to_server —VDS.bat`
2. **Запуск деплоя**: Запустите `public/Запуск деплоя на сервере HVOSTIVALERT.bat`

### Ручной деплой
```bash
# Подключение к серверу
ssh -i ~/.ssh/id_rsa root@212.34.138.16

# Переход в директорию проекта
cd /var/www/hvostikalert_usr/

# Обновление кода
git pull origin main
npm install
npm run build
pm2 restart hvostik-alert
```

### Информация о сервере
- **Домен**: https://hvostikalert.ru
- **IP**: 212.34.138.16
- **Пользователь**: root
- **Путь к проекту**: /var/www/hvostikalert_usr/

### FastPanel (Панель управления)
- **URL**: https://212.34.138.16:8888/authentication
- **Логин**: fastuser
- **Пароль**: Gol1234567

**Подробная документация**: [DEPLOYMENT_GUIDE_COMPLETE.md](./DEPLOYMENT_GUIDE_COMPLETE.md)#   F o r c e   V e r c e l   r e d e p l o y 
 
 