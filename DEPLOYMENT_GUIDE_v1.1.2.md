# Руководство по развертыванию v1.1.2

## 🚀 Развертывание Hvastik Alert

### Предварительные требования

1. **Node.js 18+** установлен
2. **Git** для клонирования репозитория
3. **Аккаунт Supabase** создан
4. **Vercel аккаунт** (для деплоя)

## 📋 Пошаговая инструкция

### 1. Клонирование и установка

```bash
# Клонирование репозитория
git clone https://github.com/agentgl007/hvastik-alert.git
cd hvastik-alert

# Установка зависимостей
npm install
```

### 2. Настройка Supabase

#### 2.1 Создание проекта
1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Дождитесь завершения инициализации

#### 2.2 Получение ключей
1. В Dashboard → Settings → API
2. Скопируйте:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

#### 2.3 Настройка аутентификации
1. **Authentication** → **Settings**
2. **Site URL:** `http://localhost:3000` (для разработки)
3. **Redirect URLs:** добавьте:
   ```
   http://localhost:3000/auth/verify-email
   http://localhost:3000/auth/reset-password
   http://localhost:3000/auth/callback
   ```

#### 2.4 Настройка SMTP
1. **Authentication** → **Settings** → **SMTP Settings**
2. Настройте ваш email провайдер:
   - **Host:** smtp.gmail.com
   - **Port:** 587
   - **Username:** ваш email
   - **Password:** App Password (для Gmail)

#### 2.5 Настройка Rate Limits
1. **Authentication** → **Settings** → **Rate Limits**
2. Увеличьте лимиты:
   - **Email sends per hour:** 100+
   - **Email sends per day:** 1000+

### 3. Настройка переменных окружения

Создайте файл `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# NextAuth Configuration (legacy - not used in v1.1.2+)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Development
NODE_ENV=development
```

### 4. Запуск в режиме разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

### 5. Развертывание на Vercel

#### 5.1 Подготовка
```bash
# Сборка проекта
npm run build

# Проверка сборки
npm start
```

#### 5.2 Деплой на Vercel
1. Установите Vercel CLI: `npm i -g vercel`
2. Войдите в аккаунт: `vercel login`
3. Деплой: `vercel`

#### 5.3 Настройка переменных в Vercel
1. В Vercel Dashboard → Settings → Environment Variables
2. Добавьте все переменные из `.env.local`
3. Обновите **Site URL** в Supabase на ваш Vercel URL

### 6. Настройка базы данных

#### 6.1 Создание таблиц
Выполните SQL скрипты из папки `scripts/`:

```sql
-- Создание таблицы пользователей (если нужно)
-- Создание таблицы объявлений
-- Создание таблицы сообщений
```

#### 6.2 Настройка RLS (Row Level Security)
```sql
-- Включить RLS для всех таблиц
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Создать политики доступа
-- (примеры в документации Supabase)
```

### 7. Тестирование

#### 7.1 Функции аутентификации
- [ ] Регистрация нового пользователя
- [ ] Вход в систему
- [ ] Восстановление пароля
- [ ] Email верификация
- [ ] Выход из системы

#### 7.2 Админ панель
- [ ] Доступ к админ панели
- [ ] Просмотр списка пользователей
- [ ] Статистика системы
- [ ] Управление пользователями

#### 7.3 Основные функции
- [ ] Создание объявлений
- [ ] Загрузка изображений
- [ ] Поиск и фильтрация
- [ ] Система чатов

## 🔧 Устранение неполадок

### Проблема: Rate limit exceeded
**Решение:** Увеличьте лимиты в Supabase Dashboard

### Проблема: Email не отправляются
**Решение:** Проверьте настройки SMTP в Supabase

### Проблема: Админ панель не показывает пользователей
**Решение:** Проверьте `SUPABASE_SERVICE_ROLE_KEY`

### Проблема: Ошибки аутентификации
**Решение:** Проверьте redirect URLs в Supabase

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в консоли браузера
2. Проверьте логи в терминале сервера
3. Обратитесь к документации Supabase
4. Создайте issue в GitHub репозитории

## 🎯 Готово!

После выполнения всех шагов ваше приложение должно работать корректно с полной функциональностью Supabase аутентификации.

---

**Версия:** 1.1.2  
**Дата:** 14 января 2025  
**Статус:** ✅ Готово к развертыванию
