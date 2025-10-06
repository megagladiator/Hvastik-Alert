#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Создаем pre-commit hook
function setupPreCommitHook() {
  const hooksDir = path.join(__dirname, '..', '.git', 'hooks');
  const preCommitFile = path.join(hooksDir, 'pre-commit');
  
  // Проверяем, существует ли .git/hooks
  if (!fs.existsSync(hooksDir)) {
    console.log('❌ .git/hooks directory not found. Make sure you are in a git repository.');
    return false;
  }
  
  const hookContent = `#!/bin/sh
# Автоматическое обновление версии перед коммитом

echo "🚀 Updating version before commit..."

# Запускаем скрипт обновления версии
node scripts/update-version.js

# Добавляем обновленные файлы в коммит
git add version.json package.json README.md

echo "✅ Version updated and files staged"
`;

  try {
    fs.writeFileSync(preCommitFile, hookContent);
    
    // Делаем файл исполняемым
    fs.chmodSync(preCommitFile, '755');
    
    console.log('✅ Pre-commit hook installed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error setting up pre-commit hook:', error.message);
    return false;
  }
}

// Создаем post-commit hook для логирования
function setupPostCommitHook() {
  const hooksDir = path.join(__dirname, '..', '.git', 'hooks');
  const postCommitFile = path.join(hooksDir, 'post-commit');
  
  const hookContent = `#!/bin/sh
# Логирование коммита с версией

# Получаем последний коммит
COMMIT_HASH=$(git rev-parse --short HEAD)
COMMIT_MESSAGE=$(git log -1 --pretty=%B)

# Читаем версию из version.json
VERSION=$(node -p "require('./version.json').version")

echo "📝 Commit: $COMMIT_HASH"
echo "📦 Version: $VERSION"
echo "💬 Message: $COMMIT_MESSAGE"
`;

  try {
    fs.writeFileSync(postCommitFile, hookContent);
    fs.chmodSync(postCommitFile, '755');
    
    console.log('✅ Post-commit hook installed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error setting up post-commit hook:', error.message);
    return false;
  }
}

// Основная функция
function main() {
  console.log('🔧 Setting up Git hooks for automatic versioning...');
  
  const preCommitSuccess = setupPreCommitHook();
  const postCommitSuccess = setupPostCommitHook();
  
  if (preCommitSuccess && postCommitSuccess) {
    console.log('🎉 Git hooks installed successfully!');
    console.log('📋 Now every commit will automatically update the version.');
    console.log('💡 To test: make a commit and see the version update automatically.');
  } else {
    console.log('❌ Some hooks failed to install. Please check the errors above.');
  }
}

// Запускаем если скрипт вызван напрямую
if (require.main === module) {
  main();
}

module.exports = { setupPreCommitHook, setupPostCommitHook };
