# Архитектура проекта Hvastik-Alert

## 🏗️ Общая архитектура

Hvastik-Alert построен на современном стеке технологий с использованием Next.js 15 и Supabase в качестве backend-as-a-service платформы.

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                       │
├─────────────────────────────────────────────────────────────┤
│  Next.js 15 (App Router) + React 19 + TypeScript          │
│  ├── Pages & Components                                    │
│  ├── Hooks & State Management                              │
│  ├── UI Components (Radix UI + Tailwind)                  │
│  └── Client-side Logic                                     │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Supabase (Backend-as-a-Service)                           │
│  ├── Authentication (Supabase Auth)                        │
│  ├── Database (PostgreSQL)                                 │
│  ├── Realtime (WebSockets)                                 │
│  ├── Storage (File Uploads)                                │
│  └── Edge Functions (Serverless)                           │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
├─────────────────────────────────────────────────────────────┤
│  ├── Vercel (Hosting & CDN)                                │
│  ├── Leaflet (Maps)                                        │
│  ├── Email Services (SMTP)                                 │
│  └── Image Processing                                       │
└─────────────────────────────────────────────────────────────┘
```

## 📱 Frontend Architecture

### Next.js App Router Structure

```
app/
├── layout.tsx                 # Root layout with global providers
├── page.tsx                   # Homepage with landing content
├── globals.css                # Global styles and Tailwind imports
├── loading.tsx                # Global loading component
│
├── auth/                      # Authentication pages
│   ├── page.tsx              # Login/Register form
│   ├── demo-reset/           # Demo password reset
│   ├── reset-password/       # Real password reset
│   └── check-status/         # Auth status check
│
├── add/                       # Pet listing creation
│   └── page.tsx              # Add pet form with map
│
├── search/                    # Pet search functionality
│   ├── page.tsx              # Search interface
│   └── loading.tsx           # Search loading state
│
├── pet/                       # Individual pet pages
│   └── [id]/
│       └── page.tsx          # Pet details and contact
│
├── chat/                      # Chat functionality
│   └── [id]/
│       └── page.tsx          # Chat interface
│
├── chats/                     # Chat list
│   └── page.tsx              # User's chat history
│
├── cabinet/                   # User dashboard
│   └── page.tsx              # User's pets and settings
│
└── admin/                     # Admin panel
    └── page.tsx              # Admin interface
```

### Component Architecture

```
components/
├── ui/                        # Base UI components (Radix UI)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ... (40+ components)
│
├── admin/                     # Admin-specific components
│   └── background-settings.tsx
│
├── pet-map.tsx               # Interactive map component
├── chat-notification.tsx     # Chat notification system
├── contact-info.tsx          # Contact information display
├── theme-provider.tsx        # Theme management
├── background-image-uploader.tsx
└── user-email-indicator.tsx  # User status indicator
```

### State Management

Приложение использует React hooks для управления состоянием:

- **useState** - Локальное состояние компонентов
- **useEffect** - Побочные эффекты и подписки
- **useCallback** - Мемоизация функций
- **useMemo** - Мемоизация вычислений
- **Custom hooks** - Переиспользуемая логика

### Custom Hooks

```
hooks/
├── use-chat.ts               # Chat functionality with realtime
├── use-chat-simple.ts        # Simplified chat for demo
├── use-debounce.tsx          # Debounced input handling
├── use-mobile.tsx            # Mobile device detection
└── use-toast.ts              # Toast notifications
```

## 🗄️ Database Architecture

### Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      Users      │    │      Pets       │    │     Chats       │
│                 │    │                 │    │                 │
│ id (UUID)       │◄───┤ id (UUID)       │◄───┤ id (UUID)       │
│ email           │    │ user_id (UUID)  │    │ pet_id (UUID)   │
│ created_at      │    │ type            │    │ user_id (UUID)  │
│ updated_at      │    │ animal_type     │    │ owner_id (UUID) │
└─────────────────┘    │ breed           │    │ created_at      │
                       │ name            │    │ updated_at      │
                       │ description     │    └─────────────────┘
                       │ color           │             │
                       │ location        │             │
                       │ latitude        │             ▼
                       │ longitude       │    ┌─────────────────┐
                       │ contact_phone   │    │    Messages     │
                       │ contact_name    │    │                 │
                       │ reward          │    │ id (UUID)       │
                       │ photo_url       │    │ chat_id (UUID)  │
                       │ status          │    │ sender_id (UUID)│
                       │ created_at      │    │ sender_type     │
                       └─────────────────┘    │ text            │
                                              │ created_at      │
                                              │ updated_at      │
                                              └─────────────────┘
```

### Database Tables

#### 1. Users (Supabase Auth)
```sql
-- Managed by Supabase Auth
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  email_confirmed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### 2. Pets
```sql
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type VARCHAR(10) CHECK (type IN ('lost', 'found')),
  animal_type VARCHAR(50),
  breed VARCHAR(100),
  name VARCHAR(100),
  description TEXT,
  color VARCHAR(100),
  location VARCHAR(200),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  contact_phone VARCHAR(20),
  contact_name VARCHAR(100),
  reward INTEGER,
  photo_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. Chats
