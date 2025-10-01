# Полное руководство по развертыванию Hvostik Alert

## 📋 Содержание
1. [Настройка окружения](#настройка-окружения)
2. [Локальная разработка](#локальная-разработка)
3. [Настройка Supabase](#настройка-supabase)
4. [Деплой на продакшен](#деплой-на-продакшен)
5. [Автоматизация деплоя](#автоматизация-деплоя)
6. [Устранение неполадок](#устранение-неполадок)

---

## 🛠 Настройка окружения

### Требования
- Node.js 18+ 
- Git
- SSH ключи для доступа к серверу
- Аккаунт Supabase

### Установка зависимостей
```bash
# Клонирование репозитория
git clone https://github.com/megagladiator/Hvastik-Alert.git
cd Hvastik-Alert

# Установка зависимостей
npm install
```

### Настройка переменных окружения

Создайте файл `.env.local` в корне проекта:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://erjszhoaxapnkluezwpy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Email Configuration (если используете Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@hvostikalert.ru

# Database
DATABASE_URL=your_database_url

# Environment
NODE_ENV=development
```

---

## 💻 Локальная разработка

### Запуск сервера разработки
```bash
# Запуск в режиме разработки
npm run dev

# Или с помощью yarn
yarn dev
```

Сервер будет доступен по адресу: `http://localhost:3000`

### Доступные команды
```bash
# Сборка проекта
npm run build

# Запуск продакшен версии локально
npm run start

# Линтинг кода
npm run lint

# Обновление версии
npm run version:update
```

### Тестирование
```bash
# Запуск тестов
npm test

# Запуск тестов с покрытием
npm run test:coverage
```

---

## 🔧 Настройка Supabase

### 1. Создание проекта
1. Перейдите на https://supabase.com
2. Создайте новый проект
3. Скопируйте URL и ключи из Settings → API

### 2. Настройка аутентификации
В Supabase Dashboard → Authentication → Settings:

#### Site URL:
```
https://hvostikalert.ru
```

#### Redirect URLs:
```
https://hvostikalert.ru/auth/verify-email
https://hvostikalert.ru/auth/reset-password
https://hvostikalert.ru/auth/callback
https://hvostikalert.ru/auth/error
http://localhost:3000/auth/verify-email
http://localhost:3000/auth/reset-password
http://localhost:3000/auth/callback
http://localhost:3000/auth/error
```

### 3. Настройка Email
В Supabase Dashboard → Authentication → Emails:

#### Включить встроенный email сервис:
- Отключите "Enable Custom SMTP"
- Supabase будет использовать свой email сервис

#### Или настроить SMTP:
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Pass: your-app-password
```

### 4. Настройка базы данных
Выполните SQL скрипты из папки `scripts/` для создания таблиц и политик RLS.

---

## 🚀 Деплой на продакшен

### Информация о сервере
- **Домен**: https://hvostikalert.ru
- **IP**: 212.34.138.16
- **Пользователь**: root
- **Путь к проекту**: /var/www/hvostikalert_usr/

### Ручной деплой

#### 1. Подключение к серверу
```bash
ssh -i ~/.ssh/id_rsa root@212.34.138.16
```

#### 2. Переход в директорию проекта
```bash
cd /var/www/hvostikalert_usr/
```

#### 3. Обновление кода
```bash
# Получение последних изменений
git pull origin main

# Установка зависимостей
npm install

# Сборка проекта
npm run build

# Перезапуск сервиса
pm2 restart hvostik-alert
```

### Автоматический деплой

#### Использование bat файлов (Windows)

1. **Подключение к серверу**:
   - Запустите: `public/Conect_to_server —VDS.bat`
   - Файл автоматически подключится к серверу по SSH

2. **Запуск деплоя**:
   - Запустите: `public/Запуск деплоя на сервере HVOSTIVALERT.bat`
   - Файл автоматически выполнит деплой на сервере

#### Настройка bat файлов

Перед использованием обновите пути в файлах:

**Conect_to_server —VDS.bat**:
```batch
SET SSH_HOST=212.34.138.16
SET SSH_USER=root
SET SSH_KEY_PATH=C:\Users\SuperBoss007\.ssh\id_rsa
```

**Запуск деплоя на сервере HVOSTIVALERT.bat**:
```batch
SET SSH_USER=root
SET SSH_HOST=212.34.138.16
SET SSH_KEY_PATH=C:\Users\SuperBoss007\.ssh\id_rsa
SET DEPLOY_SCRIPT_PATH=/var/www/hvostikalert_usr/deploy.sh
```

### Настройка PM2 (Process Manager)

#### Установка PM2
```bash
npm install -g pm2
```

#### Конфигурация PM2
Создайте файл `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'hvostik-alert',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/hvostikalert_usr',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

#### Команды PM2
```bash
# Запуск приложения
pm2 start ecosystem.config.js

# Перезапуск
pm2 restart hvostik-alert

# Остановка
pm2 stop hvostik-alert

# Просмотр логов
pm2 logs hvostik-alert

# Мониторинг
pm2 monit
```

---

## 🔄 Автоматизация деплоя

### GitHub Actions (рекомендуется)

Создайте файл `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: 212.34.138.16
        username: root
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /var/www/hvostikalert_usr
          git pull origin main
          npm install
          npm run build
          pm2 restart hvostik-alert
```

### Скрипт деплоя на сервере

Создайте файл `deploy.sh` на сервере:
```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Переход в директорию проекта
cd /var/www/hvostikalert_usr

# Получение последних изменений
echo "📥 Pulling latest changes..."
git pull origin main

# Установка зависимостей
echo "📦 Installing dependencies..."
npm install

# Сборка проекта
echo "🔨 Building project..."
npm run build

# Перезапуск приложения
echo "🔄 Restarting application..."
pm2 restart hvostik-alert

echo "✅ Deployment completed successfully!"
```

Сделайте скрипт исполняемым:
```bash
chmod +x deploy.sh
```

---

## 🐛 Устранение неполадок

### Проблемы с сбросом пароля

#### Проблема: Ссылка ведет на localhost вместо продакшена
**Решение**: Проверьте настройки в Supabase Dashboard:
1. Site URL должен быть: `https://hvostikalert.ru`
2. Redirect URLs должны включать все необходимые URL
3. Убедитесь, что `NODE_ENV=production` на сервере

#### Проблема: Email не приходит
**Решение**:
1. Проверьте настройки SMTP в Supabase
2. Проверьте папку "Спам"
3. Убедитесь, что встроенный email сервис включен

### Проблемы с деплоем

#### Проблема: Ошибка SSH подключения
**Решение**:
1. Проверьте SSH ключи
2. Убедитесь, что сервер доступен
3. Проверьте права доступа к файлам

#### Проблема: Ошибка сборки
**Решение**:
1. Проверьте переменные окружения
2. Убедитесь, что все зависимости установлены
3. Проверьте логи: `pm2 logs hvostik-alert`

### Мониторинг

#### Просмотр логов
```bash
# Логи приложения
pm2 logs hvostik-alert

# Логи Nginx
tail -f /var/log/nginx/error.log

# Логи системы
journalctl -u nginx -f
```

#### Проверка статуса
```bash
# Статус PM2
pm2 status

# Статус Nginx
systemctl status nginx

# Статус сервера
htop
```

---

## 📊 Мониторинг и аналитика

### Настройка мониторинга
1. **PM2 Monitoring**: `pm2 monit`
2. **Nginx Status**: Настройте status модуль
3. **Логи**: Централизованное логирование

### Резервное копирование
```bash
# Создание бэкапа базы данных
pg_dump hvostik_alert > backup_$(date +%Y%m%d).sql

# Создание бэкапа файлов
tar -czf files_backup_$(date +%Y%m%d).tar.gz /var/www/hvostikalert_usr
```

---

## 🔐 Безопасность

### SSL сертификат
```bash
# Установка Let's Encrypt
certbot --nginx -d hvostikalert.ru

# Автообновление
crontab -e
# Добавить: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall
```bash
# Настройка UFW
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

### Обновления
```bash
# Обновление системы
apt update && apt upgrade -y

# Обновление Node.js
nvm install node --latest-npm
```

---

## 📞 Поддержка

### Контакты
- **GitHub**: https://github.com/megagladiator/Hvastik-Alert
- **Домен**: https://hvostikalert.ru
- **Supabase**: https://supabase.com/dashboard/project/erjszhoaxapnkluezwpy

### Полезные ссылки
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

---

## 📝 Changelog

### Версия 1.2.33 (27.01.2025)
- ✅ Исправлена функциональность сброса пароля
- ✅ Улучшено логирование ошибок в API
- ✅ Добавлена обработка rate limiting от Supabase
- ✅ Обновлены модули аутентификации
- ✅ Улучшена функциональность чатов
- ✅ Созданы новые API endpoints для сброса пароля
- ✅ Исправлена конфигурация Supabase клиента
- ✅ Добавлены подробные логи для отладки проблем с email
- ✅ Исправлено определение URL для продакшена
- ✅ Добавлены bat файлы для автоматизации деплоя

---

*Последнее обновление: 27 января 2025*
