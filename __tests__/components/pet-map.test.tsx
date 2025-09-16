import { render, screen } from '@testing-library/react'
import { PetMap } from '@/components/pet-map'

// Mock Leaflet
jest.mock('leaflet', () => ({
  map: jest.fn(() => ({
    setView: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn(),
  })),
  marker: jest.fn(() => ({
    addTo: jest.fn(),
    bindPopup: jest.fn(),
  })),
  divIcon: jest.fn(),
  Icon: {
    Default: {
      prototype: {},
      mergeOptions: jest.fn(),
    },
  },
}))

describe('PetMap Component', () => {
  const mockPets = [
    {
      id: '1',
      type: 'lost' as const,
      animal_type: 'dog',
      breed: 'Лабрадор',
      name: 'Рекс',
      description: 'Дружелюбный пес',
      color: 'Золотистый',
      location: 'Гостагаевская',
      latitude: 45.02063,
      longitude: 37.50175,
      contact_phone: '+7 (918) 123-45-67',
      contact_name: 'Иван',
      reward: 5000,
      photo_url: '/test-image.jpg',
      created_at: '2024-01-01T00:00:00Z',
      status: 'active' as const,
    },
  ]

  beforeEach(() => {
    // Mock window.L
    ;(window as any).L = {
      map: jest.fn(() => ({
        setView: jest.fn(),
        addLayer: jest.fn(),
        removeLayer: jest.fn(),
      })),
      tileLayer: jest.fn(() => ({
        addTo: jest.fn(),
      })),
      marker: jest.fn(() => ({
        addTo: jest.fn(),
        bindPopup: jest.fn(),
      })),
      divIcon: jest.fn(),
      Icon: {
        Default: {
          prototype: {},
          mergeOptions: jest.fn(),
        },
      },
    }
  })

  it('renders without crashing', () => {
    render(<PetMap pets={mockPets} />)
    expect(screen.getByText('Легенда')).toBeInTheDocument()
  })

  it('displays legend correctly', () => {
    render(<PetMap pets={mockPets} />)
    expect(screen.getByText('Потерялся')).toBeInTheDocument()
    expect(screen.getByText('Найден')).toBeInTheDocument()
  })

  it('shows reset button', () => {
    render(<PetMap pets={mockPets} />)
    expect(screen.getByText('Сброс')).toBeInTheDocument()
  })

  it('handles empty pets array', () => {
    render(<PetMap pets={[]} />)
    expect(screen.getByText('Объявления не найдены')).toBeInTheDocument()
  })

  it('creates map container', () => {
    render(<PetMap pets={mockPets} />)
    const mapContainer = document.querySelector('[class*="w-full h-full"]')
    expect(mapContainer).toBeInTheDocument()
  })
})




