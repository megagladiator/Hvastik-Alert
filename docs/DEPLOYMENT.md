# Руководство по развертыванию - Hvastik-Alert

## 📋 Содержание

1. [Предварительные требования](#предварительные-требования)
2. [Настройка Supabase](#настройка-supabase)
3. [Настройка переменных окружения](#настройка-переменных-окружения)
4. [Развертывание на Vercel](#развертывание-на-vercel)
5. [Развертывание на других платформах](#развертывание-на-других-платформах)
6. [Настройка домена](#настройка-домена)
7. [Мониторинг и логи](#мониторинг-и-логи)
8. [Обновление приложения](#обновление-приложения)

## 🔧 Предварительные требования

### Необходимые аккаунты
- [Supabase](https://supabase.com) - Backend и база данных
- [Vercel](https://vercel.com) - Хостинг (рекомендуется)
- [GitHub](https://github.com) - Репозиторий кода
- [Gmail](https://gmail.com) - Для SMTP (опционально)

### Локальные инструменты
- Node.js 18+ 
- npm или yarn
- Git
- Текстовый редактор (VS Code рекомендуется)

## 🗄️ Настройка Supabase

### 1. Создание проекта

1. Перейдите на [supabase.com](https://supabase.com)
2. Нажмите "Start your project"
3. Войдите через GitHub
4. Создайте новый проект:
   - **Name**: `hvastik-alert`
   - **Database Password**: Сгенерируйте надежный пароль
   - **Region**: Выберите ближайший регион
   - **Pricing Plan**: Free tier для начала

### 2. Настройка базы данных

Выполните SQL скрипты в Supabase Dashboard → SQL Editor:

#### Создание таблицы питомцев
```sql
-- Выполните содержимое файла scripts/create-pets-table.sql
CREATE TABLE IF NOT EXISTS pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_pets_type ON pets(type);
CREATE INDEX IF NOT EXISTS idx_pets_animal_type ON pets(animal_type);
CREATE INDEX IF NOT EXISTS idx_pets_status ON pets(status);
CREATE INDEX IF NOT EXISTS idx_pets_created_at ON pets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pets_location ON pets(latitude, longitude);

-- Включение RLS
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Политики безопасности
CREATE POLICY "Allow all operations on pets" ON pets
  FOR ALL USING (true);
```

#### Создание таблиц чатов и сообщений
```sql
-- Выполните содержимое файла scripts/create-messages-table.sql
-- (Весь SQL код из файла)
```

#### Создание таблицы настроек
```sql
-- Выполните содержимое файла scripts/create-app-settings-table.sql
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  background_image_url TEXT,
  background_darkening_percentage INTEGER DEFAULT 50,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Вставка начальных настроек
INSERT INTO app_settings (id, background_image_url, background_darkening_percentage)
VALUES ('00000000-0000-0000-0000-000000000001', '/placeholder.svg?height=1080&width=1920', 50)
ON CONFLICT (id) DO NOTHING;
```

### 3. Настройка аутентификации

1. Перейдите в **Authentication** → **Settings**
2. Настройте **Site URL**: `http://localhost:3000` (для разработки)
3. Добавьте **Redirect URLs**:
   ```
   http://localhost:3000/auth/reset-password
   https://your-domain.com/auth/reset-password
   ```

### 4. Настройка SMTP (опционально)

#### Настройка Gmail SMTP
1. Включите двухфакторную аутентификацию в Google
2. Создайте пароль приложения:
   - Перейдите в [myaccount.google.com](https://myaccount.google.com)
   - Безопасность → Пароли приложений
   - Создайте пароль для "Mail"
3. В Supabase Dashboard → **Authentication** → **Settings** → **SMTP Settings**:
   ```
   Host: smtp.gmail.com
   Port: 587
   User: your-email@gmail.com
   Pass: your-app-password
   ```

### 5. Настройка Storage

1. Перейдите в **Storage**
2. Создайте bucket `pet-photos`:
   - **Name**: `pet-photos`
   - **Public**: ✅ (для публичного доступа к изображениям)
3. Настройте политики:
```sql
-- Политика для загрузки изображений
CREATE POLICY "Users can upload pet photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pet-photos' AND
    auth.role() = 'authenticated'
  );

-- Политика для просмотра изображений
CREATE POLICY "Anyone can view pet photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'pet-photos');
```

## 🔑 Настройка переменных окружения

### 1. Получение ключей Supabase

1. Перейдите в **Settings** → **API**
2. Скопируйте:
   - **Project URL**
   - **anon public** ключ
   - **service_role** ключ (секретный!)

### 2. Создание .env.local

Создайте файл `.env.local` в корне проекта:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Email Configuration (опционально)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Добавление в .gitignore

Убедитесь, что `.env.local` добавлен в `.gitignore`:
```gitignore
# Environment variables
.env.local
.env
.env.production
```

## 🚀 Развертывание на Vercel

### 1. Подготовка репозитория

```bash
# Инициализация Git (если еще не сделано)
git init
git add .
git commit -m "Initial commit"

# Создание репозитория на GitHub
# Затем подключение к удаленному репозиторию
git remote add origin https://github.com/your-username/hvastik-alert.git
git push -u origin main
```

### 2. Подключение к Vercel

1. Перейдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите "New Project"
4. Импортируйте ваш репозиторий
5. Настройте проект:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. Настройка переменных окружения в Vercel

1. В настройках проекта → **Environment Variables**
2. Добавьте переменные:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
   SUPABASE_SERVICE_KEY = your-service-role-key
   NEXT_PUBLIC_APP_URL = https://your-domain.vercel.app
   ```

### 4. Развертывание

1. Нажмите "Deploy"
2. Дождитесь завершения сборки
3. Получите URL вашего приложения

### 5. Обновление настроек Supabase

После развертывания обновите настройки в Supabase:
1. **Authentication** → **Settings** → **Site URL**: `https://your-domain.vercel.app`
2. **Redirect URLs**: добавьте `https://your-domain.vercel.app/auth/reset-password`

## 🌐 Развертывание на других платформах

### Netlify

1. Подключите GitHub репозиторий
2. Настройте сборку:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
3. Добавьте переменные окружения в настройках

### Railway

1. Создайте новый проект
2. Подключите GitHub репозиторий
3. Настройте переменные окружения
4. Railway автоматически определит Next.js

### DigitalOcean App Platform

1. Создайте новое приложение
2. Подключите GitHub репозиторий
3. Настройте:
   - **Source Type**: GitHub
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`
4. Добавьте переменные окружения

## 🔗 Настройка домена

### 1. Покупка домена

Рекомендуемые регистраторы:
- [Namecheap](https://namecheap.com)
- [GoDaddy](https://godaddy.com)
- [Cloudflare](https://cloudflare.com)

### 2. Настройка DNS

#### Для Vercel:
1. В настройках проекта → **Domains**
2. Добавьте ваш домен
3. Настройте DNS записи:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.19.61
   ```

#### Для других платформ:
Следуйте инструкциям конкретной платформы для настройки DNS.

### 3. SSL сертификат

Большинство платформ автоматически предоставляют SSL сертификаты:
- Vercel: автоматически
- Netlify: автоматически
- Railway: автоматически

## 📊 Мониторинг и логи

### 1. Vercel Analytics

1. В настройках проекта включите **Analytics**
2. Получайте метрики:
   - Page views
   - Core Web Vitals
   - User behavior

### 2. Supabase Monitoring

1. **Dashboard** → **Logs** - логи базы данных
2. **API** → **Usage** - статистика использования
3. **Database** → **Logs** - логи запросов

### 3. Error Tracking

Добавьте в проект:
```bash
npm install @sentry/nextjs
```

Настройка в `sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  tracesSampleRate: 1.0,
});
```

## 🔄 Обновление приложения

### 1. Локальная разработка

```bash
# Получение последних изменений
git pull origin main

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev
```

### 2. Развертывание обновлений

#### Автоматическое развертывание (Vercel):
```bash
# Внесение изменений
git add .
git commit -m "Update feature"
git push origin main

# Vercel автоматически развернет изменения
```

#### Ручное развертывание:
```bash
# Сборка для продакшена
npm run build

# Развертывание (зависит от платформы)
vercel --prod
```

### 3. Откат изменений

#### Vercel:
1. Перейдите в **Deployments**
2. Выберите предыдущую версию
3. Нажмите "Promote to Production"

#### Другие платформы:
Следуйте инструкциям конкретной платформы для отката.

## 🛠️ Troubleshooting

### Частые проблемы

#### 1. Ошибка "Supabase not configured"
**Решение**: Проверьте переменные окружения в `.env.local`

#### 2. Ошибка аутентификации
**Решение**: 
- Проверьте настройки в Supabase Dashboard
- Убедитесь, что Site URL и Redirect URLs настроены правильно

#### 3. Ошибка загрузки изображений
**Решение**:
- Проверьте настройки Storage в Supabase
- Убедитесь, что bucket `pet-photos` создан и настроен

#### 4. Ошибка RLS (Row Level Security)
**Решение**:
- Проверьте политики безопасности в Supabase
- Убедитесь, что пользователь авторизован

### Логи и отладка

#### Локальная отладка:
```bash
# Запуск с подробными логами
DEBUG=* npm run dev

# Проверка переменных окружения
node -e "console.log(process.env)"
```

#### Продакшен логи:
- Vercel: **Functions** → **Logs**
- Supabase: **Logs** → **API** или **Database**

## 📋 Чек-лист развертывания

### Перед развертыванием:
- [ ] Создан проект в Supabase
- [ ] Выполнены SQL скрипты
- [ ] Настроена аутентификация
- [ ] Настроен Storage
- [ ] Создан .env.local с правильными ключами
- [ ] Код загружен в GitHub

### После развертывания:
- [ ] Приложение доступно по URL
- [ ] Аутентификация работает
- [ ] Можно создавать объявления
- [ ] Чат функционирует
- [ ] Карта отображается
- [ ] Загрузка изображений работает
- [ ] Email уведомления работают (если настроены)

### Финальная проверка:
- [ ] Тест на мобильных устройствах
- [ ] Проверка производительности
- [ ] Тест всех основных функций
- [ ] Проверка безопасности

---

*Руководство по развертыванию обновлено: 7 сентября 2025*
