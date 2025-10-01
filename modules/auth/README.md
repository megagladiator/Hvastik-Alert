# Модуль аутентификации и управления пользователями

Автономный модуль для работы с аутентификацией пользователей через Supabase, включающий регистрацию, вход, управление пользователями и личный кабинет.

## 🚀 Возможности

- **Аутентификация**: Вход, регистрация, выход
- **Управление паролями**: Сброс и изменение паролей
- **Верификация email**: Подтверждение email адресов
- **Управление пользователями**: CRUD операции, роли, статусы
- **Личный кабинет**: Профиль пользователя
- **Админ панель**: Управление всеми пользователями

## 📦 Установка

```bash
# Скопируйте папку modules/auth в ваш проект
cp -r modules/auth /path/to/your/project/src/
```

## ⚙️ Настройка

### 1. Переменные окружения

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Создание таблицы users в Supabase

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
  profile JSONB DEFAULT '{}',
  email_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS политики
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Пользователи могут видеть только свой профиль
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Пользователи могут обновлять только свой профиль
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Админы могут видеть всех пользователей
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## 🎯 Использование

### Базовое использование

```tsx
import { useAuth, LoginForm, RegisterForm } from './modules/auth'

function App() {
  const { user, isAuthenticated, login, logout } = useAuth()

  if (isAuthenticated) {
    return (
      <div>
        <h1>Добро пожаловать, {user?.email}!</h1>
        <button onClick={logout}>Выйти</button>
      </div>
    )
  }

  return <LoginForm onSuccess={() => console.log('Успешный вход!')} />
}
```

### Управление пользователями (для админов)

```tsx
import { useUserManagement, UserList } from './modules/auth'

function AdminPanel() {
  const { users, loading, deleteUser, verifyUser } = useUserManagement()

  return (
    <div>
      <h1>Управление пользователями</h1>
      <UserList 
        showFilters={true}
        onUserSelect={(user) => console.log('Выбран пользователь:', user)}
      />
    </div>
  )
}
```

### Кастомная конфигурация

```tsx
import { useAuth } from './modules/auth'

const customConfig = {
  supabaseUrl: 'your_url',
  supabaseAnonKey: 'your_key',
  adminEmails: ['admin@example.com'],
  redirectUrl: 'https://yourapp.com'
}

function App() {
  const auth = useAuth(customConfig)
  // ...
}
```

## 📚 API

### useAuth()

Основной хук для аутентификации.

**Возвращает:**
- `user` - текущий пользователь
- `session` - текущая сессия
- `loading` - состояние загрузки
- `error` - ошибки
- `isAuthenticated` - статус аутентификации
- `login(credentials)` - вход
- `register(data)` - регистрация
- `logout()` - выход
- `resetPassword(data)` - сброс пароля
- `changePassword(data)` - изменение пароля
- `verifyEmail(token)` - верификация email
- `isAdmin` - проверка админ прав
- `isActive` - проверка активности

### useUserManagement()

Хук для управления пользователями (только для админов).

**Возвращает:**
- `users` - список пользователей
- `loading` - состояние загрузки
- `error` - ошибки
- `fetchUsers(filters)` - загрузка пользователей
- `createUser(data)` - создание пользователя
- `updateUser(id, data)` - обновление пользователя
- `deleteUser(id)` - удаление пользователя
- `verifyUser(id)` - верификация пользователя
- `suspendUser(id)` - блокировка пользователя
- `activateUser(id)` - активация пользователя

### AuthService

Класс для работы с аутентификацией.

```tsx
import { AuthService } from './modules/auth'

const authService = new AuthService(config)

// Все методы из useAuth доступны здесь
await authService.login(credentials)
await authService.register(data)
// ...
```

## 🎨 Компоненты

### LoginForm

Форма входа с валидацией.

```tsx
<LoginForm 
  onSuccess={() => router.push('/dashboard')}
  onError={(error) => setError(error)}
  className="max-w-md mx-auto"
/>
```

### RegisterForm

Форма регистрации с профилем.

```tsx
<RegisterForm 
  onSuccess={() => router.push('/verify-email')}
  onError={(error) => setError(error)}
/>
```

### UserList

Список пользователей с фильтрами и действиями.

```tsx
<UserList 
  showFilters={true}
  onUserSelect={(user) => setSelectedUser(user)}
/>
```

## 🔒 Безопасность

- Все API запросы защищены JWT токенами
- RLS политики в Supabase
- Валидация на клиенте и сервере
- Защита от CSRF атак
- Безопасное хранение паролей

## 🧪 Тестирование

```tsx
import { render, screen } from '@testing-library/react'
import { LoginForm } from './modules/auth'

test('renders login form', () => {
  render(<LoginForm />)
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
})
```

## 📝 Лицензия

MIT License









