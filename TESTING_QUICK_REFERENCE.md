# 🧪 Быстрая справка по тестированию Хвостик Alert

## 🚀 Быстрый старт

### Запуск тестов
```bash
# Все тесты
npm test

# Только простые тесты
npm test -- __tests__/simple/

# С покрытием кода
npm run test:coverage

# Браузерные тесты
npm run dev
# Откройте: http://localhost:3000/simple-test-runner.html
```

## 📁 Структура тестов

```
__tests__/
├── simple/                    # ✅ Работающие тесты
│   ├── basic-functionality.test.ts
│   └── api-mocked.test.ts
├── api/                       # API тесты
├── components/                # React компоненты
├── integration/               # Supabase интеграция
├── performance/               # Производительность
└── e2e/                       # End-to-End

public/
├── simple-test-runner.html    # 🌐 Простой браузерный тест
└── test-runner.html           # 🌐 Комплексный браузерный тест
```

## 🎯 Типы тестов

| Тип | Файл | Описание |
|-----|------|----------|
| **Базовые** | `basic-functionality.test.ts` | Валидация, форматирование, логика |
| **API** | `api-mocked.test.ts` | Endpoints с моками |
| **Интеграция** | `supabase.test.ts` | База данных, аутентификация |
| **Производительность** | `load-test.test.ts` | Время загрузки, память |
| **E2E** | `full-system.test.ts` | Полные пользовательские сценарии |

## 🔧 Конфигурация

### Jest (`jest.config.js`)
- Окружение: `jsdom`
- Покрытие: 60% минимум
- Таймаут: 10 сек
- TypeScript поддержка

### Моки (`jest.setup.js`)
- `global.fetch` - для API тестов
- `Request/Response` - для HTTP
- Переменные окружения

## 🌐 Браузерные тесты

### Простой тест-раннер
**URL**: `http://localhost:3000/simple-test-runner.html`

**Кнопки**:
- 🚀 **Базовые тесты** - валидация, форматирование
- 🔌 **API тесты** - проверка endpoints
- 🗺️ **Геокодирование** - координаты городов
- ⚡ **Все простые тесты** - комплексная проверка

### Комплексный тест-раннер
**URL**: `http://localhost:3000/test-runner.html`

**Категории**:
- 🔐 Аутентификация
- ⚙️ Основной функционал
- 🔌 API endpoints
- 👑 Админ панель
- 🗺️ Геокодирование

## 📊 Результаты

### Текущие показатели
```
✅ Jest тесты: 29/29 (100%)
✅ Браузерные тесты: 3/3 (100%)
✅ API endpoints: 5/5 работают
✅ Покрытие: 60%+
```

### Пороги производительности
- Загрузка страниц: <3 сек
- API ответы: <2 сек
- Загрузка карт: <8 сек
- Память: <10MB

## 🔌 API Endpoints

| Endpoint | Метод | Статус |
|----------|-------|--------|
| `/api/geocode` | GET | ✅ |
| `/api/pets` | GET/POST | ✅ |
| `/api/auth/*` | GET/POST | ✅ |
| `/api/admin/*` | GET/POST | ✅ |
| `/api/upload` | POST | ✅ |

## 🐛 Troubleshooting

### Проблемы и решения

| Проблема | Решение |
|----------|---------|
| Тесты не запускаются | `npm test -- --clearCache` |
| Ошибки fetch | Проверить моки в `jest.setup.js` |
| TypeScript ошибки | `npx tsc --noEmit` |
| Браузерные тесты 404 | Файлы в `public/`, сервер запущен |
| API тесты падают | Проверить endpoints, моки |

### Отладка
```bash
# Подробный вывод
npm test -- --verbose

# Конкретный тест
npm test -- --testNamePattern="geocoding"

# С отладкой
DEBUG=* npm test
```

## 📈 Добавление тестов

### Новый Jest тест
```typescript
// __tests__/new-feature.test.ts
describe('New Feature', () => {
  it('should work correctly', () => {
    expect(true).toBe(true)
  })
})
```

### Новый браузерный тест
```javascript
// В test-suite.js
testSuite.addTest('New Test', async () => {
  // Ваш тест
}, 'category')
```

## 🎯 Лучшие практики

1. **Именование**: Описательные названия тестов
2. **Структура**: Arrange → Act → Assert
3. **Моки**: Внешние зависимости, реалистичные данные
4. **Покрытие**: 80%+ для критичных путей
5. **Очистка**: Моки между тестами

## 📞 Поддержка

- 📖 **Полная документация**: `TESTING_SYSTEM_DOCUMENTATION.md`
- 🧪 **Отчет о системе**: `TESTING_SYSTEM_REPORT.md`
- 🔧 **Конфигурация**: `jest.config.js`, `jest.setup.js`

---

**Система тестирования готова к использованию! 🚀**


