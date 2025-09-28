#!/bin/bash

# Переходим в директорию с проектом
cd /var/www/hvostikalert_usr/data/www/hvostikalert.ru || exit 1

echo "=== ДЕПЛОЙ НАЧАЛСЯ ==="
echo "Время: $(date)"
echo ""

echo "📁 Переходим в директорию проекта..."
pwd
echo ""

echo "🔄 Обновляем код из Git репозитория..."
git pull origin main || { echo "❌ Ошибка при git pull"; exit 1; }

echo "📋 Текущий коммит:"
git rev-parse --short HEAD
echo ""

echo "📦 Проверяем package.json..."
if [ -f package.json ]; then
    echo "✅ package.json найден"
    echo "Версия: $(grep '"version"' package.json | cut -d'"' -f4)"
else
    echo "❌ package.json не найден"
    exit 1
fi
echo ""

echo "🗑️ Удаляем старые зависимости (если есть)..."
if [ -d node_modules ]; then
    echo "Удаляем node_modules..."
    rm -rf node_modules
fi
if [ -f package-lock.json ]; then
    echo "Удаляем package-lock.json..."
    rm -f package-lock.json
fi
echo ""

echo "📥 Устанавливаем зависимости с подробным выводом..."
echo "Это может занять несколько минут..."
npm install --verbose --no-optional --no-audit --no-fund || { 
    echo "❌ Ошибка npm install"; 
    echo "Попробуем с --force...";
    npm install --force --no-optional --no-audit --no-fund || {
        echo "❌ Критическая ошибка установки зависимостей";
        exit 1;
    }
}
echo ""

echo "🔨 Делаем сборку проекта..."
npm run build || { echo "❌ Ошибка сборки"; exit 1; }
echo ""

echo "🔄 Перезапускаем приложение через pm2..."
pm2 restart hvastik-alert || { echo "❌ Ошибка перезапуска pm2"; exit 1; }
echo ""

echo "✅ Деплой успешно завершён!"
echo "Время завершения: $(date)"
echo "=== ДЕПЛОЙ ЗАВЕРШЕН ==="