```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pet_id, user_id)
);
```

#### 4. Messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  sender_type VARCHAR(20) CHECK (sender_type IN ('user', 'owner')),
  text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. App Settings
```sql
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  background_image_url TEXT,
  background_darkening_percentage INTEGER DEFAULT 50,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS)

Все таблицы защищены RLS политиками:

```sql
-- Pets: Все могут читать, только владелец может изменять
CREATE POLICY "Pets are viewable by everyone" ON pets
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own pets" ON pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pets" ON pets
  FOR UPDATE USING (auth.uid() = user_id);

-- Chats: Только участники чата могут видеть
CREATE POLICY "Users can view chats they participate in" ON chats
  FOR SELECT USING (
    auth.uid() = user_id OR auth.uid() = owner_id
  );

-- Messages: Только участники чата могут видеть сообщения
CREATE POLICY "Users can view messages in their chats" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = messages.chat_id 
      AND (chats.user_id = auth.uid() OR chats.owner_id = auth.uid())
    )
  );
```

## 🔄 Data Flow

### 1. User Authentication Flow

```
User → Login Form → Supabase Auth → JWT Token → App State → Protected Routes
```

### 2. Pet Listing Flow

```
User → Add Pet Form → Validation → Supabase Storage (images) → Database → Map Update
```

### 3. Chat Flow

```
User → Chat Interface → Realtime Subscription → Message Input → Database → Realtime Update → Other User
```

### 4. Search Flow

```
User → Search Input → Debounced Query → Database Filter → Results Display → Map Update
```

## 🚀 Performance Optimizations

### 1. Next.js Optimizations
- **App Router** - Новый роутер для лучшей производительности
- **Server Components** - Рендеринг на сервере где возможно
- **Dynamic Imports** - Ленивая загрузка компонентов
- **Image Optimization** - Автоматическая оптимизация изображений

### 2. Database Optimizations
- **Indexes** - Индексы на часто используемых полях
- **Connection Pooling** - Пул соединений через Supabase
- **Query Optimization** - Оптимизированные запросы
- **Caching** - Кэширование через Supabase

### 3. Frontend Optimizations
- **Code Splitting** - Разделение кода по маршрутам
- **Lazy Loading** - Ленивая загрузка компонентов
- **Memoization** - useMemo и useCallback для оптимизации
- **Debouncing** - Дебаунсинг для поиска

## 🔒 Security Architecture

### 1. Authentication & Authorization
- **JWT Tokens** - Безопасные токены через Supabase Auth
- **Row Level Security** - Защита на уровне строк в БД
- **Protected Routes** - Защищенные маршруты
- **Session Management** - Управление сессиями

### 2. Data Protection
- **Input Validation** - Валидация на клиенте и сервере
- **SQL Injection Prevention** - Защита через Supabase
- **XSS Protection** - Защита от XSS атак
- **CSRF Protection** - Защита от CSRF атак

### 3. Privacy
- **Data Minimization** - Минимальный сбор данных
- **User Consent** - Согласие пользователей
- **Data Retention** - Политики хранения данных
- **GDPR Compliance** - Соответствие GDPR

## 📊 Monitoring & Analytics

### 1. Error Tracking
- **Console Logging** - Логирование ошибок
- **Error Boundaries** - Обработка ошибок React
- **Supabase Logs** - Логи базы данных

### 2. Performance Monitoring
- **Vercel Analytics** - Аналитика производительности
- **Core Web Vitals** - Метрики производительности
- **Database Performance** - Мониторинг БД

### 3. User Analytics
- **Page Views** - Просмотры страниц
- **User Actions** - Действия пользователей
- **Conversion Tracking** - Отслеживание конверсий

## 🔧 Development Workflow

### 1. Local Development
```bash
npm run dev          # Запуск dev сервера
npm run build        # Сборка для продакшена
npm run start        # Запуск продакшен сервера
npm run lint         # Линтинг кода
```

### 2. Database Migrations
```bash
# Выполнение SQL скриптов в Supabase Dashboard
scripts/create-pets-table.sql
scripts/create-messages-table.sql
scripts/create-app-settings-table.sql
```

### 3. Deployment
```bash
# Автоматическое развертывание через Vercel
git push origin main  # Триггерит деплой
```

## 🎯 Scalability Considerations

### 1. Horizontal Scaling
- **Stateless Architecture** - Без состояния на сервере
- **CDN Distribution** - Распределение через CDN
- **Database Sharding** - Шардирование БД при необходимости

### 2. Performance Scaling
- **Caching Strategy** - Стратегия кэширования
- **Database Optimization** - Оптимизация БД
- **Image Optimization** - Оптимизация изображений

### 3. Feature Scaling
- **Microservices** - Переход на микросервисы при необходимости
- **API Versioning** - Версионирование API
- **Feature Flags** - Флаги функций

---

*Архитектурная документация обновлена: 7 сентября 2025*
