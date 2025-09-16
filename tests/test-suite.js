/**
 * Комплексная система тестирования для Хвостик Alert v1.1.5
 * Проверяет весь функционал сайта на работоспособность
 */

class TestSuite {
  constructor() {
    this.tests = []
    this.results = []
    this.baseUrl = 'http://localhost:3000'
  }

  // Добавить тест в очередь
  addTest(name, testFunction, category = 'general') {
    this.tests.push({
      name,
      testFunction,
      category,
      status: 'pending'
    })
  }

  // Запустить все тесты
  async runAllTests() {
    console.log('🚀 Запуск комплексного тестирования Хвостик Alert v1.1.5')
    console.log('=' * 60)
    
    for (const test of this.tests) {
      try {
        console.log(`\n🧪 Тест: ${test.name}`)
        console.log(`📂 Категория: ${test.category}`)
        
        const startTime = Date.now()
        await test.testFunction()
        const endTime = Date.now()
        
        test.status = 'passed'
        test.duration = endTime - startTime
        
        console.log(`✅ ПРОЙДЕН (${test.duration}ms)`)
        
      } catch (error) {
        test.status = 'failed'
        test.error = error.message
        
        console.log(`❌ ПРОВАЛЕН: ${error.message}`)
      }
      
      this.results.push(test)
    }
    
    this.printSummary()
  }

  // Вывести сводку результатов
  printSummary() {
    console.log('\n' + '=' * 60)
    console.log('📊 СВОДКА ТЕСТИРОВАНИЯ')
    console.log('=' * 60)
    
    const passed = this.results.filter(t => t.status === 'passed').length
    const failed = this.results.filter(t => t.status === 'failed').length
    const total = this.results.length
    
    console.log(`✅ Пройдено: ${passed}`)
    console.log(`❌ Провалено: ${failed}`)
    console.log(`📈 Общий результат: ${Math.round((passed / total) * 100)}%`)
    
    if (failed > 0) {
      console.log('\n❌ ПРОВАЛЕННЫЕ ТЕСТЫ:')
      this.results
        .filter(t => t.status === 'failed')
        .forEach(test => {
          console.log(`  • ${test.name}: ${test.error}`)
        })
    }
    
    console.log('\n🎯 РЕКОМЕНДАЦИИ:')
    if (failed === 0) {
      console.log('  🎉 Все тесты пройдены! Сайт готов к продакшену.')
    } else {
      console.log('  🔧 Исправьте проваленные тесты перед деплоем.')
      console.log('  📝 Проверьте логи сервера для детальной диагностики.')
    }
  }

  // Вспомогательные методы для тестирования
  async fetchPage(url) {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response
  }

  async checkElementExists(selector) {
    const element = document.querySelector(selector)
    if (!element) {
      throw new Error(`Элемент не найден: ${selector}`)
    }
    return element
  }

  async checkTextContent(selector, expectedText) {
    const element = await this.checkElementExists(selector)
    if (!element.textContent.includes(expectedText)) {
      throw new Error(`Ожидался текст "${expectedText}", получен: "${element.textContent}"`)
    }
  }
}

// Создаем экземпляр тестового набора
const testSuite = new TestSuite()

// ============================================================================
// ТЕСТЫ АУТЕНТИФИКАЦИИ
// ============================================================================

testSuite.addTest('Главная страница загружается', async () => {
  const response = await testSuite.fetchPage(testSuite.baseUrl)
  const html = await response.text()
  
  if (!html.includes('Хвостик Alert')) {
    throw new Error('Главная страница не содержит заголовок "Хвостик Alert"')
  }
}, 'authentication')

testSuite.addTest('Страница входа доступна', async () => {
  const response = await testSuite.fetchPage(`${testSuite.baseUrl}/login`)
  if (!response.ok) {
    throw new Error('Страница входа недоступна')
  }
}, 'authentication')

testSuite.addTest('Страница регистрации доступна', async () => {
  const response = await testSuite.fetchPage(`${testSuite.baseUrl}/register`)
  if (!response.ok) {
    throw new Error('Страница регистрации недоступна')
  }
}, 'authentication')

