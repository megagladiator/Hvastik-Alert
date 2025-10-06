#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Функция для обновления версии
function updateVersion() {
  const versionFile = path.join(__dirname, '..', 'version.json');
  
  try {
    // Читаем текущую версию
    const versionData = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
    
    // Парсим версию (например, "1.2.75" -> [1, 2, 75])
    const versionParts = versionData.version.split('.').map(Number);
    
    // Увеличиваем patch версию (третий номер)
    versionParts[2] = (versionParts[2] || 0) + 1;
    
    // Формируем новую версию
    const newVersion = versionParts.join('.');
    
    // Обновляем данные
    versionData.version = newVersion;
    versionData.buildDate = new Date().toISOString().split('T')[0];
    versionData.buildTime = new Date().toTimeString().split(' ')[0];
    
    // Записываем обратно
    fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));
    
    console.log(`✅ Version updated to ${newVersion}`);
    console.log(`📅 Build date: ${versionData.buildDate}`);
    console.log(`⏰ Build time: ${versionData.buildTime}`);
    
    return newVersion;
  } catch (error) {
    console.error('❌ Error updating version:', error.message);
    process.exit(1);
  }
}

// Функция для обновления README
function updateReadme(newVersion) {
  const readmeFile = path.join(__dirname, '..', 'README.md');
  
  try {
    let readmeContent = fs.readFileSync(readmeFile, 'utf8');
    
    // Обновляем версию в README
    const versionRegex = /## 🆕 Recent Updates \(v[\d.]+ - \d+ \w+ \d+\)/;
    const currentDate = new Date().toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    readmeContent = readmeContent.replace(
      versionRegex,
      `## 🆕 Recent Updates (v${newVersion} - ${currentDate})`
    );
    
    fs.writeFileSync(readmeFile, readmeContent);
    console.log(`📝 README.md updated with version ${newVersion}`);
  } catch (error) {
    console.error('❌ Error updating README:', error.message);
  }
}

// Функция для добавления записи в changelog
function addChangelogEntry(newVersion) {
  const versionFile = path.join(__dirname, '..', 'version.json');
  
  try {
    const versionData = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
    
    // Добавляем новую запись в changelog
    const currentDate = new Date().toISOString().split('T')[0];
    
    versionData.changelog[newVersion] = {
      date: currentDate,
      changes: [
        "Автоматическое обновление версии",
        "Исправления и улучшения системы"
      ]
    };
    
    fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));
    console.log(`📋 Changelog updated with version ${newVersion}`);
  } catch (error) {
    console.error('❌ Error updating changelog:', error.message);
  }
}

// Основная функция
function main() {
  console.log('🚀 Starting version update...');
  
  const newVersion = updateVersion();
  updateReadme(newVersion);
  addChangelogEntry(newVersion);
  
  console.log(`🎉 Version ${newVersion} is ready!`);
}

// Запускаем если скрипт вызван напрямую
if (require.main === module) {
  main();
}

module.exports = { updateVersion, updateReadme, addChangelogEntry };