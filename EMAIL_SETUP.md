# Настройка Email для сброса пароля

## Проблема

Письма для сброса пароля не приходят на почту. Это может быть связано с настройками Supabase.

## Решение

### 1. Проверьте настройки Email в Supabase

1. **Перейдите в Dashboard Supabase**
2. **Откройте Authentication → Settings**
3. **Проверьте раздел "Email Templates"**

### 2. Настройте SMTP (рекомендуется)

#### Вариант A: Использование Gmail SMTP

1. **В Supabase Dashboard** перейдите в **Authentication → Settings**
2. **Найдите раздел "SMTP Settings"**
3. **Заполните поля:**

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: ваш-email@gmail.com
SMTP Pass: ваш-пароль-приложения
```

**Для получения пароля приложения Gmail:**
1. Включите двухфакторную аутентификацию
2. Перейдите в настройки безопасности Google
3. Создайте пароль приложения для "Mail"

#### Вариант B: Использование других провайдеров

**SendGrid:**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: ваш-api-ключ-sendgrid
```

**Mailgun:**
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: ваш-email@ваш-домен.com
SMTP Pass: ваш-пароль-mailgun
```

### 3. Настройте Email Templates

В Supabase Dashboard → Authentication → Email Templates:

#### Password Reset Template:
```html
<h2>Сброс пароля</h2>
<p>Здравствуйте!</p>
<p>Вы запросили сброс пароля для вашего аккаунта.</p>
<p>Нажмите на кнопку ниже, чтобы установить новый пароль:</p>
<a href="{{ .ConfirmationURL }}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Сбросить пароль</a>
<p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
<p>С уважением,<br>Команда Хвостик Alert</p>
```

#### Confirm Signup Template:
```html
<h2>Подтверждение регистрации</h2>
<p>Здравствуйте!</p>
<p>Спасибо за регистрацию в Хвостик Alert!</p>
<p>Для завершения регистрации нажмите на кнопку ниже:</p>
<a href="{{ .ConfirmationURL }}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Подтвердить email</a>
<p>С уважением,<br>Команда Хвостик Alert</p>
```

### 4. Проверьте настройки домена

1. **В Supabase Dashboard** перейдите в **Authentication → Settings**
2. **Найдите "Site URL"** и убедитесь, что указан правильный домен
3. **Добавьте разрешенные домены** в "Redirect URLs":

```
http://localhost:3000/auth/reset-password
https://ваш-домен.com/auth/reset-password
```

### 5. Тестирование

#### Проверьте в консоли браузера:
1. Откройте Developer Tools (F12)
2. Перейдите на вкладку Console
3. Попробуйте сбросить пароль
4. Проверьте, есть ли ошибки в консоли

#### Проверьте в Supabase Dashboard:
1. Перейдите в **Authentication → Users**
2. Найдите вашего пользователя
3. Проверьте, есть ли записи о попытках сброса пароля

### 6. Альтернативные решения

#### Если SMTP не работает:

1. **Используйте встроенный email сервис Supabase**
   - В настройках Authentication включите "Enable email confirmations"
   - Supabase будет использовать свой email сервис

2. **Проверьте папку "Спам"**
   - Письма могут попадать в спам
   - Добавьте адрес отправителя в белый список

3. **Используйте тестовый email**
   - Создайте тестовый аккаунт на Gmail
   - Используйте его для тестирования

### 7. Отладка

#### Добавьте логирование в код:

```typescript
const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: resetUrl
})

console.log("Reset password result:", { error: resetError, email, resetUrl })
```

#### Проверьте переменные окружения:

```env
NEXT_PUBLIC_SUPABASE_URL=ваш-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-ключ
```

### 8. Частые проблемы

1. **"User not found"** - пользователь не зарегистрирован
2. **"Too many requests"** - превышен лимит запросов
3. **"Invalid email"** - неправильный формат email
4. **"SMTP error"** - проблемы с настройками SMTP

### 9. Проверка работоспособности

После настройки:

1. **Зарегистрируйте нового пользователя**
2. **Попробуйте сбросить пароль**
3. **Проверьте, приходит ли письмо**
4. **Перейдите по ссылке в письме**
5. **Установите новый пароль**

Если все работает, функционал сброса пароля настроен правильно! 

## Проблема

Письма для сброса пароля не приходят на почту. Это может быть связано с настройками Supabase.

## Решение

### 1. Проверьте настройки Email в Supabase

1. **Перейдите в Dashboard Supabase**
2. **Откройте Authentication → Settings**
3. **Проверьте раздел "Email Templates"**

### 2. Настройте SMTP (рекомендуется)

#### Вариант A: Использование Gmail SMTP

1. **В Supabase Dashboard** перейдите в **Authentication → Settings**
2. **Найдите раздел "SMTP Settings"**
3. **Заполните поля:**

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: ваш-email@gmail.com
SMTP Pass: ваш-пароль-приложения
```

