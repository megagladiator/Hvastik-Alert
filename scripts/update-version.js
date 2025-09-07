#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Функция для обновления версии
function updateVersion(newVersion, description = '') {
  const versionPath = path.join(__dirname, '..', 'version.json');
  
  try {
    // Читаем текущую версию
    const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
    
    // Обновляем версию
    const oldVersion = versionData.version;
    versionData.version = newVersion;
    versionData.buildDate = new Date().toISOString().split('T')[0];
    versionData.buildTime = new Date().toLocaleTimeString('ru-RU', { 
      hour12: false,
      timeZone: 'Europe/Moscow'
    });
    
    // Добавляем запись в changelog
    if (!versionData.changelog) {
      versionData.changelog = {};
    }
    
    versionData.changelog[newVersion] = {
      date: versionData.buildDate,
      changes: description ? [description] : [`Обновление до версии ${newVersion}`]
    };
    
    // Сохраняем обновленную версию
    fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));
    
    console.log(`✅ Версия обновлена с ${oldVersion} на ${newVersion}`);
    console.log(`📅 Дата сборки: ${versionData.buildDate} ${versionData.buildTime}`);
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка при обновлении версии:', error.message);
    return false;
  }
}

// Получаем аргументы командной строки
const args = process.argv.slice(2);
const newVersion = args[0];
const description = args.slice(1).join(' ');

if (!newVersion) {
  console.log('📋 Использование: node scripts/update-version.js <новая_версия> [описание]');
  console.log('📋 Пример: node scripts/update-version.js 1.0.2 "Исправлены ошибки в чате"');
  process.exit(1);
}

// Проверяем формат версии (например, 1.0.2)
const versionRegex = /^\d+\.\d+\.\d+$/;
if (!versionRegex.test(newVersion)) {
  console.error('❌ Неверный формат версии. Используйте формат: X.Y.Z (например, 1.0.2)');
  process.exit(1);
}

// Обновляем версию
updateVersion(newVersion, description);
