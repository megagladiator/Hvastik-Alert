import { GET, POST } from '@/app/api/auth/[...nextauth]/route'

// Mock NextAuth
jest.mock('next-auth', () => ({
  default: jest.fn()
}))

// Mock Supabase
const mockSupabase = {
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn()
  }
}

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}))

describe('/api/auth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication flow', () => {
    it('handles login request', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      }

      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: { id: '1', email: 'test@example.com' },
          session: { access_token: 'token123' }
        },
        error: null
      })

      const request = new Request('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify(loginData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith(loginData)
    })

    it('handles registration request', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'password123'
      }

      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: {
          user: { id: '2', email: 'newuser@example.com' },
          session: null
        },
        error: null
      })

      const request = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(registerData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      
      expect(response.status).toBe(201)
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(registerData)
    })

    it('handles logout request', async () => {
      mockSupabase.auth.signOut.mockResolvedValueOnce({
        error: null
      })

      const request = new Request('http://localhost:3000/api/auth/signout', {
        method: 'POST'
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it('handles authentication errors', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid credentials' }
      })

      const request = new Request('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify(loginData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid credentials')
    })
  })

  describe('Session management', () => {
    it('gets current user session', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User'
      }

      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      const request = new Request('http://localhost:3000/api/auth/session')
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.user).toEqual(mockUser)
    })

    it('handles no session', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null
      })

      const request = new Request('http://localhost:3000/api/auth/session')
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.user).toBeNull()
    })
  })
})

