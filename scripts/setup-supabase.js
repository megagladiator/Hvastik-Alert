// Скрипт для автоматической настройки Supabase
// ВАЖНО: Этот скрипт требует API ключ Supabase с правами администратора

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'your-service-key'

async function setupSupabase() {
  console.log('🔧 Настройка Supabase...')
  
  try {
    // Проверяем наличие необходимых переменных
    if (!SUPABASE_URL || SUPABASE_URL.includes('your-project')) {
      console.error('❌ Ошибка: Установите SUPABASE_URL')
      return
    }
    
    if (!SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY.includes('your-service-key')) {
      console.error('❌ Ошибка: Установите SUPABASE_SERVICE_KEY')
      return
    }

    console.log('✅ Переменные окружения настроены')
    console.log('📧 Для полной настройки email выполните следующие шаги:')
    console.log('')
    console.log('1. Перейдите в Supabase Dashboard')
    console.log('2. Откройте Authentication → Settings')
    console.log('3. В разделе "SMTP Settings" настройте:')
    console.log('   - SMTP Host: smtp.gmail.com')
    console.log('   - SMTP Port: 587')
    console.log('   - SMTP User: ваш-email@gmail.com')
    console.log('   - SMTP Pass: ваш-пароль-приложения')
    console.log('')
    console.log('4. В разделе "Redirect URLs" добавьте:')
    console.log('   - http://localhost:3000/auth/reset-password')
    console.log('   - https://ваш-домен.com/auth/reset-password')
    console.log('')
    console.log('5. В разделе "Email Templates" настройте шаблоны')
    console.log('')
    console.log('📖 Подробная инструкция в файле EMAIL_SETUP.md')
    
  } catch (error) {
    console.error('❌ Ошибка при настройке:', error)
  }
}

// Функция для создания .env файла
function createEnvFile() {
  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}

# Email Configuration (опционально)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
`

  console.log('📝 Создайте файл .env.local со следующим содержимым:')
  console.log('')
  console.log(envContent)
  console.log('')
  console.log('⚠️  Замените "your-anon-key" на ваш анонимный ключ из Supabase')
}

// Функция для проверки настроек
function checkSetup() {
  console.log('🔍 Проверка настроек...')
  console.log('')
  console.log('✅ Демо-страница сброса пароля: /auth/demo-reset')
  console.log('✅ Реальная страница сброса пароля: /auth/reset-password')
  console.log('✅ Улучшенная обработка ошибок в /auth')
  console.log('')
  console.log('🎯 Для тестирования:')
  console.log('1. Запустите приложение: npm run dev')
  console.log('2. Перейдите на: http://localhost:3000/auth/demo-reset')
  console.log('3. Протестируйте демо-сброс пароля')
  console.log('')
  console.log('📧 Для реального сброса пароля настройте SMTP в Supabase')
}

// Запуск скрипта
if (require.main === module) {
  setupSupabase()
  createEnvFile()
  checkSetup()
}

module.exports = { setupSupabase, createEnvFile, checkSetup } 
// ВАЖНО: Этот скрипт требует API ключ Supabase с правами администратора

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'your-service-key'

async function setupSupabase() {
  console.log('🔧 Настройка Supabase...')
  
  try {
    // Проверяем наличие необходимых переменных
    if (!SUPABASE_URL || SUPABASE_URL.includes('your-project')) {
      console.error('❌ Ошибка: Установите SUPABASE_URL')
      return
    }
    
    if (!SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY.includes('your-service-key')) {
      console.error('❌ Ошибка: Установите SUPABASE_SERVICE_KEY')
      return
    }

    console.log('✅ Переменные окружения настроены')
    console.log('📧 Для полной настройки email выполните следующие шаги:')
    console.log('')
    console.log('1. Перейдите в Supabase Dashboard')
    console.log('2. Откройте Authentication → Settings')
    console.log('3. В разделе "SMTP Settings" настройте:')
    console.log('   - SMTP Host: smtp.gmail.com')
    console.log('   - SMTP Port: 587')
    console.log('   - SMTP User: ваш-email@gmail.com')
    console.log('   - SMTP Pass: ваш-пароль-приложения')
    console.log('')
    console.log('4. В разделе "Redirect URLs" добавьте:')
    console.log('   - http://localhost:3000/auth/reset-password')
    console.log('   - https://ваш-домен.com/auth/reset-password')
    console.log('')
    console.log('5. В разделе "Email Templates" настройте шаблоны')
    console.log('')
    console.log('📖 Подробная инструкция в файле EMAIL_SETUP.md')
    
  } catch (error) {
    console.error('❌ Ошибка при настройке:', error)
  }
}

// Функция для создания .env файла
function createEnvFile() {
  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}

# Email Configuration (опционально)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
`

  console.log('📝 Создайте файл .env.local со следующим содержимым:')
  console.log('')
  console.log(envContent)
  console.log('')
  console.log('⚠️  Замените "your-anon-key" на ваш анонимный ключ из Supabase')
}

// Функция для проверки настроек
function checkSetup() {
  console.log('🔍 Проверка настроек...')
  console.log('')
  console.log('✅ Демо-страница сброса пароля: /auth/demo-reset')
  console.log('✅ Реальная страница сброса пароля: /auth/reset-password')
  console.log('✅ Улучшенная обработка ошибок в /auth')
  console.log('')
  console.log('🎯 Для тестирования:')
  console.log('1. Запустите приложение: npm run dev')
  console.log('2. Перейдите на: http://localhost:3000/auth/demo-reset')
  console.log('3. Протестируйте демо-сброс пароля')
  console.log('')
  console.log('📧 Для реального сброса пароля настройте SMTP в Supabase')
}

// Запуск скрипта
if (require.main === module) {
  setupSupabase()
  createEnvFile()
  checkSetup()
}

module.exports = { setupSupabase, createEnvFile, checkSetup } 
 