# Исправление URL для подтверждения email

## Проблема
Ссылки из писем подтверждения ведут на Firebase хостинг вместо нашего приложения.

## Решение

### 1. В Firebase Console:

1. Откройте [Firebase Console](https://console.firebase.google.com/)
2. Выберите проект `hvostalert`
3. Перейдите в **Authentication** → **Templates**
4. Найдите шаблон **"Email address verification"**
5. Нажмите **"Edit"** (карандаш)
6. В поле **"Action URL"** укажите:
   ```
   http://localhost:3000/auth/verify-email
   ```
7. Нажмите **"Save"**

### 2. Для продакшена:

Когда будете деплоить на Vercel, измените URL на:
```
https://your-domain.vercel.app/auth/verify-email
```

### 3. Альтернативный способ - через код:

Можно также изменить URL в коде регистрации:

```typescript
// В app/register/page.tsx, строка 39
await sendEmailVerification(userCredential.user, {
  url: `http://localhost:3000/auth/verify-email`, // Явно указываем URL
  handleCodeInApp: true,
})
```

## Проверка

После изменения настроек:
1. Зарегистрируйте нового пользователя
2. Проверьте письмо - ссылка должна вести на `localhost:3000/auth/verify-email`
3. Перейдите по ссылке - должна открыться страница подтверждения нашего приложения

## Важно

- URL должен точно совпадать с маршрутом в приложении
- Для локальной разработки: `http://localhost:3000/auth/verify-email`
- Для продакшена: `https://your-domain.com/auth/verify-email`
