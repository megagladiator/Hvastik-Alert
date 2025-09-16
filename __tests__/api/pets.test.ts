import { GET, POST } from '@/app/api/pets/route'

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    })),
    insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }))
}

jest.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: mockSupabase
}))

describe('/api/pets', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('returns pets list successfully', async () => {
      const mockPets = [
        {
          id: '1',
          type: 'lost',
          animal_type: 'dog',
          breed: 'Лабрадор',
          name: 'Рекс',
          location: 'Анапа',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockSupabase.from().select().eq().order.mockResolvedValueOnce({
        data: mockPets,
        error: null
      })

      const request = new Request('http://localhost:3000/api/pets')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockPets)
    })

    it('handles database error', async () => {
      mockSupabase.from().select().eq().order.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      })

      const request = new Request('http://localhost:3000/api/pets')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Ошибка при получении объявлений')
    })

    it('filters by type when provided', async () => {
      const request = new Request('http://localhost:3000/api/pets?type=lost')
      await GET(request)

      expect(mockSupabase.from).toHaveBeenCalledWith('pets')
    })
  })

  describe('POST', () => {
    it('creates new pet successfully', async () => {
      const newPet = {
        type: 'lost',
        animal_type: 'dog',
        breed: 'Лабрадор',
        name: 'Рекс',
        location: 'Анапа',
        contact_phone: '+7 (918) 123-45-67',
        contact_name: 'Иван'
      }

      mockSupabase.from().insert.mockResolvedValueOnce({
        data: [{ id: '1', ...newPet }],
        error: null
      })

      const request = new Request('http://localhost:3000/api/pets', {
        method: 'POST',
        body: JSON.stringify(newPet),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBe('1')
    })

    it('validates required fields', async () => {
      const invalidPet = {
        type: 'lost',
        // Missing required fields
      }

      const request = new Request('http://localhost:3000/api/pets', {
        method: 'POST',
        body: JSON.stringify(invalidPet),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('обязательные поля')
    })

    it('handles database error on creation', async () => {
      const newPet = {
        type: 'lost',
        animal_type: 'dog',
        breed: 'Лабрадор',
        name: 'Рекс',
        location: 'Анапа',
        contact_phone: '+7 (918) 123-45-67',
        contact_name: 'Иван'
      }

      mockSupabase.from().insert.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      })

      const request = new Request('http://localhost:3000/api/pets', {
        method: 'POST',
        body: JSON.stringify(newPet),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Ошибка при создании объявления')
    })
  })
})



