import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AdminPanel } from '@/components/admin/admin-panel'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    }))
  }
}))

describe('AdminPanel Component', () => {
  const mockUser = {
    id: '1',
    email: 'agentgl007@gmail.com',
    name: 'Admin User'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders admin panel for authorized user', () => {
    render(<AdminPanel user={mockUser} />)
    
    expect(screen.getByText('Админ панель')).toBeInTheDocument()
    expect(screen.getByText('Настройки фона')).toBeInTheDocument()
    expect(screen.getByText('Пользователи')).toBeInTheDocument()
    expect(screen.getByText('Статистика БД')).toBeInTheDocument()
    expect(screen.getByText('Таблицы БД')).toBeInTheDocument()
  })

  it('shows access denied for non-admin user', () => {
    const nonAdminUser = {
      id: '2',
      email: 'user@example.com',
      name: 'Regular User'
    }

    render(<AdminPanel user={nonAdminUser} />)
    
    expect(screen.getByText('Доступ запрещен')).toBeInTheDocument()
    expect(screen.getByText('У вас нет прав для доступа к админ панели')).toBeInTheDocument()
  })

  it('switches between tabs correctly', async () => {
    render(<AdminPanel user={mockUser} />)
    
    // Click on Users tab
    fireEvent.click(screen.getByText('Пользователи'))
    
    await waitFor(() => {
      expect(screen.getByText('Управление пользователями')).toBeInTheDocument()
    })
  })

  it('handles tab switching with proper content', async () => {
    render(<AdminPanel user={mockUser} />)
    
    // Test Statistics tab
    fireEvent.click(screen.getByText('Статистика БД'))
    
    await waitFor(() => {
      expect(screen.getByText('Статистика базы данных')).toBeInTheDocument()
    })
  })
})

