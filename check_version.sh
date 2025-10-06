#!/bin/bash

echo "=== ПРОВЕРКА ВЕРСИИ НА САЙТЕ ==="
echo "Время: $(date)"
echo ""

echo "🔍 Проверяем версию на сайте..."
echo "URL: https://hvostikalert.ru"

# Пробуем получить версию через API (если есть такой endpoint)
echo "📡 Пробуем получить версию через API..."
API_RESPONSE=$(curl -s "https://hvostikalert.ru/api/version" 2>/dev/null)
if [ $? -eq 0 ] && [ ! -z "$API_RESPONSE" ]; then
    echo "✅ API ответ: $API_RESPONSE"
else
    echo "⚠️ API /api/version недоступен или не отвечает"
fi
echo ""

# Проверяем доступность сайта
echo "🌐 Проверяем доступность сайта..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://hvostikalert.ru")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Сайт доступен (HTTP $HTTP_CODE)"
else
    echo "❌ Сайт недоступен (HTTP $HTTP_CODE)"
    exit 1
fi
echo ""

# Проверяем версию в HTML (если она там есть)
echo "🔍 Ищем версию в HTML..."
HTML_VERSION=$(curl -s "https://hvostikalert.ru" | grep -o 'v[0-9]\+\.[0-9]\+\.[0-9]\+' | head -1)
if [ ! -z "$HTML_VERSION" ]; then
    echo "✅ Версия в HTML: $HTML_VERSION"
else
    echo "⚠️ Версия не найдена в HTML"
fi
echo ""

# Проверяем версию в консоли браузера (через JavaScript)
echo "📋 Информация для проверки в браузере:"
echo "1. Откройте https://hvostikalert.ru"
echo "2. Нажмите F12 (Developer Tools)"
echo "3. Перейдите на вкладку Console"
echo "4. Выполните: fetch('/api/version').then(r => r.json()).then(console.log)"
echo ""

echo "=== ПРОВЕРКА ЗАВЕРШЕНА ==="
