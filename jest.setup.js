/**
 * JEST SETUP CONFIGURATION
 * 
 * Настройка Jest для тестирования системы сброса пароля
 */

// Мокаем Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Мокаем Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Мокаем Supabase клиент
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      resetPasswordForEmail: jest.fn(),
      exchangeCodeForSession: jest.fn(),
      updateUser: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      verifyOtp: jest.fn(),
    },
  })),
}))

// Мокаем Supabase серверный клиент
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      resetPasswordForEmail: jest.fn(),
      exchangeCodeForSession: jest.fn(),
      updateUser: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      verifyOtp: jest.fn(),
    },
  })),
}))

// Мокаем fetch для API тестов
global.fetch = jest.fn()

// Мокаем localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Мокаем sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Мокаем window.location
delete window.location
window.location = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
}

// Мокаем window.history
window.history = {
  pushState: jest.fn(),
  replaceState: jest.fn(),
  go: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
}

// Настройка таймаутов для тестов
jest.setTimeout(30000)

// Очистка моков после каждого теста
afterEach(() => {
  jest.clearAllMocks()
  localStorageMock.clear()
  sessionStorageMock.clear()
})

// Глобальные переменные для тестов
global.TEST_EMAIL = 'test@example.com'
global.TEST_PASSWORD = 'TestPassword123!'
global.NEW_PASSWORD = 'NewTestPassword456!'

// Мокаем console для тестов
const originalConsole = console
global.console = {
  ...originalConsole,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}

// Восстанавливаем console в конце
afterAll(() => {
  global.console = originalConsole
})