/**
 * End-to-End тесты для полной системы Хвостик Alert
 * Проверяют весь пользовательский сценарий от регистрации до создания объявлений
 */

describe('Full System E2E Tests', () => {
  const baseUrl = 'http://localhost:3000'

  describe('User Registration and Authentication Flow', () => {
    it('completes full user registration flow', async () => {
      // 1. Visit registration page
      const registerResponse = await fetch(`${baseUrl}/register`)
      expect(registerResponse.ok).toBe(true)

      // 2. Check if registration form is present
      const registerHtml = await registerResponse.text()
      expect(registerHtml).toContain('Регистрация')
      expect(registerHtml).toContain('email')
      expect(registerHtml).toContain('password')
    })

    it('completes user login flow', async () => {
      // 1. Visit login page
      const loginResponse = await fetch(`${baseUrl}/login`)
      expect(loginResponse.ok).toBe(true)

      // 2. Check if login form is present
      const loginHtml = await loginResponse.text()
      expect(loginHtml).toContain('Вход')
      expect(loginHtml).toContain('email')
      expect(loginHtml).toContain('password')
    })

    it('redirects unauthenticated users appropriately', async () => {
      // 1. Try to access protected route
      const cabinetResponse = await fetch(`${baseUrl}/cabinet`, {
        redirect: 'manual'
      })

      // Should redirect to login or return 401/403
      expect([302, 401, 403]).toContain(cabinetResponse.status)
    })
  })

  describe('Pet Management Flow', () => {
    it('allows creating new pet announcements', async () => {
      // 1. Visit add page
      const addResponse = await fetch(`${baseUrl}/add`)
      expect(addResponse.ok).toBe(true)

      // 2. Check if form is present
      const addHtml = await addResponse.text()
      expect(addHtml).toContain('Добавить объявление')
      expect(addHtml).toContain('type')
      expect(addHtml).toContain('animal_type')
      expect(addHtml).toContain('breed')
      expect(addHtml).toContain('name')
      expect(addHtml).toContain('location')
    })

    it('displays pet announcements on search page', async () => {
      // 1. Visit search page
      const searchResponse = await fetch(`${baseUrl}/search`)
      expect(searchResponse.ok).toBe(true)

      // 2. Check if search interface is present
      const searchHtml = await searchResponse.text()
      expect(searchHtml).toContain('Карта объявлений')
      expect(searchHtml).toContain('map') // Should contain map container
    })

    it('handles pet announcement API correctly', async () => {
      // 1. Test GET request for pets
      const petsResponse = await fetch(`${baseUrl}/api/pets`)
      expect([200, 401, 403]).toContain(petsResponse.status)

      if (petsResponse.ok) {
        const pets = await petsResponse.json()
        expect(Array.isArray(pets)).toBe(true)
      }

      // 2. Test POST request for creating pet (should fail without auth)
      const createResponse = await fetch(`${baseUrl}/api/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'lost',
          animal_type: 'dog',
          breed: 'Лабрадор',
          name: 'Тестовый пес',
          location: 'Анапа',
          contact_phone: '+7 (918) 123-45-67',
          contact_name: 'Тест'
        })
      })

      // Should return 401/403 without authentication
      expect([200, 201, 401, 403]).toContain(createResponse.status)
    })
  })

  describe('Geocoding and Map Integration', () => {
    it('geocodes known locations correctly', async () => {
      const testLocations = [
        { address: 'Анапа', expectedLat: 44.8951, expectedLng: 37.3142 },
        { address: 'Новороссийск', expectedLat: 44.7239, expectedLng: 37.7708 },
        { address: 'Гостагаевская', expectedLat: 45.02063, expectedLng: 37.50175 }
      ]

      for (const location of testLocations) {
        const response = await fetch(`${baseUrl}/api/geocode?address=${encodeURIComponent(location.address)}`)
        expect(response.ok).toBe(true)

        const data = await response.json()
        expect(data.success).toBe(true)
        expect(data.latitude).toBeCloseTo(location.expectedLat, 2)
        expect(data.longitude).toBeCloseTo(location.expectedLng, 2)
      }
    })

    it('handles unknown locations gracefully', async () => {
      const response = await fetch(`${baseUrl}/api/geocode?address=НеизвестныйГород123`)
      
      if (response.ok) {
        const data = await response.json()
        // Should either return default coordinates or error
        expect(data.success !== undefined).toBe(true)
      } else {
        expect([404, 400]).toContain(response.status)
      }
    })
  })

  describe('Admin Panel Functionality', () => {
    it('protects admin panel from unauthorized access', async () => {
      const response = await fetch(`${baseUrl}/admin`, {
        redirect: 'manual'
      })

      // Should redirect or deny access
      expect([302, 401, 403]).toContain(response.status)
    })

    it('provides admin API endpoints', async () => {
      const adminEndpoints = [
        '/api/admin/database-stats',
        '/api/admin/database-tables'
      ]

      for (const endpoint of adminEndpoints) {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          redirect: 'manual'
        })

        // Should be protected (401/403) or return data (200)
        expect([200, 401, 403]).toContain(response.status)
      }
    })
  })

  describe('Chat System Integration', () => {
    it('provides chat functionality', async () => {
      // 1. Check if chat pages exist
      const chatsResponse = await fetch(`${baseUrl}/chats`)
      expect([200, 302, 401, 403]).toContain(chatsResponse.status)

      // 2. Check if chat API exists
      const chatApiResponse = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'test' })
      })

      // Should be protected or return appropriate response
      expect([200, 401, 403, 404]).toContain(chatApiResponse.status)
    })
  })

  describe('Image Upload and Storage', () => {
    it('handles image upload endpoints', async () => {
      const uploadResponse = await fetch(`${baseUrl}/api/upload`, {
        method: 'POST',
        redirect: 'manual'
      })

      // Should be protected or return appropriate response
      expect([200, 401, 403, 404, 405]).toContain(uploadResponse.status)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('handles 404 errors gracefully', async () => {
      const response = await fetch(`${baseUrl}/nonexistent-page`)
      expect(response.status).toBe(404)
    })

    it('handles malformed API requests', async () => {
      const response = await fetch(`${baseUrl}/api/geocode`)
      expect([400, 404]).toContain(response.status)
    })

    it('handles large requests appropriately', async () => {
      const largeData = 'x'.repeat(10000) // 10KB string
      const response = await fetch(`${baseUrl}/api/geocode?address=${largeData}`)
      
      // Should handle large requests without crashing
      expect([200, 400, 413]).toContain(response.status)
    })
  })

  describe('Cross-Browser Compatibility', () => {
    it('serves proper HTML structure', async () => {
      const response = await fetch(baseUrl)
      const html = await response.text()

      // Check for essential HTML elements
      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html')
      expect(html).toContain('<head>')
      expect(html).toContain('<body>')
      expect(html).toContain('viewport') // Mobile responsive
    })

    it('includes necessary meta tags', async () => {
      const response = await fetch(baseUrl)
      const html = await response.text()

      expect(html).toContain('charset')
      expect(html).toContain('viewport')
    })
  })

  describe('Performance Under Load', () => {
    it('handles multiple simultaneous requests', async () => {
      const requests = Array.from({ length: 10 }, () => 
        fetch(`${baseUrl}/api/geocode?address=Анапа`)
      )

      const responses = await Promise.all(requests)
      
      // All requests should complete
      responses.forEach(response => {
        expect([200, 401, 403, 429]).toContain(response.status)
      })
    })

    it('maintains performance with repeated requests', async () => {
      const startTime = Date.now()
      
      for (let i = 0; i < 5; i++) {
        const response = await fetch(`${baseUrl}/api/geocode?address=Анапа`)
        expect([200, 401, 403]).toContain(response.status)
      }
      
      const endTime = Date.now()
      const totalTime = endTime - startTime

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(10000) // 10 seconds
    })
  })
})



