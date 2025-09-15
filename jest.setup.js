import '@testing-library/jest-dom'

// Mock fetch globally
global.fetch = jest.fn()

// Mock Request and Response
global.Request = jest.fn().mockImplementation((url, options) => ({
  url,
  ...options,
  json: jest.fn(),
  text: jest.fn(),
}))

global.Response = jest.fn().mockImplementation((body, options) => ({
  ok: true,
  status: 200,
  json: jest.fn(() => Promise.resolve(body)),
  text: jest.fn(() => Promise.resolve(body)),
  ...options,
}))

// Mock window.performance
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 1000000,
    },
  },
  writable: true,
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'