**Для получения пароля приложения Gmail:**
1. Включите двухфакторную аутентификацию
2. Перейдите в настройки безопасности Google
3. Создайте пароль приложения для "Mail"

#### Вариант B: Использование других провайдеров

**SendGrid:**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: ваш-api-ключ-sendgrid
```

**Mailgun:**
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: ваш-email@ваш-домен.com
SMTP Pass: ваш-пароль-mailgun
```

### 3. Настройте Email Templates

В Supabase Dashboard → Authentication → Email Templates:

#### Password Reset Template:
```html
<h2>Сброс пароля</h2>
<p>Здравствуйте!</p>
<p>Вы запросили сброс пароля для вашего аккаунта.</p>
<p>Нажмите на кнопку ниже, чтобы установить новый пароль:</p>
<a href="{{ .ConfirmationURL }}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Сбросить пароль</a>
<p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
<p>С уважением,<br>Команда Хвостик Alert</p>
```

#### Confirm Signup Template:
```html
<h2>Подтверждение регистрации</h2>
<p>Здравствуйте!</p>
<p>Спасибо за регистрацию в Хвостик Alert!</p>
<p>Для завершения регистрации нажмите на кнопку ниже:</p>
<a href="{{ .ConfirmationURL }}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Подтвердить email</a>
<p>С уважением,<br>Команда Хвостик Alert</p>
```

### 4. Проверьте настройки домена

1. **В Supabase Dashboard** перейдите в **Authentication → Settings**
2. **Найдите "Site URL"** и убедитесь, что указан правильный домен
3. **Добавьте разрешенные домены** в "Redirect URLs":

```
http://localhost:3000/auth/reset-password
https://ваш-домен.com/auth/reset-password
```

### 5. Тестирование

#### Проверьте в консоли браузера:
1. Откройте Developer Tools (F12)
2. Перейдите на вкладку Console
3. Попробуйте сбросить пароль
4. Проверьте, есть ли ошибки в консоли

#### Проверьте в Supabase Dashboard:
1. Перейдите в **Authentication → Users**
2. Найдите вашего пользователя
3. Проверьте, есть ли записи о попытках сброса пароля

### 6. Альтернативные решения

#### Если SMTP не работает:

1. **Используйте встроенный email сервис Supabase**
   - В настройках Authentication включите "Enable email confirmations"
   - Supabase будет использовать свой email сервис

2. **Проверьте папку "Спам"**
   - Письма могут попадать в спам
   - Добавьте адрес отправителя в белый список

3. **Используйте тестовый email**
   - Создайте тестовый аккаунт на Gmail
   - Используйте его для тестирования

### 7. Отладка

#### Добавьте логирование в код:

```typescript
const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: resetUrl
})

console.log("Reset password result:", { error: resetError, email, resetUrl })
```

#### Проверьте переменные окружения:

```env
NEXT_PUBLIC_SUPABASE_URL=ваш-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-ключ
```

### 8. Частые проблемы

1. **"User not found"** - пользователь не зарегистрирован
2. **"Too many requests"** - превышен лимит запросов
3. **"Invalid email"** - неправильный формат email
4. **"SMTP error"** - проблемы с настройками SMTP

### 9. Проверка работоспособности

После настройки:

1. **Зарегистрируйте нового пользователя**
2. **Попробуйте сбросить пароль**
3. **Проверьте, приходит ли письмо**
4. **Перейдите по ссылке в письме**
5. **Установите новый пароль**

Если все работает, функционал сброса пароля настроен правильно! 
 