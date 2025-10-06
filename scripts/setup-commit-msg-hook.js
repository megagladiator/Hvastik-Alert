#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Создаем prepare-commit-msg hook для добавления версии в сообщение коммита
function setupPrepareCommitMsgHook() {
  const hooksDir = path.join(__dirname, '..', '.git', 'hooks');
  const prepareCommitMsgFile = path.join(hooksDir, 'prepare-commit-msg');
  
  // Проверяем, существует ли .git/hooks
  if (!fs.existsSync(hooksDir)) {
    console.log('❌ .git/hooks directory not found. Make sure you are in a git repository.');
    return false;
  }
  
  const hookContent = `#!/bin/sh
# Добавляем версию в сообщение коммита

# Получаем текущую версию
if [ -f version.json ]; then
    VERSION=$(node -p "require('./version.json').version")
    
    # Читаем сообщение коммита
    COMMIT_MSG_FILE=$1
    if [ -f "$COMMIT_MSG_FILE" ]; then
        COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")
        
        # Проверяем, есть ли уже версия в сообщении
        if ! echo "$COMMIT_MSG" | grep -q "v[0-9]\\+\\.[0-9]\\+\\.[0-9]\\+"; then
            # Добавляем версию в начало сообщения
            echo "v$VERSION - $COMMIT_MSG" > "$COMMIT_MSG_FILE"
            echo "📝 Added version v$VERSION to commit message"
        fi
    fi
fi
`;

  try {
    fs.writeFileSync(prepareCommitMsgFile, hookContent);
    
    // Делаем файл исполняемым
    fs.chmodSync(prepareCommitMsgFile, '755');
    
    console.log('✅ Prepare-commit-msg hook installed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error setting up prepare-commit-msg hook:', error.message);
    return false;
  }
}

// Основная функция
function main() {
  console.log('🔧 Setting up commit message hook for version display...');
  
  const success = setupPrepareCommitMsgHook();
  
  if (success) {
    console.log('🎉 Commit message hook installed successfully!');
    console.log('📋 Now every commit message will include the version number.');
    console.log('💡 Example: "v1.2.80 - Your commit message"');
  } else {
    console.log('❌ Hook failed to install. Please check the errors above.');
  }
}

// Запускаем если скрипт вызван напрямую
if (require.main === module) {
  main();
}

module.exports = { setupPrepareCommitMsgHook };