testSuite.addTest('Страница восстановления пароля доступна', async () => {
  const response = await testSuite.fetchPage(`${testSuite.baseUrl}/forgot-password`)
  if (!response.ok) {
    throw new Error('Страница восстановления пароля недоступна')
  }
}, 'authentication')

// ============================================================================
// ТЕСТЫ ОСНОВНОГО ФУНКЦИОНАЛА
// ============================================================================

testSuite.addTest('Страница поиска загружается', async () => {
  const response = await testSuite.fetchPage(`${testSuite.baseUrl}/search`)
  const html = await response.text()
  
  if (!html.includes('Карта объявлений')) {
    throw new Error('Страница поиска не содержит заголовок "Карта объявлений"')
  }
}, 'core')

testSuite.addTest('Страница добавления объявления доступна', async () => {
  const response = await testSuite.fetchPage(`${testSuite.baseUrl}/add`)
  if (!response.ok) {
    throw new Error('Страница добавления объявления недоступна')
  }
}, 'core')

testSuite.addTest('Личный кабинет доступен', async () => {
  const response = await testSuite.fetchPage(`${testSuite.baseUrl}/cabinet`)
  if (!response.ok) {
    throw new Error('Личный кабинет недоступен')
  }
}, 'core')

// ============================================================================
// ТЕСТЫ API
// ============================================================================

testSuite.addTest('API статистики базы данных работает', async () => {
  const response = await testSuite.fetchPage(`${testSuite.baseUrl}/api/admin/database-stats`)
  const data = await response.json()
  
  if (!data || typeof data.totalUsers !== 'number') {
    throw new Error('API статистики не возвращает корректные данные')
  }
}, 'api')

testSuite.addTest('API таблиц базы данных работает', async () => {
  const response = await testSuite.fetchPage(`${testSuite.baseUrl}/api/admin/database-tables`)
  const data = await response.json()
  
  if (!data || !Array.isArray(data.pets)) {
    throw new Error('API таблиц не возвращает корректные данные')
  }
}, 'api')

testSuite.addTest('API геокодирования работает', async () => {
  // Тестируем с известным адресом
  const testAddress = 'Анапа'
  const response = await fetch(`${testSuite.baseUrl}/api/geocode?address=${encodeURIComponent(testAddress)}`)
  
  if (!response.ok) {
    throw new Error('API геокодирования недоступен')
  }
}, 'api')

// ============================================================================
// ТЕСТЫ АДМИН ПАНЕЛИ
// ============================================================================

testSuite.addTest('Админ панель доступна', async () => {
  const response = await testSuite.fetchPage(`${testSuite.baseUrl}/admin`)
  if (!response.ok) {
    throw new Error('Админ панель недоступна')
  }
}, 'admin')

testSuite.addTest('Админ панель содержит все вкладки', async () => {
  const response = await testSuite.fetchPage(`${testSuite.baseUrl}/admin`)
  const html = await response.text()
  
  const requiredTabs = ['Настройки фона', 'Пользователи', 'Статистика БД', 'Таблицы БД']
  
  for (const tab of requiredTabs) {
    if (!html.includes(tab)) {
      throw new Error(`Админ панель не содержит вкладку: ${tab}`)
    }
  }
}, 'admin')

// ============================================================================
// ТЕСТЫ ГЕОКОДИРОВАНИЯ
// ============================================================================

testSuite.addTest('Геокодирование Гостагаевской работает', async () => {
  const testAddress = 'Гостагаевская'
  const response = await fetch(`${testSuite.baseUrl}/api/geocode?address=${encodeURIComponent(testAddress)}`)
  
  if (!response.ok) {
    throw new Error('Геокодирование Гостагаевской не работает')
  }
  
  const data = await response.json()
  if (!data.latitude || !data.longitude) {
    throw new Error('Геокодирование не возвращает координаты')
  }
  
  // Проверяем правильные координаты Гостагаевской
  const expectedLat = 45.02063
  const expectedLng = 37.50175
  const tolerance = 0.01
  
  if (Math.abs(data.latitude - expectedLat) > tolerance || 
      Math.abs(data.longitude - expectedLng) > tolerance) {
    throw new Error(`Неправильные координаты Гостагаевской. Ожидались: ${expectedLat}, ${expectedLng}, получены: ${data.latitude}, ${data.longitude}`)
  }
}, 'geocoding')

