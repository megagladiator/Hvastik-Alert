#!/bin/bash

# Скрипт для исправления конфигурации PM2 на сервере
# Устанавливает NODE_ENV=production

echo "🔧 Исправление конфигурации PM2 для установки NODE_ENV=production"
echo "================================================================"
echo ""

# Переходим в директорию с проектом
cd /var/www/hvostikalert_usr/data/www/hvostikalert.ru || { echo "❌ Ошибка: Не удалось перейти в директорию проекта"; exit 1; }

echo "📁 Текущая директория:"
pwd
echo ""

echo "🔍 Проверяем текущую конфигурацию PM2..."
pm2 list
echo ""

echo "🔍 Проверяем переменные окружения текущего процесса..."
pm2 env 0 2>/dev/null || echo "Не удалось получить переменные окружения"
echo ""

echo "🛠️ Создаем/обновляем конфигурацию PM2..."

# Создаем ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: "hvastik-alert",
      script: "npm",
      args: "start",
      cwd: "/var/www/hvostikalert_usr/data/www/hvostikalert.ru",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NEXT_PUBLIC_SUPABASE_URL: "https://erjszhoaxapnkluezwpy.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyanN6aG9heGFwbmtsdWV6d3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxNzQ4NzEsImV4cCI6MjA1MTc1MDg3MX0.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq"
      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "1G",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true
    }
  ]
};
EOF

echo "✅ Создан ecosystem.config.js с NODE_ENV=production"
echo ""

echo "🔄 Перезапускаем PM2 с новой конфигурацией..."

# Останавливаем текущий процесс
pm2 stop hvastik-alert 2>/dev/null || echo "Процесс не был запущен"

# Удаляем старый процесс
pm2 delete hvastik-alert 2>/dev/null || echo "Процесс не найден для удаления"

# Запускаем с новой конфигурацией
pm2 start ecosystem.config.js

echo ""
echo "🔍 Проверяем статус после перезапуска..."
pm2 list
echo ""

echo "🔍 Проверяем переменные окружения нового процесса..."
pm2 env 0 2>/dev/null || echo "Не удалось получить переменные окружения"
echo ""

echo "📋 Проверяем логи..."
pm2 logs hvastik-alert --lines 10
echo ""

echo "✅ Конфигурация PM2 обновлена!"
echo ""
echo "🧪 Следующие шаги:"
echo "1. Зайдите на https://hvostikalert.ru/debug-env"
echo "2. Убедитесь, что NODE_ENV = 'production'"
echo "3. Протестируйте сброс пароля"
echo ""

echo "🎯 Ожидаемый результат:"
echo "- NODE_ENV должен быть 'production'"
echo "- Ссылки в письмах должны вести на https://hvostikalert.ru"
echo "- Система сброса пароля должна работать корректно"
echo ""
