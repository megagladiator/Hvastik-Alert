import { GET } from '@/app/api/geocode/route'

// Mock fetch
global.fetch = jest.fn()

describe('/api/geocode', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns error when address is not provided', async () => {
    const request = new Request('http://localhost:3000/api/geocode')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Адрес не указан')
  })

  it('returns coordinates for Гостагаевская', async () => {
    const request = new Request('http://localhost:3000/api/geocode?address=Гостагаевская')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.latitude).toBe(45.02063)
    expect(data.longitude).toBe(37.50175)
    expect(data.location).toBe('Гостагаевская')
  })

  it('returns coordinates for Новороссийск', async () => {
    const request = new Request('http://localhost:3000/api/geocode?address=Новороссийск')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.latitude).toBe(44.7239)
    expect(data.longitude).toBe(37.7708)
    expect(data.location).toBe('Новороссийск')
  })

  it('returns coordinates for Анапа', async () => {
    const request = new Request('http://localhost:3000/api/geocode?address=Анапа')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.latitude).toBe(44.8951)
    expect(data.longitude).toBe(37.3142)
    expect(data.location).toBe('Анапа')
  })

  it('handles unknown address', async () => {
    const request = new Request('http://localhost:3000/api/geocode?address=НеизвестныйГород')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Адрес не найден')
  })

  it('handles Nominatim API response', async () => {
    // Mock successful Nominatim response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          lat: '45.1234',
          lon: '37.5678',
          display_name: 'Test Location, Russia',
        },
      ],
    })

    const request = new Request('http://localhost:3000/api/geocode?address=TestLocation')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.latitude).toBe(45.1234)
    expect(data.longitude).toBe(37.5678)
    expect(data.found).toBe(true)
  })

  it('handles Nominatim API error', async () => {
    // Mock failed Nominatim response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const request = new Request('http://localhost:3000/api/geocode?address=TestLocation')
    const response = await GET(request)
    const data = await response.json()

    // Should fallback to default coordinates if available
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})