testSuite.addTest('Геокодирование Новороссийска работает', async () => {
  const testAddress = 'Новороссийск'
  const response = await fetch(`${testSuite.baseUrl}/api/geocode?address=${encodeURIComponent(testAddress)}`)
  
  if (!response.ok) {
    throw new Error('Геокодирование Новороссийска не работает')
  }
  
  const data = await response.json()
  if (!data.latitude || !data.longitude) {
    throw new Error('Геокодирование Новороссийска не возвращает координаты')
  }
}, 'geocoding')

testSuite.addTest('Геокодирование Анапы работает', async () => {
  const testAddress = 'Анапа'
  const response = await fetch(`${testSuite.baseUrl}/api/geocode?address=${encodeURIComponent(testAddress)}`)
  
  if (!response.ok) {
    throw new Error('Геокодирование Анапы не работает')
  }
  
  const data = await response.json()
  if (!data.latitude || !data.longitude) {
    throw new Error('Геокодирование Анапы не возвращает координаты')
  }
}, 'geocoding')

// ============================================================================
// ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ
// ============================================================================

testSuite.addTest('Главная страница загружается быстро', async () => {
  const startTime = Date.now()
  await testSuite.fetchPage(testSuite.baseUrl)
  const loadTime = Date.now() - startTime
  
  if (loadTime > 3000) {
    throw new Error(`Главная страница загружается слишком медленно: ${loadTime}ms`)
  }
}, 'performance')

testSuite.addTest('Страница поиска загружается быстро', async () => {
  const startTime = Date.now()
  await testSuite.fetchPage(`${testSuite.baseUrl}/search`)
  const loadTime = Date.now() - startTime
  
  if (loadTime > 5000) {
    throw new Error(`Страница поиска загружается слишком медленно: ${loadTime}ms`)
  }
}, 'performance')

// ============================================================================
// ТЕСТЫ БЕЗОПАСНОСТИ
// ============================================================================

testSuite.addTest('Админ панель защищена от неавторизованного доступа', async () => {
  // Попытка доступа без авторизации должна перенаправлять на страницу входа
  const response = await fetch(`${testSuite.baseUrl}/admin`, {
    redirect: 'manual'
  })
  
  if (response.status !== 302 && response.status !== 401) {
    throw new Error('Админ панель не защищена от неавторизованного доступа')
  }
}, 'security')

testSuite.addTest('API endpoints защищены', async () => {
  const protectedEndpoints = [
    '/api/admin/database-stats',
    '/api/admin/database-tables'
  ]
  
  for (const endpoint of protectedEndpoints) {
    const response = await fetch(`${testSuite.baseUrl}${endpoint}`, {
      redirect: 'manual'
    })
    
    if (response.status !== 401 && response.status !== 403) {
      throw new Error(`API endpoint ${endpoint} не защищен`)
    }
  }
}, 'security')

// ============================================================================
// ТЕСТЫ АДАПТИВНОСТИ
// ============================================================================

testSuite.addTest('Сайт содержит мета-теги для мобильных устройств', async () => {
  const response = await testSuite.fetchPage(testSuite.baseUrl)
  const html = await response.text()
  
  if (!html.includes('viewport')) {
    throw new Error('Сайт не содержит мета-тег viewport для мобильных устройств')
  }
}, 'responsive')

// ============================================================================
// ЗАПУСК ТЕСТОВ
// ============================================================================

// Экспортируем для использования в браузере или Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testSuite
} else if (typeof window !== 'undefined') {
  window.TestSuite = testSuite
}

// Автозапуск в браузере
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  console.log('🧪 Система тестирования загружена. Запустите testSuite.runAllTests() для начала тестирования.')
}




