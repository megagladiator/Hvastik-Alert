#!/bin/bash

echo "=== ЛОКАЛЬНЫЙ ДЕПЛОЙ ==="
echo "Время: $(date)"
echo ""

echo "📁 Текущая директория:"
pwd
echo ""

echo "🔍 Проверяем текущую версию..."
if [ -f version.json ]; then
    CURRENT_VERSION=$(grep '"version"' version.json | cut -d'"' -f4)
    echo "Текущая версия: $CURRENT_VERSION"
else
    echo "❌ version.json не найден"
fi
echo ""

echo "📋 Информация о последнем коммите:"
git log -1 --pretty=format:"Hash: %h%nMessage: %s%nDate: %ad" --date=short
echo ""

echo "🔄 Отправляем изменения в Git..."
git push origin main || { echo "❌ Ошибка при git push"; exit 1; }
echo ""

echo "✅ ИЗМЕНЕНИЯ ОТПРАВЛЕНЫ В GIT!"
echo "Время завершения: $(date)"
echo "=== ДЕПЛОЙ ЗАВЕРШЕН ==="
echo ""
echo "📝 Для деплоя на сервер выполните на сервере:"
echo "   ./deploy_with_version_check.sh"
