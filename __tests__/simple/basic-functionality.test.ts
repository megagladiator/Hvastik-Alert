/**
 * Базовые тесты функциональности Хвостик Alert
 * Простые тесты без зависимостей от внешних сервисов
 */

describe('Basic Functionality Tests', () => {
  
  describe('Environment Setup', () => {
    it('has required environment variables', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
    })

    it('has Jest configured correctly', () => {
      expect(jest).toBeDefined()
      expect(global.fetch).toBeDefined()
    })
  })

  describe('Utility Functions', () => {
    it('can format phone numbers', () => {
      const formatPhone = (phone: string) => {
        return phone.replace(/\D/g, '').replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5')
      }

      expect(formatPhone('79181234567')).toBe('+7 (918) 123-45-67')
      expect(formatPhone('89181234567')).toBe('+8 (918) 123-45-67')
    })

    it('can validate email addresses', () => {
      const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      }

      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
    })

    it('can format dates', () => {
      const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('ru-RU')
      }

      const testDate = '2024-01-01T00:00:00Z'
      expect(formatDate(testDate)).toContain('01.01.2024')
    })
  })

  describe('Data Validation', () => {
    it('validates pet announcement data', () => {
      const validatePetData = (data: any) => {
        const required = ['type', 'animal_type', 'breed', 'name', 'location', 'contact_phone', 'contact_name']
        return required.every(field => data[field] && data[field].trim().length > 0)
      }

      const validData = {
        type: 'lost',
        animal_type: 'dog',
        breed: 'Лабрадор',
        name: 'Рекс',
        location: 'Анапа',
        contact_phone: '+7 (918) 123-45-67',
        contact_name: 'Иван'
      }

      const invalidData = {
        type: 'lost',
        animal_type: '',
        breed: 'Лабрадор'
      }

      expect(validatePetData(validData)).toBe(true)
      expect(validatePetData(invalidData)).toBe(false)
    })

    it('validates coordinates', () => {
      const isValidCoordinate = (lat: number, lng: number) => {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
      }

      expect(isValidCoordinate(44.8951, 37.3142)).toBe(true) // Анапа
      expect(isValidCoordinate(91, 37.3142)).toBe(false) // Недопустимая широта
      expect(isValidCoordinate(44.8951, 181)).toBe(false) // Недопустимая долгота
    })
  })

  describe('Business Logic', () => {
    it('calculates distance between coordinates', () => {
      const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371 // Радиус Земли в км
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLng = (lng2 - lng1) * Math.PI / 180
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        return R * c
      }

      // Расстояние между Анапой и Новороссийском
      const anapa = { lat: 44.8951, lng: 37.3142 }
      const novorossiysk = { lat: 44.7239, lng: 37.7708 }
      
      const distance = calculateDistance(anapa.lat, anapa.lng, novorossiysk.lat, novorossiysk.lng)
      expect(distance).toBeGreaterThan(40) // Примерно 45 км
      expect(distance).toBeLessThan(60)
    })

    it('determines pet status based on type and time', () => {
      const getPetStatus = (type: string, createdAt: string, foundAt?: string) => {
        if (foundAt) return 'found'
        if (type === 'found') return 'waiting_owner'
        
        const daysSinceCreated = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceCreated > 30) return 'archived'
        
        return 'active'
      }

      const recentDate = new Date().toISOString()
      const oldDate = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()

      expect(getPetStatus('lost', recentDate)).toBe('active')
      expect(getPetStatus('lost', oldDate)).toBe('archived')
      expect(getPetStatus('found', recentDate)).toBe('waiting_owner')
      expect(getPetStatus('lost', recentDate, new Date().toISOString())).toBe('found')
    })
  })

  describe('Search and Filter Logic', () => {
    it('filters pets by type', () => {
      const pets = [
        { id: '1', type: 'lost', name: 'Рекс' },
        { id: '2', type: 'found', name: 'Мурка' },
        { id: '3', type: 'lost', name: 'Бобик' }
      ]

      const filterByType = (pets: any[], type: string) => {
        return pets.filter(pet => pet.type === type)
      }

      expect(filterByType(pets, 'lost')).toHaveLength(2)
      expect(filterByType(pets, 'found')).toHaveLength(1)
    })

    it('searches pets by name', () => {
      const pets = [
        { id: '1', name: 'Рекс', breed: 'Лабрадор' },
        { id: '2', name: 'Мурка', breed: 'Персидская' },
        { id: '3', name: 'Рексик', breed: 'Овчарка' }
      ]

      const searchPets = (pets: any[], query: string) => {
        const lowerQuery = query.toLowerCase()
        return pets.filter(pet => 
          pet.name.toLowerCase().includes(lowerQuery) ||
          pet.breed.toLowerCase().includes(lowerQuery)
        )
      }

      expect(searchPets(pets, 'рекс')).toHaveLength(2)
      expect(searchPets(pets, 'лабрадор')).toHaveLength(1)
      expect(searchPets(pets, 'кот')).toHaveLength(0)
    })
  })

  describe('Geocoding Logic', () => {
    it('has predefined coordinates for known locations', () => {
      const knownLocations = {
        'анапа': { lat: 44.8951, lng: 37.3142 },
        'новороссийск': { lat: 44.7239, lng: 37.7708 },
        'гостагаевская': { lat: 45.02063, lng: 37.50175 },
        'варениковская': { lat: 45.12085, lng: 37.64171 }
      }

      const getCoordinates = (location: string) => {
        const normalized = location.toLowerCase().trim()
        return knownLocations[normalized] || null
      }

      expect(getCoordinates('Анапа')).toEqual({ lat: 44.8951, lng: 37.3142 })
      expect(getCoordinates('ГОСТАГАЕВСКАЯ')).toEqual({ lat: 45.02063, lng: 37.50175 })
      expect(getCoordinates('НеизвестныйГород')).toBeNull()
    })

    it('normalizes address strings', () => {
      const normalizeAddress = (address: string) => {
        return address
          .toLowerCase()
          .trim()
          .replace(/ё/g, 'е')
          .replace(/[^\u0400-\u04FF\w\s-]/g, '') // Поддержка кириллицы
          .replace(/\s+/g, ' ')
      }

      expect(normalizeAddress('  Анапа  ')).toBe('анапа')
      expect(normalizeAddress('Гостагаевская!!!')).toBe('гостагаевская')
      expect(normalizeAddress('ул. Ленина, 10')).toBe('ул ленина 10')
    })
  })

  describe('User Interface Helpers', () => {
    it('formats pet type for display', () => {
      const formatPetType = (type: string) => {
        const types = {
          'lost': 'Потерялся',
          'found': 'Найден'
        }
        return types[type] || type
      }

      expect(formatPetType('lost')).toBe('Потерялся')
      expect(formatPetType('found')).toBe('Найден')
      expect(formatPetType('unknown')).toBe('unknown')
    })

    it('formats animal type for display', () => {
      const formatAnimalType = (type: string) => {
        const types = {
          'dog': 'Собака',
          'cat': 'Кошка',
          'bird': 'Птица',
          'other': 'Другое'
        }
        return types[type] || type
      }

      expect(formatAnimalType('dog')).toBe('Собака')
      expect(formatAnimalType('cat')).toBe('Кошка')
      expect(formatAnimalType('unknown')).toBe('unknown')
    })

    it('generates pet card summary', () => {
      const generateSummary = (pet: any) => {
        return `${pet.type === 'lost' ? 'Потерялся' : 'Найден'} ${pet.animal_type === 'dog' ? 'пёс' : 'питомец'} ${pet.name} (${pet.breed}) в районе ${pet.location}`
      }

      const pet = {
        type: 'lost',
        animal_type: 'dog',
        name: 'Рекс',
        breed: 'Лабрадор',
        location: 'Анапа'
      }

      expect(generateSummary(pet)).toBe('Потерялся пёс Рекс (Лабрадор) в районе Анапа')
    })
  })
})
