#!/bin/bash

# Переходим в директорию с проектом
cd /var/www/hvostikalert_usr/data/www/hvostikalert.ru || exit 1

echo "=== ДЕПЛОЙ С ПРОВЕРКОЙ ВЕРСИИ ==="
echo "Время: $(date)"
echo ""

echo "📁 Текущая директория:"
pwd
echo ""

echo "🔍 Проверяем текущую версию на сервере..."
if [ -f version.json ]; then
    CURRENT_VERSION=$(grep '"version"' version.json | cut -d'"' -f4)
    echo "Текущая версия на сервере: $CURRENT_VERSION"
else
    echo "❌ version.json не найден на сервере"
fi
echo ""

echo "🔄 Обновляем код из Git репозитория..."
echo "Выполняем: git pull origin main"
git pull origin main || { echo "❌ Ошибка при git pull"; exit 1; }

echo "📋 Информация о последнем коммите:"
git log -1 --pretty=format:"Hash: %h%nMessage: %s%nDate: %ad" --date=short
echo ""

echo "🔍 Проверяем версию после обновления..."
if [ -f version.json ]; then
    NEW_VERSION=$(grep '"version"' version.json | cut -d'"' -f4)
    echo "Новая версия после git pull: $NEW_VERSION"
    
    if [ "$CURRENT_VERSION" != "$NEW_VERSION" ]; then
        echo "✅ Версия изменилась: $CURRENT_VERSION → $NEW_VERSION"
    else
        echo "⚠️ Версия не изменилась: $NEW_VERSION"
    fi
else
    echo "❌ version.json не найден после git pull"
    exit 1
fi
echo ""

echo "📦 Проверяем package.json..."
if [ -f package.json ]; then
    PACKAGE_VERSION=$(grep '"version"' package.json | cut -d'"' -f4)
    echo "✅ package.json найден, версия: $PACKAGE_VERSION"
else
    echo "❌ package.json не найден"
    exit 1
fi
echo ""

echo "🗑️ Очищаем кэш и старые файлы..."
if [ -d node_modules ]; then
    echo "Удаляем node_modules..."
    rm -rf node_modules
fi
if [ -f package-lock.json ]; then
    echo "Удаляем package-lock.json..."
    rm -f package-lock.json
fi
if [ -d .next ]; then
    echo "Удаляем .next (кэш Next.js)..."
    rm -rf .next
fi
echo ""

echo "📥 Устанавливаем зависимости..."
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

echo "🔨 Собираем проект..."
npm run build || { echo "❌ Ошибка сборки"; exit 1; }
echo ""

echo "🔄 Перезапускаем приложение..."
pm2 restart hvastik-alert || { echo "❌ Ошибка перезапуска pm2"; exit 1; }
echo ""

echo "⏳ Ждем 5 секунд для запуска приложения..."
sleep 5

echo "🔍 Проверяем статус приложения..."
pm2 status hvastik-alert
echo ""

echo "🌐 Проверяем доступность сайта..."
if curl -s -o /dev/null -w "%{http_code}" https://hvostikalert.ru | grep -q "200"; then
    echo "✅ Сайт доступен (HTTP 200)"
else
    echo "⚠️ Сайт может быть недоступен"
fi
echo ""

echo "📊 Финальная проверка версии..."
if [ -f version.json ]; then
    FINAL_VERSION=$(grep '"version"' version.json | cut -d'"' -f4)
    BUILD_DATE=$(grep '"buildDate"' version.json | cut -d'"' -f4)
    BUILD_TIME=$(grep '"buildTime"' version.json | cut -d'"' -f4)
    echo "✅ Финальная версия: $FINAL_VERSION"
    echo "📅 Дата сборки: $BUILD_DATE"
    echo "⏰ Время сборки: $BUILD_TIME"
else
    echo "❌ version.json не найден в финальной проверке"
fi
echo ""

echo "✅ ДЕПЛОЙ ЗАВЕРШЕН УСПЕШНО!"
echo "Время завершения: $(date)"
echo "=== ДЕПЛОЙ ЗАВЕРШЕН ==="
