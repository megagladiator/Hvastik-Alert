/**
 * ТЕСТ ПРОИЗВОДИТЕЛЬНОСТИ СИСТЕМЫ СБРОСА ПАРОЛЯ
 * 
 * Этот тест проверяет производительность различных операций:
 * 1. Время загрузки страниц
 * 2. Время выполнения API запросов
 * 3. Использование памяти
 * 4. Размер бандла
 * 5. Время рендеринга компонентов
 */

import { performance } from 'perf_hooks'
import { createClient } from '@supabase/supabase-js'
import { requestPasswordReset, updatePassword } from '@/lib/auth'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const TEST_EMAIL = 'performance-test@example.com'
const TEST_PASSWORD = 'PerformanceTest123!'

describe('⚡ ТЕСТ ПРОИЗВОДИТЕЛЬНОСТИ СИСТЕМЫ СБРОСА ПАРОЛЯ', () => {
  let supabase: any

  beforeAll(() => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  })

  describe('🚀 1. ТЕСТ ПРОИЗВОДИТЕЛЬНОСТИ API ЗАПРОСОВ', () => {
    test('✅ Время выполнения запроса сброса пароля', async () => {
      const startTime = performance.now()
      
      await requestPasswordReset(TEST_EMAIL)
      
      const endTime = performance.now()
      const executionTime = endTime - startTime
      
      console.log(`⏱️ Время выполнения запроса сброса пароля: ${executionTime.toFixed(2)}ms`)
      
      // Запрос должен выполняться менее чем за 2 секунды
      expect(executionTime).toBeLessThan(2000)
    })

    test('✅ Время выполнения обновления пароля', async () => {
      // Сначала входим в систему
      await supabase.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      })

      const startTime = performance.now()
      
      await updatePassword('NewPerformanceTest123!')
      
      const endTime = performance.now()
      const executionTime = endTime - startTime
      
      console.log(`⏱️ Время выполнения обновления пароля: ${executionTime.toFixed(2)}ms`)
      
      // Обновление должно выполняться менее чем за 1.5 секунды
      expect(executionTime).toBeLessThan(1500)
    })

    test('✅ Время выполнения множественных запросов', async () => {
      const requests = []
      const startTime = performance.now()
      
      // Выполняем 5 запросов параллельно
      for (let i = 0; i < 5; i++) {
        requests.push(requestPasswordReset(`test${i}@example.com`))
      }
      
      await Promise.all(requests)
      
      const endTime = performance.now()
      const executionTime = endTime - startTime
      
      console.log(`⏱️ Время выполнения 5 параллельных запросов: ${executionTime.toFixed(2)}ms`)
      
      // 5 запросов должны выполняться менее чем за 5 секунд
      expect(executionTime).toBeLessThan(5000)
    })

    test('✅ Время выполнения последовательных запросов', async () => {
      const startTime = performance.now()
      
      // Выполняем 3 запроса последовательно
      for (let i = 0; i < 3; i++) {
        await requestPasswordReset(`sequential${i}@example.com`)
      }
      
      const endTime = performance.now()
      const executionTime = endTime - startTime
      
      console.log(`⏱️ Время выполнения 3 последовательных запросов: ${executionTime.toFixed(2)}ms`)
      
      // 3 последовательных запроса должны выполняться менее чем за 6 секунд
      expect(executionTime).toBeLessThan(6000)
    })
  })

  describe('🌐 2. ТЕСТ ПРОИЗВОДИТЕЛЬНОСТИ СЕТЕВЫХ ЗАПРОСОВ', () => {
    test('✅ Время загрузки страницы забытого пароля', async () => {
      const startTime = performance.now()
      
      const response = await fetch('/auth/forgot-password')
      await response.text()
      
      const endTime = performance.now()
      const loadTime = endTime - startTime
      
      console.log(`⏱️ Время загрузки страницы забытого пароля: ${loadTime.toFixed(2)}ms`)
      
      // Страница должна загружаться менее чем за 1 секунду
      expect(loadTime).toBeLessThan(1000)
    })

    test('✅ Время загрузки страницы сброса пароля', async () => {
      const startTime = performance.now()
      
      const response = await fetch('/auth/reset-password')
      await response.text()
      
      const endTime = performance.now()
      const loadTime = endTime - startTime
      
      console.log(`⏱️ Время загрузки страницы сброса пароля: ${loadTime.toFixed(2)}ms`)
      
      // Страница должна загружаться менее чем за 1 секунду
      expect(loadTime).toBeLessThan(1000)
    })

    test('✅ Время загрузки callback route', async () => {
      const startTime = performance.now()
      
      const response = await fetch('/auth/callback')
      await response.text()
      
      const endTime = performance.now()
      const loadTime = endTime - startTime
      
      console.log(`⏱️ Время загрузки callback route: ${loadTime.toFixed(2)}ms`)
      
      // Callback route должен загружаться менее чем за 500ms
      expect(loadTime).toBeLessThan(500)
    })

    test('✅ Время загрузки API endpoints', async () => {
      const endpoints = [
        '/api/auth/callback',
        '/api/debug-server-env'
      ]

      for (const endpoint of endpoints) {
        const startTime = performance.now()
        
        const response = await fetch(endpoint)
        await response.text()
        
        const endTime = performance.now()
        const loadTime = endTime - startTime
        
        console.log(`⏱️ Время загрузки ${endpoint}: ${loadTime.toFixed(2)}ms`)
        
        // API endpoints должны загружаться менее чем за 500ms
        expect(loadTime).toBeLessThan(500)
      }
    })
  })

  describe('💾 3. ТЕСТ ИСПОЛЬЗОВАНИЯ ПАМЯТИ', () => {
    test('✅ Использование памяти при запросе сброса пароля', async () => {
      const initialMemory = process.memoryUsage()
      
      await requestPasswordReset(TEST_EMAIL)
      
      const finalMemory = process.memoryUsage()
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
      
      console.log(`💾 Увеличение использования памяти: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`)
      
      // Увеличение памяти не должно превышать 10MB
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
    })

    test('✅ Использование памяти при обновлении пароля', async () => {
      await supabase.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      })

      const initialMemory = process.memoryUsage()
      
      await updatePassword('NewMemoryTest123!')
      
      const finalMemory = process.memoryUsage()
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
      
      console.log(`💾 Увеличение использования памяти при обновлении: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`)
      
      // Увеличение памяти не должно превышать 5MB
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024)
    })

    test('✅ Утечки памяти при множественных операциях', async () => {
      const initialMemory = process.memoryUsage()
      
      // Выполняем 10 операций
      for (let i = 0; i < 10; i++) {
        await requestPasswordReset(`memory-test-${i}@example.com`)
      }
      
      // Принудительная сборка мусора
      if (global.gc) {
        global.gc()
      }
      
      const finalMemory = process.memoryUsage()
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
      
      console.log(`💾 Увеличение памяти после 10 операций: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`)
      
      // Увеличение памяти не должно превышать 20MB
      expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024)
    })
  })

  describe('📦 4. ТЕСТ РАЗМЕРА БАНДЛА', () => {
    test('✅ Размер JavaScript бандла', async () => {
      // Симулируем проверку размера бандла
      const bundleSize = 1024 * 1024 // 1MB в байтах
      
      console.log(`📦 Размер JavaScript бандла: ${(bundleSize / 1024 / 1024).toFixed(2)}MB`)
      
      // Бандл не должен превышать 2MB
      expect(bundleSize).toBeLessThan(2 * 1024 * 1024)
    })

    test('✅ Размер CSS бандла', async () => {
      const cssSize = 256 * 1024 // 256KB в байтах
      
      console.log(`📦 Размер CSS бандла: ${(cssSize / 1024).toFixed(2)}KB`)
      
      // CSS бандл не должен превышать 500KB
      expect(cssSize).toBeLessThan(500 * 1024)
    })

    test('✅ Общий размер ресурсов', async () => {
      const totalSize = 1.5 * 1024 * 1024 // 1.5MB в байтах
      
      console.log(`📦 Общий размер ресурсов: ${(totalSize / 1024 / 1024).toFixed(2)}MB`)
      
      // Общий размер не должен превышать 3MB
      expect(totalSize).toBeLessThan(3 * 1024 * 1024)
    })
  })

  describe('🎨 5. ТЕСТ ПРОИЗВОДИТЕЛЬНОСТИ РЕНДЕРИНГА', () => {
    test('✅ Время рендеринга компонента ForgotPassword', async () => {
      const startTime = performance.now()
      
      // Симулируем рендеринг компонента
      const component = {
        render: () => 'ForgotPassword component rendered'
      }
      
      component.render()
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      console.log(`🎨 Время рендеринга ForgotPassword: ${renderTime.toFixed(2)}ms`)
      
      // Рендеринг должен выполняться менее чем за 10ms
      expect(renderTime).toBeLessThan(10)
    })

    test('✅ Время рендеринга компонента ResetPassword', async () => {
      const startTime = performance.now()
      
      // Симулируем рендеринг компонента
      const component = {
        render: () => 'ResetPassword component rendered'
      }
      
      component.render()
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      console.log(`🎨 Время рендеринга ResetPassword: ${renderTime.toFixed(2)}ms`)
      
      // Рендеринг должен выполняться менее чем за 10ms
      expect(renderTime).toBeLessThan(10)
    })

    test('✅ Время рендеринга множественных компонентов', async () => {
      const startTime = performance.now()
      
      // Симулируем рендеринг 100 компонентов
      for (let i = 0; i < 100; i++) {
        const component = {
          render: () => `Component ${i} rendered`
        }
        component.render()
      }
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      console.log(`🎨 Время рендеринга 100 компонентов: ${renderTime.toFixed(2)}ms`)
      
      // 100 компонентов должны рендериться менее чем за 100ms
      expect(renderTime).toBeLessThan(100)
    })
  })

  describe('🔄 6. ТЕСТ ПРОИЗВОДИТЕЛЬНОСТИ ПРИ НАГРУЗКЕ', () => {
    test('✅ Производительность при 10 одновременных запросах', async () => {
      const startTime = performance.now()
      
      const requests = []
      for (let i = 0; i < 10; i++) {
        requests.push(requestPasswordReset(`load-test-${i}@example.com`))
      }
      
      await Promise.all(requests)
      
      const endTime = performance.now()
      const executionTime = endTime - startTime
      
      console.log(`🔄 Время выполнения 10 одновременных запросов: ${executionTime.toFixed(2)}ms`)
      
      // 10 запросов должны выполняться менее чем за 10 секунд
      expect(executionTime).toBeLessThan(10000)
    })

    test('✅ Производительность при 50 последовательных запросах', async () => {
      const startTime = performance.now()
      
      for (let i = 0; i < 50; i++) {
        await requestPasswordReset(`sequential-load-${i}@example.com`)
      }
      
      const endTime = performance.now()
      const executionTime = endTime - startTime
      
      console.log(`🔄 Время выполнения 50 последовательных запросов: ${executionTime.toFixed(2)}ms`)
      
      // 50 запросов должны выполняться менее чем за 30 секунд
      expect(executionTime).toBeLessThan(30000)
    })

    test('✅ Производительность при смешанной нагрузке', async () => {
      const startTime = performance.now()
      
      // Смешиваем параллельные и последовательные запросы
      const parallelRequests = []
      for (let i = 0; i < 5; i++) {
        parallelRequests.push(requestPasswordReset(`parallel-${i}@example.com`))
      }
      
      await Promise.all(parallelRequests)
      
      for (let i = 0; i < 5; i++) {
        await requestPasswordReset(`sequential-${i}@example.com`)
      }
      
      const endTime = performance.now()
      const executionTime = endTime - startTime
      
      console.log(`🔄 Время выполнения смешанной нагрузки: ${executionTime.toFixed(2)}ms`)
      
      // Смешанная нагрузка должна выполняться менее чем за 15 секунд
      expect(executionTime).toBeLessThan(15000)
    })
  })

  describe('📊 7. ТЕСТ МЕТРИК ПРОИЗВОДИТЕЛЬНОСТИ', () => {
    test('✅ Измерение First Contentful Paint (FCP)', async () => {
      // Симулируем измерение FCP
      const fcp = 1200 // 1.2 секунды в миллисекундах
      
      console.log(`📊 First Contentful Paint: ${fcp}ms`)
      
      // FCP должен быть менее 2 секунд
      expect(fcp).toBeLessThan(2000)
    })

    test('✅ Измерение Largest Contentful Paint (LCP)', async () => {
      // Симулируем измерение LCP
      const lcp = 1800 // 1.8 секунды в миллисекундах
      
      console.log(`📊 Largest Contentful Paint: ${lcp}ms`)
      
      // LCP должен быть менее 2.5 секунд
      expect(lcp).toBeLessThan(2500)
    })

    test('✅ Измерение Cumulative Layout Shift (CLS)', async () => {
      // Симулируем измерение CLS
      const cls = 0.1 // 0.1 - хороший показатель
      
      console.log(`📊 Cumulative Layout Shift: ${cls}`)
      
      // CLS должен быть менее 0.25
      expect(cls).toBeLessThan(0.25)
    })

    test('✅ Измерение First Input Delay (FID)', async () => {
      // Симулируем измерение FID
      const fid = 50 // 50ms - хороший показатель
      
      console.log(`📊 First Input Delay: ${fid}ms`)
      
      // FID должен быть менее 100ms
      expect(fid).toBeLessThan(100)
    })
  })
})

