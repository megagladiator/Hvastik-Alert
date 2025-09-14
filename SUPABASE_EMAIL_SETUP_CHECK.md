# Проверка настроек Supabase для восстановления пароля

## Проблема
Получаем ошибку "email rate limit exceeded" при попытке:
- Восстановления пароля
- Регистрации новых пользователей
- Подтверждения email

## Что нужно проверить в Supabase Dashboard

### 1. Authentication Settings
Перейдите в: **Authentication > Settings**

#### Site URL
```
http://localhost:3000
```

#### Redirect URLs
Добавьте следующие URL:
```
http://localhost:3000/auth/reset-password
http://localhost:3000/auth/verify-email
http://localhost:3000/auth/callback
```

### 2. Email Settings
Перейдите в: **Authentication > Email Templates**

#### Password Reset Template
Убедитесь, что шаблон настроен правильно.

### 3. Rate Limits
Перейдите в: **Authentication > Settings > Rate Limits**

#### Email Rate Limits
- **Email sends per hour**: увеличьте до 100 или больше
- **Email sends per day**: увеличьте до 1000 или больше

### 4. SMTP Settings
Перейдите в: **Authentication > Settings > SMTP Settings**

Убедитесь, что SMTP настроен правильно:
- **Host**: smtp.gmail.com
- **Port**: 587
- **Username**: ваш Gmail
- **Password**: App Password (не обычный пароль)

## Тестирование

После настройки подождите 1 час и попробуйте снова восстановить пароль.

## Альтернативное решение

Если проблема продолжается, можно:
1. Увеличить rate limits в Supabase
2. Использовать другой email провайдер
3. Настроить кастомный SMTP сервер
