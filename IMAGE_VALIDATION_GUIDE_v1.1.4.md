# Руководство по валидации изображений v1.1.4

## 📸 Обзор системы валидации

Система валидации изображений в Hvastik-Alert обеспечивает:
- Проверку типа файла
- Контроль размера файла
- Валидацию разрешения изображения
- Автоматическое сжатие больших файлов
- Понятные сообщения об ошибках

## 🔧 Технические требования

### Поддерживаемые форматы:
- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **WebP** (.webp)
- **GIF** (.gif)

### Ограничения:
- **Максимальный размер файла**: 5MB
- **Максимальное разрешение**: 2048x2048 пикселей
- **Минимальное разрешение**: 100x100 пикселей
- **Автоматическое сжатие**: файлы больше 2MB

## 📁 Структура файлов

```
lib/
├── image-upload.ts          # Основные утилиты валидации
app/
├── add/page.tsx            # Интеграция валидации в форму
components/
├── admin/database-tables.tsx # Админ панель с валидацией
```

## 🛠️ API функций

### `validateImage(file: File)`

Синхронная валидация файла по типу и размеру.

```typescript
import { validateImage } from '@/lib/image-upload'

const file = event.target.files[0]
const validation = validateImage(file)

if (!validation.valid) {
  alert(validation.error)
  return
}
```

**Возвращает:**
```typescript
{
  valid: boolean
  error?: string
}
```

**Возможные ошибки:**
- "Неподдерживаемый тип файла. Разрешены: image/jpeg, image/png, image/webp, image/gif"
- "Файл слишком большой (6.2MB). Максимальный размер: 5MB"

### `validateImageDimensions(file: File)`

Асинхронная валидация разрешения изображения.

```typescript
import { validateImageDimensions } from '@/lib/image-upload'

const dimensionValidation = await validateImageDimensions(file)

if (!dimensionValidation.valid) {
  alert(dimensionValidation.error)
  return
}
```

**Возвращает:**
```typescript
Promise<{
  valid: boolean
  error?: string
}>
```

**Возможные ошибки:**
- "Изображение слишком маленькое (50x50px). Минимальный размер: 100x100px"
- "Изображение слишком большое (3000x2000px). Максимальный размер: 2048x2048px"
- "Не удалось загрузить изображение для проверки"

### `compressImage(file: File, maxWidth?, maxHeight?, quality?)`

Сжимает изображение до указанных размеров.

```typescript
import { compressImage } from '@/lib/image-upload'

const compressedFile = await compressImage(file, 1200, 1200, 0.8)
```

**Параметры:**
- `file: File` - исходный файл
- `maxWidth: number` - максимальная ширина (по умолчанию: 1200)
- `maxHeight: number` - максимальная высота (по умолчанию: 1200)
- `quality: number` - качество сжатия 0-1 (по умолчанию: 0.8)

**Возвращает:**
```typescript
Promise<File>
```

## 🔄 Процесс валидации

### 1. Выбор файла
```typescript
const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files[0]
  if (!file) return

  // Валидация типа и размера
  const validation = validateImage(file)
  if (!validation.valid) {
    alert(`❌ ${validation.error}`)
    return
  }

  // Валидация разрешения
  const dimensionValidation = await validateImageDimensions(file)
  if (!dimensionValidation.valid) {
    alert(`❌ ${dimensionValidation.error}`)
    return
  }

  // Сжатие если нужно
  let finalFile = file
  if (file.size > 2 * 1024 * 1024) {
    finalFile = await compressImage(file)
  }

  // Загрузка в Supabase Storage
  // ...
}
```

### 2. Drag & Drop
```typescript
const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
  event.preventDefault()
  const file = event.dataTransfer.files[0]
  if (!file || !file.type.startsWith('image/')) return

  // Та же логика валидации что и выше
  // ...
}
```

## 🎨 Пользовательский интерфейс

### Информация о требованиях:
```jsx
<p className="text-xs text-gray-500">
  Поддерживаемые форматы: JPEG, PNG, WebP, GIF. Максимальный размер: 5MB. 
  Рекомендуемое разрешение: 100x100 - 2048x2048px. 
  Изображения больше 2MB будут автоматически сжаты.
</p>
```

### Сообщения об ошибках:
- Используются `alert()` для немедленного уведомления
- Эмодзи ❌ для визуального выделения ошибок
- Конкретные детали о проблеме

## 🔧 Конфигурация

### Константы в `lib/image-upload.ts`:
```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_IMAGE_WIDTH = 2048 // 2048px
const MAX_IMAGE_HEIGHT = 2048 // 2048px
const MIN_IMAGE_WIDTH = 100 // 100px
const MIN_IMAGE_HEIGHT = 100 // 100px
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
```

### Настройка сжатия:
```typescript
// Автоматическое сжатие файлов больше 2MB
if (file.size > 2 * 1024 * 1024) {
  finalFile = await compressImage(file)
}
```

## 🚀 Интеграция с Supabase Storage

### Загрузка после валидации:
```typescript
// Валидация прошла успешно
const formData = new FormData()
formData.append('file', finalFile)

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
})

if (response.ok) {
  const result = await response.json()
  setFormData(prev => ({ ...prev, photo_url: result.url }))
}
```

## 🐛 Обработка ошибок

### Типы ошибок:
1. **Неподдерживаемый формат** - блокирует загрузку
2. **Слишком большой размер** - блокирует загрузку
3. **Неподходящее разрешение** - блокирует загрузку
4. **Ошибка сжатия** - показывает ошибку
5. **Ошибка загрузки** - показывает ошибку

### Логирование:
```typescript
console.log('🔄 Сжимаем изображение...')
console.log(`✅ Изображение сжато: ${originalSize}MB → ${compressedSize}MB`)
console.error('❌ Ошибка валидации:', error)
```

## 📊 Производительность

### Оптимизации:
- Валидация на клиенте перед загрузкой
- Автоматическое сжатие больших файлов
- Использование Canvas API для сжатия
- Освобождение памяти после обработки

### Метрики:
- Средний размер файла до сжатия: ~3-4MB
- Средний размер файла после сжатия: ~500KB-1MB
- Время валидации: <100ms
- Время сжатия: 200-500ms

## 🔮 Будущие улучшения

### Планируемые функции:
- Предварительный просмотр сжатого изображения
- Настройка качества сжатия пользователем
- Поддержка HEIC формата
- Batch обработка нескольких изображений
- Прогресс-бар для сжатия

### Оптимизации:
- Web Workers для сжатия
- Lazy loading для больших изображений
- Кэширование сжатых версий
- Адаптивное сжатие под устройство

---

**Версия документации:** 1.1.4  
**Последнее обновление:** 25 января 2025
