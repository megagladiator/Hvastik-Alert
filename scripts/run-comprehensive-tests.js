#!/usr/bin/env node

/**
 * СКРИПТ ЗАПУСКА КОМПЛЕКСНЫХ ТЕСТОВ
 * 
 * Этот скрипт запускает все тесты системы сброса пароля:
 * 1. Unit тесты
 * 2. Integration тесты
 * 3. E2E тесты
 * 4. Performance тесты
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

// Функция для цветного вывода
function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Функция для выполнения команд
function runCommand(command, description) {
  colorLog(`\n🚀 ${description}`, 'cyan')
  colorLog(`Выполняем: ${command}`, 'blue')
  
  try {
    const startTime = Date.now()
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: process.cwd()
    })
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)
    
    colorLog(`✅ ${description} завершен за ${duration}с`, 'green')
    return { success: true, duration, output }
  } catch (error) {
    colorLog(`❌ Ошибка в ${description}:`, 'red')
    console.error(error.message)
    return { success: false, error: error.message }
  }
}

// Функция для проверки существования файлов
function checkTestFiles() {
  const testFiles = [
    '__tests__/integration/password-reset-comprehensive.test.ts',
    '__tests__/e2e/password-reset-e2e.test.ts',
    '__tests__/performance/password-reset-performance.test.ts'
  ]
  
  colorLog('\n📋 Проверяем наличие тестовых файлов...', 'yellow')
  
  const missingFiles = []
  testFiles.forEach(file => {
    if (fs.existsSync(file)) {
      colorLog(`✅ ${file}`, 'green')
    } else {
      colorLog(`❌ ${file} - НЕ НАЙДЕН`, 'red')
      missingFiles.push(file)
    }
  })
  
  if (missingFiles.length > 0) {
    colorLog(`\n⚠️  Найдено ${missingFiles.length} отсутствующих файлов`, 'yellow')
    return false
  }
  
  return true
}

// Функция для проверки зависимостей
function checkDependencies() {
  colorLog('\n📦 Проверяем зависимости...', 'yellow')
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const requiredDeps = [
    'jest',
    '@playwright/test',
    '@supabase/supabase-js'
  ]
  
  const missingDeps = []
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      colorLog(`✅ ${dep}`, 'green')
    } else {
      colorLog(`❌ ${dep} - НЕ УСТАНОВЛЕН`, 'red')
      missingDeps.push(dep)
    }
  })
  
  if (missingDeps.length > 0) {
    colorLog(`\n⚠️  Найдено ${missingDeps.length} отсутствующих зависимостей`, 'yellow')
    return false
  }
  
  return true
}

// Функция для генерации отчета
function generateReport(results) {
  const timestamp = new Date().toISOString()
  const reportPath = `test-reports/comprehensive-test-report-${timestamp.replace(/[:.]/g, '-')}.json`
  
  // Создаем директорию для отчетов
  if (!fs.existsSync('test-reports')) {
    fs.mkdirSync('test-reports', { recursive: true })
  }
  
  const report = {
    timestamp,
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    },
    results,
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    }
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  colorLog(`\n📊 Отчет сохранен: ${reportPath}`, 'cyan')
  
  return report
}

// Основная функция
async function runComprehensiveTests() {
  colorLog('🧪 КОМПЛЕКСНОЕ ТЕСТИРОВАНИЕ СИСТЕМЫ СБРОСА ПАРОЛЯ', 'bright')
  colorLog('=' * 60, 'cyan')
  
  const startTime = Date.now()
  const results = []
  
  // 1. Проверяем файлы и зависимости
  if (!checkTestFiles()) {
    colorLog('\n❌ Не все тестовые файлы найдены. Завершаем выполнение.', 'red')
    process.exit(1)
  }
  
  if (!checkDependencies()) {
    colorLog('\n❌ Не все зависимости установлены. Завершаем выполнение.', 'red')
    process.exit(1)
  }
  
  // 2. Запускаем Unit тесты
  const unitTestResult = runCommand(
    'npm test -- --testPathPattern="__tests__/simple" --verbose',
    'Unit тесты'
  )
  results.push({ name: 'Unit тесты', ...unitTestResult })
  
  // 3. Запускаем Integration тесты
  const integrationTestResult = runCommand(
    'npm test -- --testPathPattern="__tests__/integration" --verbose',
    'Integration тесты'
  )
  results.push({ name: 'Integration тесты', ...integrationTestResult })
  
  // 4. Запускаем Performance тесты
  const performanceTestResult = runCommand(
    'npm test -- --testPathPattern="__tests__/performance" --verbose',
    'Performance тесты'
  )
  results.push({ name: 'Performance тесты', ...performanceTestResult })
  
  // 5. Запускаем E2E тесты (если Playwright установлен)
  try {
    const e2eTestResult = runCommand(
      'npx playwright test __tests__/e2e/password-reset-e2e.test.ts',
      'E2E тесты'
    )
    results.push({ name: 'E2E тесты', ...e2eTestResult })
  } catch (error) {
    colorLog('⚠️  E2E тесты пропущены (Playwright не настроен)', 'yellow')
    results.push({ name: 'E2E тесты', success: false, error: 'Playwright не настроен' })
  }
  
  // 6. Запускаем API тесты
  const apiTestResult = runCommand(
    'npm test -- --testPathPattern="__tests__/api" --verbose',
    'API тесты'
  )
  results.push({ name: 'API тесты', ...apiTestResult })
  
  // 7. Генерируем отчет
  const endTime = Date.now()
  const totalDuration = ((endTime - startTime) / 1000).toFixed(2)
  
  const report = generateReport(results)
  
  // 8. Выводим итоговую статистику
  colorLog('\n📊 ИТОГОВАЯ СТАТИСТИКА', 'bright')
  colorLog('=' * 30, 'cyan')
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌'
    const duration = result.duration ? ` (${result.duration}с)` : ''
    const color = result.success ? 'green' : 'red'
    colorLog(`${status} ${result.name}${duration}`, color)
  })
  
  colorLog(`\n⏱️  Общее время выполнения: ${totalDuration}с`, 'cyan')
  colorLog(`📈 Успешно: ${report.summary.passed}/${report.summary.total}`, 'green')
  colorLog(`📉 Неудачно: ${report.summary.failed}/${report.summary.total}`, 'red')
  
  // 9. Определяем общий результат
  const allPassed = results.every(r => r.success)
  
  if (allPassed) {
    colorLog('\n🎉 ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО!', 'green')
    process.exit(0)
  } else {
    colorLog('\n💥 НЕКОТОРЫЕ ТЕСТЫ НЕ ПРОШЛИ!', 'red')
    process.exit(1)
  }
}

// Обработка ошибок
process.on('uncaughtException', (error) => {
  colorLog(`\n💥 Критическая ошибка: ${error.message}`, 'red')
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  colorLog(`\n💥 Необработанное отклонение: ${reason}`, 'red')
  process.exit(1)
})

// Запускаем тесты
if (require.main === module) {
  runComprehensiveTests().catch(error => {
    colorLog(`\n💥 Ошибка выполнения: ${error.message}`, 'red')
    process.exit(1)
  })
}

module.exports = { runComprehensiveTests }