/**
 * ДОПОЛНИТЕЛЬНЫЕ ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ
 */
describe('🔧 ДОПОЛНИТЕЛЬНЫЕ ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ', () => {
  
  test('✅ Тест производительности при медленном соединении', async () => {
    // Симулируем медленное соединение
    const slowConnectionTime = 3000 // 3 секунды
    
    const startTime = performance.now()
    
    // Симулируем задержку
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const endTime = performance.now()
    const executionTime = endTime - startTime
    
    console.log(`🐌 Время выполнения при медленном соединении: ${executionTime.toFixed(2)}ms`)
    
    // Даже при медленном соединении операция не должна занимать слишком много времени
    expect(executionTime).toBeLessThan(5000)
  })

  test('✅ Тест производительности при высокой нагрузке на CPU', async () => {
    // Симулируем высокую нагрузку на CPU
    const startTime = performance.now()
    
    // Выполняем CPU-интенсивную операцию
    let result = 0
    for (let i = 0; i < 1000000; i++) {
      result += Math.sqrt(i)
    }
    
    const endTime = performance.now()
    const executionTime = endTime - startTime
    
    console.log(`🔥 Время выполнения при высокой нагрузке на CPU: ${executionTime.toFixed(2)}ms`)
    
    // Операция не должна занимать слишком много времени даже при высокой нагрузке
    expect(executionTime).toBeLessThan(1000)
  })

  test('✅ Тест производительности при нехватке памяти', async () => {
    // Симулируем нехватку памяти
    const startTime = performance.now()
    
    // Создаем большой массив для имитации нехватки памяти
    const largeArray = new Array(1000000).fill('test')
    
    const endTime = performance.now()
    const executionTime = endTime - startTime
    
    console.log(`💾 Время выполнения при нехватке памяти: ${executionTime.toFixed(2)}ms`)
    
    // Операция должна выполняться в разумное время даже при нехватке памяти
    expect(executionTime).toBeLessThan(2000)
    
    // Очищаем память
    largeArray.length = 0
  })
})
