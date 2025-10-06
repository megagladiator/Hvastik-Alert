"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { requestPasswordReset, clearCodeVerifier, getCurrentUser, getCurrentSession } from "@/lib/auth"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [userInfo, setUserInfo] = useState<any>({})
  const router = useRouter()
  const searchParams = useSearchParams()

  // Собираем отладочную информацию
  useEffect(() => {
    const info: any = {
      // URL информация
      fullUrl: window.location.href,
      origin: window.location.origin,
      host: window.location.host,
      protocol: window.location.protocol,
      
      // Параметры URL
      searchParams: {},
      hashParams: {},
      
      // Environment
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      
      // Local Storage
      localStorage: {},
      
      // Session Storage
      sessionStorage: {},
      
      // Cookies
      cookies: document.cookie,
      
      // Timestamp
      timestamp: new Date().toISOString(),
      
      // Supabase info
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set',
      nodeEnv: process.env.NODE_ENV || 'not set'
    }

    // Парсим search parameters
    const urlSearchParams = new URLSearchParams(window.location.search)
    for (const [key, value] of urlSearchParams.entries()) {
      info.searchParams[key] = value
    }

    // Парсим hash parameters
    const hashSearchParams = new URLSearchParams(window.location.hash.substring(1))
    for (const [key, value] of hashSearchParams.entries()) {
      info.hashParams[key] = value
    }

    // Local storage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          info.localStorage[key] = localStorage.getItem(key)
        }
      }
    } catch (e) {
      info.localStorage = { error: 'Could not read localStorage' }
    }

    // Session storage
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key) {
          info.sessionStorage[key] = sessionStorage.getItem(key)
        }
      }
    } catch (e) {
      info.sessionStorage = { error: 'Could not read sessionStorage' }
    }

    setDebugInfo(info)
  }, [])

  // Получаем информацию о пользователе и сессии
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const user = await getCurrentUser()
        const session = await getCurrentSession()
        
        setUserInfo({
          user: user ? {
            id: user.id,
            email: user.email,
            email_confirmed_at: user.email_confirmed_at,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            role: user.role,
            aud: user.aud
          } : null,
          session: session ? {
            access_token: session.access_token ? 'present' : 'missing',
            refresh_token: session.refresh_token ? 'present' : 'missing',
            expires_at: session.expires_at,
            expires_in: session.expires_in,
            token_type: session.token_type,
            user_id: session.user?.id
          } : null,
          isAuthenticated: !!user
        })
      } catch (error) {
        console.log('No authenticated user:', error)
        setUserInfo({
          user: null,
          session: null,
          isAuthenticated: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    getUserInfo()
  }, [])

  // Проверяем параметры ошибки из URL
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      if (errorParam === 'link_expired') {
        setError('Ссылка для сброса пароля истекла. Пожалуйста, запросите новую ссылку.')
      } else if (errorParam === 'access_denied') {
        setError('Доступ запрещен. Пожалуйста, запросите новую ссылку для сброса пароля.')
      } else {
        setError('Произошла ошибка при обработке ссылки. Пожалуйста, попробуйте снова.')
      }
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    try {
      console.log('🔑 Requesting password reset for:', email)
      
      // Используем централизованную функцию из lib/auth.ts
      const { error } = await requestPasswordReset(email)
      
      if (error) {
        console.error('❌ Error requesting password reset:', error)
        
        if (error.message.includes('User not found') || error.message.includes('not found')) {
          setError('Пользователь с таким email не зарегистрирован. Пожалуйста, пройдите регистрацию для доступа к личному кабинету сайта.')
        } else if (error.message.includes('Invalid email')) {
          setError('Неверный формат email')
        } else if (error.message.includes('Too many requests') || error.message.includes('rate limit')) {
          setError('Слишком много запросов. Попробуйте позже')
        } else {
          setError('Произошла ошибка при отправке письма для сброса пароля: ' + error.message)
        }
        
        // Удаляем code_verifier при ошибке
        clearCodeVerifier()
        return
      }

      console.log('✅ Password reset email sent successfully')
      setSuccess(true)
      
    } catch (error: any) {
      console.error('❌ Exception in handleSubmit:', error)
      setError('Произошла ошибка при отправке запроса')
      // Удаляем code_verifier при ошибке
      clearCodeVerifier()
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <div className="max-w-md w-full mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-green-600 text-4xl mb-4">✓</div>
          <h2 className="text-xl font-bold mb-4 text-green-600">Письмо отправлено!</h2>
          <p className="text-gray-600 mb-4">
            Мы отправили ссылку для сброса пароля на адрес <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Проверьте почту и перейдите по ссылке для установки нового пароля.
          </p>
          
          <div className="space-y-2">
            <Link 
              href="/auth" 
              className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded text-center"
            >
              Вернуться к входу
            </Link>
            <button 
              onClick={() => {
                setSuccess(false)
                setEmail("")
              }}
              className="block w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
            >
              Отправить еще раз
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full mx-auto mt-10 p-6 bg-gradient-to-br from-purple-50 to-pink-100 rounded-lg shadow-lg border-2 border-purple-200">
      <div className="text-center mb-4">
        <div className="text-purple-600 text-2xl mb-2">🔑</div>
        <h2 className="text-xl font-bold text-purple-800">Забыли пароль?</h2>
        <p className="text-sm text-purple-600 mt-1">Сброс через Supabase</p>
      </div>
      <p className="text-gray-600 mb-6 text-center">
        Введите ваш email, и мы отправим ссылку для сброса пароля
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
          name="email"
          id="email"
          className="w-full border-2 border-purple-200 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
          disabled={loading}
        />
        
        {error && (
          <div className="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="font-medium mb-1">Ошибка:</div>
            <div>{error}</div>
            {error.includes('не зарегистрирован') && (
              <div className="mt-3">
                <Link 
                  href="/register" 
                  className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm"
                >
                  Перейти к регистрации
                </Link>
              </div>
            )}
            {error.includes('Слишком много запросов') && (
              <div className="mt-3 text-sm text-gray-600">
                <p>Попробуйте снова через час.</p>
                <p>Это защита от спама.</p>
              </div>
            )}
          </div>
        )}
        
        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl" 
          disabled={loading}
        >
          {loading ? "Отправка..." : "Отправить ссылку для сброса"}
        </button>
        
        <div className="text-center">
          <Link href="/auth" className="text-purple-600 hover:text-purple-800 underline font-medium">
            Вернуться к входу
          </Link>
        </div>
      </form>

      {/* Debug Information */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">🔍 Техническая информация</h3>
        
        <div className="space-y-4 text-sm">
          {/* URL Info */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium text-gray-700 mb-2">📍 URL Information</h4>
            <div className="space-y-1">
              <div><strong>Full URL:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{debugInfo.fullUrl}</code></div>
              <div><strong>Origin:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{debugInfo.origin}</code></div>
              <div><strong>Host:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{debugInfo.host}</code></div>
              <div><strong>Protocol:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{debugInfo.protocol}</code></div>
            </div>
          </div>

          {/* Environment */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium text-gray-700 mb-2">🌐 Environment</h4>
            <div className="space-y-1">
              <div><strong>Node Env:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{debugInfo.nodeEnv}</code></div>
              <div><strong>Supabase URL:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{debugInfo.supabaseUrl}</code></div>
              <div><strong>Language:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{debugInfo.language}</code></div>
              <div><strong>Platform:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{debugInfo.platform}</code></div>
              <div><strong>Online:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{String(debugInfo.onLine)}</code></div>
            </div>
          </div>

          {/* User & Session Info */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium text-gray-700 mb-2">👤 User & Session</h4>
            <div className="space-y-1">
              <div><strong>Authenticated:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{String(userInfo.isAuthenticated)}</code></div>
              {userInfo.error && (
                <div><strong>Error:</strong> <code className="bg-red-100 px-1 rounded text-xs text-red-600">{userInfo.error}</code></div>
              )}
              {userInfo.user && (
                <div className="mt-2 space-y-1">
                  <div><strong>User ID:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{userInfo.user.id}</code></div>
                  <div><strong>Email:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{userInfo.user.email}</code></div>
                  <div><strong>Email Confirmed:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{userInfo.user.email_confirmed_at ? 'Yes' : 'No'}</code></div>
                  <div><strong>Created:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{userInfo.user.created_at}</code></div>
                  <div><strong>Last Sign In:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{userInfo.user.last_sign_in_at || 'Never'}</code></div>
                </div>
              )}
              {userInfo.session && (
                <div className="mt-2 space-y-1">
                  <div><strong>Access Token:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{userInfo.session.access_token}</code></div>
                  <div><strong>Refresh Token:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{userInfo.session.refresh_token}</code></div>
                  <div><strong>Expires At:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{userInfo.session.expires_at}</code></div>
                  <div><strong>Expires In:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{userInfo.session.expires_in}</code></div>
                  <div><strong>Token Type:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{userInfo.session.token_type}</code></div>
                </div>
              )}
            </div>
          </div>

          {/* Local Storage */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium text-gray-700 mb-2">💾 Local Storage</h4>
            {Object.keys(debugInfo.localStorage || {}).length > 0 ? (
              <div className="space-y-1">
                {Object.entries(debugInfo.localStorage || {}).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong> <code className="bg-gray-100 px-1 rounded text-xs break-all">{String(value)}</code>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No localStorage items</div>
            )}
          </div>

          {/* Session Storage */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium text-gray-700 mb-2">🗂️ Session Storage</h4>
            {Object.keys(debugInfo.sessionStorage || {}).length > 0 ? (
              <div className="space-y-1">
                {Object.entries(debugInfo.sessionStorage || {}).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong> <code className="bg-gray-100 px-1 rounded text-xs break-all">{String(value)}</code>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No sessionStorage items</div>
            )}
          </div>

          {/* Cookies */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium text-gray-700 mb-2">🍪 Cookies</h4>
            <div className="text-xs">
              <code className="bg-gray-100 px-1 rounded break-all">{debugInfo.cookies || 'No cookies'}</code>
            </div>
          </div>

          {/* URL Parameters */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium text-gray-700 mb-2">🔍 URL Parameters</h4>
            <div className="space-y-2">
              <div>
                <strong>Search Params:</strong>
                {Object.keys(debugInfo.searchParams || {}).length > 0 ? (
                  <div className="mt-1 space-y-1">
                    {Object.entries(debugInfo.searchParams || {}).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <code className="bg-gray-100 px-1 rounded">{key}</code>: <code className="bg-gray-100 px-1 rounded">{String(value)}</code>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 text-xs ml-2">None</span>
                )}
              </div>
              <div>
                <strong>Hash Params:</strong>
                {Object.keys(debugInfo.hashParams || {}).length > 0 ? (
                  <div className="mt-1 space-y-1">
                    {Object.entries(debugInfo.hashParams || {}).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <code className="bg-gray-100 px-1 rounded">{key}</code>: <code className="bg-gray-100 px-1 rounded">{String(value)}</code>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 text-xs ml-2">None</span>
                )}
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium text-gray-700 mb-2">⏰ Timestamp</h4>
            <code className="bg-gray-100 px-1 rounded text-xs">{debugInfo.timestamp}</code>
          </div>
        </div>
      </div>
    </div>
  )
}
