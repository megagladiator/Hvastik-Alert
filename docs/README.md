# Hvastik-Alert - Документация проекта

## 📋 Содержание

1. [Обзор проекта](#обзор-проекта)
2. [Техническая архитектура](#техническая-архитектура)
3. [Установка и настройка](#установка-и-настройка)
4. [Структура проекта](#структура-проекта)
5. [API и база данных](#api-и-база-данных)
6. [Компоненты и функции](#компоненты-и-функции)
7. [Развертывание](#развертывание)
8. [Безопасность](#безопасность)
9. [Тестирование](#тестирование)
10. [Поддержка](#поддержка)

## 🎯 Обзор проекта

**Hvastik-Alert** - это веб-платформа для поиска потерянных и найденных домашних животных в городе Анапа. Приложение позволяет пользователям размещать объявления о потерянных питомцах, искать найденных животных и общаться через встроенную систему чатов.

### Основные возможности:
- 🐕 Размещение объявлений о потерянных/найденных питомцах
- 🗺️ Интерактивная карта с геолокацией
- 💬 Встроенная система чатов
- 🔐 Безопасная аутентификация
- 📱 Адаптивный дизайн
- 🔔 Уведомления в реальном времени

### Целевая аудитория:
- Владельцы потерянных домашних животных
- Люди, нашедшие бездомных животных
- Волонтеры и приюты для животных
- Жители и гости города Анапа

## 🏗️ Техническая архитектура

### Frontend
- **Next.js 15** - React фреймворк с App Router
- **React 19** - Библиотека для создания пользовательских интерфейсов
- **TypeScript** - Типизированный JavaScript
- **Tailwind CSS** - Utility-first CSS фреймворк
- **Radix UI** - Компоненты пользовательского интерфейса

### Backend & Database
- **Supabase** - Backend-as-a-Service платформа
- **PostgreSQL** - Реляционная база данных
- **Supabase Auth** - Система аутентификации
- **Supabase Realtime** - WebSocket соединения для чатов

### Дополнительные технологии
- **Leaflet** - Интерактивные карты
- **Prisma** - ORM для работы с базой данных
- **Vercel** - Платформа для развертывания

## 🚀 Установка и настройка

### Предварительные требования
- Node.js 18+ 
- npm или yarn
- Аккаунт Supabase
- Git

### Шаги установки

1. **Клонирование репозитория**
```bash
git clone https://github.com/megagladiator/Hvastik-Alert.git
cd Hvastik-Alert
```

2. **Установка зависимостей**
```bash
npm install
```

3. **Настройка переменных окружения**
Создайте файл `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

4. **Настройка базы данных**
Выполните SQL скрипты из папки `scripts/` в Supabase Dashboard:
- `create-pets-table.sql`
- `create-messages-table.sql`
- `create-app-settings-table.sql`

5. **Запуск приложения**
```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

## 📁 Структура проекта

```
Hvastik-Alert/
├── app/                          # Next.js App Router
│   ├── auth/                     # Страницы аутентификации
│   │   ├── page.tsx             # Главная страница входа/регистрации
│   │   ├── demo-reset/          # Демо сброса пароля
│   │   ├── reset-password/      # Реальный сброс пароля
│   │   └── check-status/        # Проверка статуса
│   ├── add/                     # Добавление объявлений
│   │   └── page.tsx
│   ├── admin/                   # Админ панель
│   │   └── page.tsx
│   ├── cabinet/                 # Личный кабинет
│   │   └── page.tsx
│   ├── chat/                    # Чат с владельцами
│   │   └── [id]/page.tsx
│   ├── chats/                   # Список чатов
│   │   └── page.tsx
│   ├── pet/                     # Страница питомца
│   │   └── [id]/page.tsx
│   ├── search/                  # Поиск питомцев
│   │   └── page.tsx
│   ├── globals.css              # Глобальные стили
│   ├── layout.tsx               # Корневой layout
│   ├── loading.tsx              # Компонент загрузки
│   └── page.tsx                 # Главная страница
├── components/                   # React компоненты
│   ├── ui/                      # Базовые UI компоненты
│   ├── admin/                   # Админ компоненты
│   ├── background-image-uploader.tsx
│   ├── chat-notification.tsx
│   ├── contact-info.tsx
│   ├── pet-map.tsx
│   ├── theme-provider.tsx
│   └── user-email-indicator.tsx
├── hooks/                        # Кастомные React хуки
│   ├── use-chat.ts              # Хук для работы с чатами
│   ├── use-chat-simple.ts       # Упрощенный хук чата
│   ├── use-debounce.tsx         # Хук для debounce
│   ├── use-mobile.tsx           # Хук для определения мобильного устройства
│   └── use-toast.ts             # Хук для уведомлений
├── lib/                          # Утилиты и конфигурация
│   ├── supabase.ts              # Конфигурация Supabase
│   └── utils.ts                 # Общие утилиты
├── prisma/                       # Схема базы данных
│   └── schema.prisma
├── public/                       # Статические файлы
│   ├── placeholder-logo.png
│   ├── placeholder-logo.svg
│   ├── placeholder-user.jpg
│   ├── placeholder.jpg
│   └── placeholder.svg
├── scripts/                      # SQL скрипты
│   ├── add-read-status.sql
│   ├── create-app-settings-table.sql
│   ├── create-messages-table.sql
│   ├── create-pets-table.sql
│   ├── seed-demo-data.sql
│   └── setup-supabase.js
├── styles/                       # Дополнительные стили
│   └── globals.css
├── docs/                         # Документация проекта
├── .gitignore
├── components.json               # Конфигурация UI компонентов
├── next.config.mjs              # Конфигурация Next.js
├── package.json                 # Зависимости проекта
├── postcss.config.mjs           # Конфигурация PostCSS
├── tailwind.config.ts           # Конфигурация Tailwind
├── tsconfig.json                # Конфигурация TypeScript
└── vercel.json                  # Конфигурация Vercel
```

## 🗄️ API и база данных

### Схема базы данных

#### Таблица `pets`
```sql
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(10) NOT NULL CHECK (type IN ('lost', 'found')),
  animal_type VARCHAR(50) NOT NULL,
  breed VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  color VARCHAR(100) NOT NULL,
  location VARCHAR(200) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  contact_name VARCHAR(100) NOT NULL,
  reward INTEGER,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'found', 'archived'))
);
```

#### Таблица `chats`
```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pet_id, user_id)
);
```

#### Таблица `messages`
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'owner')),
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Таблица `app_settings`
```sql
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  background_image_url TEXT,
  background_darkening_percentage INTEGER DEFAULT 50,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Supabase API

Приложение использует Supabase для:
- **Аутентификации**: Регистрация, вход, сброс пароля
- **База данных**: CRUD операции с питомцами, чатами, сообщениями
- **Realtime**: WebSocket соединения для чатов
- **Storage**: Загрузка изображений питомцев

## 🧩 Компоненты и функции

### Основные страницы

#### Главная страница (`app/page.tsx`)
- Лендинг с призывом к действию
- Интерактивная карта с метками питомцев
- Отзывы пользователей
- Статистика успешных поисков
- Фильтры по типу и виду животных

#### Страница поиска (`app/search/page.tsx`)
- Расширенный поиск с фильтрами
- Список объявлений
- Интерактивная карта
- Сортировка результатов

#### Страница добавления (`app/add/page.tsx`)
- Форма для размещения объявления
- Загрузка фотографий
- Выбор геолокации на карте
- Валидация данных

#### Чат (`app/chat/[id]/page.tsx`)
- Встроенный чат между пользователями
- Realtime сообщения
- Безопасность и модерация
- Уведомления о новых сообщениях

### Ключевые компоненты

#### `PetMap` (`components/pet-map.tsx`)
- Интерактивная карта на Leaflet
- Отображение меток питомцев
- Попапы с информацией
- Фильтрация по типу

#### `useChat` (`hooks/use-chat.ts`)
- Хук для работы с чатами
- Realtime подписки
- Отправка сообщений
- Обработка ошибок

#### `UserEmailIndicator` (`components/user-email-indicator.tsx`)
- Индикатор статуса пользователя
- Кнопки входа/выхода
- Отображение email

## 🚀 Развертывание

### Vercel (рекомендуется)

1. **Подключение к Vercel**
```bash
npm install -g vercel
vercel login
vercel
```

2. **Настройка переменных окружения в Vercel**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`

3. **Автоматическое развертывание**
При каждом push в main ветку происходит автоматическое развертывание.

### Другие платформы

Приложение также можно развернуть на:
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**
- **AWS Amplify**

## 🔒 Безопасность

### Row Level Security (RLS)
Все таблицы защищены RLS политиками:
- Пользователи могут видеть только свои чаты
- Сообщения доступны только участникам чата
- Объявления питомцев видны всем, но редактировать может только владелец

### Аутентификация
- JWT токены через Supabase Auth
- Защищенные маршруты
- Валидация на клиенте и сервере

### Валидация данных
- TypeScript типизация
- Валидация форм
- Санитизация пользовательского ввода

## 🧪 Тестирование

### Запуск тестов
```bash
npm run test
```

### Тестирование вручную
1. **Демо-режим**: `/auth/demo-reset`
2. **Тест чата**: Создайте объявление и протестируйте чат
3. **Тест карты**: Проверьте отображение меток
4. **Тест поиска**: Используйте различные фильтры

## 📞 Поддержка

### Документация
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Контакты
- **Email**: info@hvostik-alert.ru
- **GitHub**: [megagladiator/Hvastik-Alert](https://github.com/megagladiator/Hvastik-Alert)
- **Деплой**: [v0-hvastik-alert-project.vercel.app](https://v0-hvastik-alert-project.vercel.app)

### Известные проблемы
- Требуется настройка SMTP для email уведомлений
- Некоторые функции работают только в демо-режиме без настройки Supabase

---

*Документация обновлена: 7 сентября 2025*
