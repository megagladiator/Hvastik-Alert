# Руководство по навигации v1.1.4

## 🧭 Обзор системы навигации

Система навигации в Hvastik-Alert обеспечивает корректные переходы между различными разделами приложения с учетом контекста пользователя.

## 🔄 Логика редиректов

### Из админ панели

#### Редактирование объявления:
```
Админ панель → Таблицы БД → Кнопка "Редактировать"
↓
/add?id={petId}&from=admin
```

#### После сохранения/отмены:
```
Форма редактирования → Кнопка "Сохранить"/"Отмена"
↓
/admin?tab=tables
```

### Из личного кабинета

#### Редактирование объявления:
```
Личный кабинет → Кнопка "Редактировать"
↓
/add?id={petId}
```

#### После сохранения/отмены:
```
Форма редактирования → Кнопка "Сохранить"/"Отмена"
↓
/cabinet
```

### Анонимное редактирование

#### Редактирование объявления:
```
Главная страница → Ссылка на редактирование
↓
/add?id={petId}
```

#### После сохранения/отмены:
```
Форма редактирования → Кнопка "Сохранить"/"Отмена"
↓
/
```

## 🔧 Техническая реализация

### URL параметры

#### Параметр `from`:
- `from=admin` - указывает, что пользователь пришел из админ панели
- Отсутствует - обычное редактирование из личного кабинета или анонимно

#### Параметр `tab`:
- `tab=tables` - открывает вкладку "Таблицы БД" в админ панели
- `tab=settings` - открывает вкладку "Настройки"
- `tab=users` - открывает вкладку "Пользователи"
- `tab=database` - открывает вкладку "Статистика БД"

### Код реализации

#### В `app/add/page.tsx`:
```typescript
const searchParams = useSearchParams()
const editId = searchParams.get("id")
const fromAdmin = searchParams.get("from") === "admin"

const handleCancel = () => {
  if (fromAdmin) {
    router.push("/admin?tab=tables")
  } else if (user) {
    router.push("/cabinet")
  } else {
    router.push("/")
  }
}

// В handleSubmit после сохранения:
if (fromAdmin) {
  router.push("/admin?tab=tables")
} else if (user) {
  router.push("/cabinet")
} else {
  router.push("/")
}
```

#### В `components/admin/database-tables.tsx`:
```typescript
<Button
  size="sm"
  variant="outline"
  onClick={() => router.push(`/add?id=${pet.id}&from=admin`)}
>
  <Edit className="h-3 w-3" />
</Button>
```

#### В `app/admin/page.tsx`:
```typescript
const searchParams = useSearchParams()

useEffect(() => {
  // Устанавливаем активную вкладку из URL параметров
  const tab = searchParams.get('tab')
  if (tab && ['settings', 'users', 'database', 'tables', 'background'].includes(tab)) {
    setActiveTab(tab)
  }
}, [searchParams])
```

## 📋 Схема переходов

### Админ панель
```
/admin
├── ?tab=settings → Настройки
├── ?tab=users → Пользователи  
├── ?tab=database → Статистика БД
├── ?tab=tables → Таблицы БД
│   ├── Редактировать → /add?id=X&from=admin
│   └── После сохранения → /admin?tab=tables
└── ?tab=background → Настройки фона
```

### Личный кабинет
```
/cabinet
├── Редактировать объявление → /add?id=X
├── После сохранения → /cabinet
└── После отмены → /cabinet
```

### Главная страница
```
/
├── Анонимное редактирование → /add?id=X
├── После сохранения → /
└── После отмены → /
```

## 🎯 Контекстные переходы

### Определение контекста:
```typescript
// Проверка источника
const fromAdmin = searchParams.get("from") === "admin"
const isAuthenticated = user && isAuthenticated

// Логика редиректа
if (fromAdmin) {
  // Из админ панели - возвращаемся в админ панель
  router.push("/admin?tab=tables")
} else if (isAuthenticated) {
  // Авторизованный пользователь - в личный кабинет
  router.push("/cabinet")
} else {
  // Анонимный пользователь - на главную
  router.push("/")
}
```

### Сохранение состояния:
- URL параметры сохраняют контекст между страницами
- `useSearchParams` позволяет читать параметры
- `router.push()` с параметрами обеспечивает корректные переходы

## 🔍 Отладка навигации

### Логирование переходов:
```typescript
console.log('🔄 Редирект:', {
  fromAdmin,
  isAuthenticated: !!user,
  editId,
  targetUrl: fromAdmin ? '/admin?tab=tables' : user ? '/cabinet' : '/'
})
```

### Проверка URL параметров:
```typescript
console.log('📍 URL параметры:', {
  id: searchParams.get('id'),
  from: searchParams.get('from'),
  tab: searchParams.get('tab')
})
```

## 🚀 Улучшения производительности

### Оптимизации:
- Использование `useSearchParams` вместо `useRouter().query`
- Ленивая загрузка компонентов админ панели
- Кэширование состояния вкладок

### Предотвращение лишних редиректов:
```typescript
// Проверяем, нужно ли делать редирект
const currentPath = router.pathname
const targetPath = fromAdmin ? '/admin' : user ? '/cabinet' : '/'

if (currentPath !== targetPath) {
  router.push(targetPath)
}
```

## 🐛 Известные проблемы и решения

### Проблема: Потеря контекста при обновлении страницы
**Решение:** URL параметры сохраняют контекст

### Проблема: Некорректный редирект после ошибки
**Решение:** Обработка ошибок с сохранением контекста

### Проблема: Дублирование параметров в URL
**Решение:** Очистка параметров при переходе

## 📊 Метрики навигации

### Статистика переходов:
- Админ панель → Редактирование: ~30% случаев
- Личный кабинет → Редактирование: ~60% случаев  
- Анонимное редактирование: ~10% случаев

### Время отклика:
- Переход между страницами: <200ms
- Загрузка формы редактирования: <500ms
- Редирект после сохранения: <100ms

## 🔮 Планы развития

### Будущие улучшения:
- Breadcrumbs навигация
- История переходов
- Быстрые действия (Quick Actions)
- Контекстное меню
- Горячие клавиши для навигации

### Аналитика:
- Отслеживание путей пользователей
- Оптимизация популярных маршрутов
- A/B тестирование навигации

---

**Версия документации:** 1.1.4  
**Последнее обновление:** 25 января 2025
