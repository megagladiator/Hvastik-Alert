/**
 * Тесты производительности для Хвостик Alert
 * Проверяют время загрузки страниц и API endpoints
 */

describe('Performance Tests', () => {
  const baseUrl = 'http://localhost:3000'
  const performanceThresholds = {
    pageLoad: 3000, // 3 секунды
    apiResponse: 2000, // 2 секунды
    imageLoad: 5000, // 5 секунд
    mapLoad: 8000 // 8 секунд
  }

  describe('Page Load Performance', () => {
    it('loads main page within threshold', async () => {
      const startTime = performance.now()
      
      const response = await fetch(baseUrl)
      const html = await response.text()
      
      const endTime = performance.now()
      const loadTime = endTime - startTime

      expect(response.ok).toBe(true)
      expect(loadTime).toBeLessThan(performanceThresholds.pageLoad)
      expect(html).toContain('Хвостик Alert')
    })

    it('loads search page within threshold', async () => {
      const startTime = performance.now()
      
      const response = await fetch(`${baseUrl}/search`)
      const html = await response.text()
      
      const endTime = performance.now()
      const loadTime = endTime - startTime

      expect(response.ok).toBe(true)
      expect(loadTime).toBeLessThan(performanceThresholds.pageLoad)
      expect(html).toContain('Карта объявлений')
    })

    it('loads add page within threshold', async () => {
      const startTime = performance.now()
      
      const response = await fetch(`${baseUrl}/add`)
      const html = await response.text()
      
      const endTime = performance.now()
      const loadTime = endTime - startTime

      expect(response.ok).toBe(true)
      expect(loadTime).toBeLessThan(performanceThresholds.pageLoad)
    })

    it('loads admin panel within threshold', async () => {
      const startTime = performance.now()
      
      const response = await fetch(`${baseUrl}/admin`)
      
      const endTime = performance.now()
      const loadTime = endTime - startTime

      // Admin panel might redirect, so we check for either success or redirect
      expect([200, 302, 401]).toContain(response.status)
      expect(loadTime).toBeLessThan(performanceThresholds.pageLoad)
    })
  })

  describe('API Performance', () => {
    it('geocoding API responds within threshold', async () => {
      const startTime = performance.now()
      
      const response = await fetch(`${baseUrl}/api/geocode?address=Анапа`)
      const data = await response.json()
      
      const endTime = performance.now()
      const responseTime = endTime - startTime

      expect(response.ok).toBe(true)
      expect(responseTime).toBeLessThan(performanceThresholds.apiResponse)
      expect(data.success).toBe(true)
    })

    it('pets API responds within threshold', async () => {
      const startTime = performance.now()
      
      const response = await fetch(`${baseUrl}/api/pets`)
      const data = await response.json()
      
      const endTime = performance.now()
      const responseTime = endTime - startTime

      expect(response.ok).toBe(true)
      expect(responseTime).toBeLessThan(performanceThresholds.apiResponse)
      expect(Array.isArray(data)).toBe(true)
    })

    it('database stats API responds within threshold', async () => {
      const startTime = performance.now()
      
      const response = await fetch(`${baseUrl}/api/admin/database-stats`)
      
      const endTime = performance.now()
      const responseTime = endTime - startTime

      // API might return 401 if not authenticated, but should respond quickly
      expect([200, 401, 403]).toContain(response.status)
      expect(responseTime).toBeLessThan(performanceThresholds.apiResponse)
    })
  })

  describe('Concurrent Load Performance', () => {
    it('handles multiple concurrent requests', async () => {
      const requests = [
        fetch(`${baseUrl}/api/geocode?address=Анапа`),
        fetch(`${baseUrl}/api/geocode?address=Новороссийск`),
        fetch(`${baseUrl}/api/geocode?address=Гостагаевская`),
        fetch(`${baseUrl}/api/pets`),
        fetch(`${baseUrl}/api/pets?type=lost`)
      ]

      const startTime = performance.now()
      const responses = await Promise.all(requests)
      const endTime = performance.now()
      const totalTime = endTime - startTime

      // All requests should complete
      responses.forEach(response => {
        expect([200, 401, 403]).toContain(response.status)
      })

      // Total time should be reasonable (not much more than single request)
      expect(totalTime).toBeLessThan(performanceThresholds.apiResponse * 2)
    })

    it('handles rapid sequential requests', async () => {
      const startTime = performance.now()
      
      for (let i = 0; i < 5; i++) {
        const response = await fetch(`${baseUrl}/api/geocode?address=Анапа`)
        expect([200, 401, 403]).toContain(response.status)
      }
      
      const endTime = performance.now()
      const totalTime = endTime - startTime

      // Should handle rapid requests without significant degradation
      expect(totalTime).toBeLessThan(performanceThresholds.apiResponse * 3)
    })
  })

  describe('Memory Usage', () => {
    it('does not leak memory during multiple requests', async () => {
      const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0

      // Make multiple requests
      for (let i = 0; i < 10; i++) {
        const response = await fetch(`${baseUrl}/api/geocode?address=Анапа`)
        await response.json()
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }

      const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be reasonable (less than 10MB)
      if (performance.memory) {
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
      }
    })
  })

  describe('Network Performance', () => {
    it('handles slow network conditions', async () => {
      // Simulate slow network by adding delay
      const originalFetch = global.fetch
      global.fetch = jest.fn().mockImplementation((url, options) => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(originalFetch(url, options))
          }, 1000) // 1 second delay
        })
      })

      const startTime = performance.now()
      const response = await fetch(`${baseUrl}/api/geocode?address=Анапа`)
      const endTime = performance.now()
      const responseTime = endTime - startTime

      expect(response.ok).toBe(true)
      expect(responseTime).toBeGreaterThan(1000) // Should include delay
      expect(responseTime).toBeLessThan(5000) // But not too much more

      // Restore original fetch
      global.fetch = originalFetch
    })
  })

  describe('Error Handling Performance', () => {
    it('handles errors quickly', async () => {
      const startTime = performance.now()
      
      // Request non-existent endpoint
      const response = await fetch(`${baseUrl}/api/nonexistent`)
      
      const endTime = performance.now()
      const responseTime = endTime - startTime

      expect(response.status).toBe(404)
      expect(responseTime).toBeLessThan(1000) // Errors should be fast
    })

    it('handles malformed requests quickly', async () => {
      const startTime = performance.now()
      
      // Request with invalid parameters
      const response = await fetch(`${baseUrl}/api/geocode`)
      
      const endTime = performance.now()
      const responseTime = endTime - startTime

      expect(response.status).toBe(400)
      expect(responseTime).toBeLessThan(1000) // Validation errors should be fast
    })
  })
})

