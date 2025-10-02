"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function DebugPasswordResetPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const searchParams = useSearchParams()

  useEffect(() => {
    const info: any = {
      // Основная информация о URL
      fullUrl: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      origin: window.location.origin,
      host: window.location.host,
      protocol: window.location.protocol,
      
      // Все параметры из query string
      searchParams: {},
      
      // Все параметры из hash
      hashParams: {},
      
      // Next.js searchParams
      nextSearchParams: {},
      
      // Environment info
      environment: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      },
      
      // Local storage
      localStorage: {},
      
      // Session storage  
      sessionStorage: {},
      
      // Cookies
      cookies: document.cookie,
      
      // Timestamp
      timestamp: new Date().toISOString()
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

    // Next.js searchParams
    try {
      for (const [key, value] of searchParams.entries()) {
        info.nextSearchParams[key] = value
      }
    } catch (e) {
      info.nextSearchParams = { error: 'Could not read Next.js searchParams' }
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
  }, [searchParams])

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">🔍 Debug Password Reset Page</h1>
      
      <div className="space-y-6">
        {/* URL Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3 text-blue-800">📍 URL Information</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Full URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{debugInfo.fullUrl}</code></div>
            <div><strong>Pathname:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{debugInfo.pathname}</code></div>
            <div><strong>Search:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{debugInfo.search}</code></div>
            <div><strong>Hash:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{debugInfo.hash}</code></div>
            <div><strong>Origin:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{debugInfo.origin}</code></div>
            <div><strong>Host:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{debugInfo.host}</code></div>
            <div><strong>Protocol:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{debugInfo.protocol}</code></div>
          </div>
        </div>

        {/* Search Parameters */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3 text-green-800">🔍 Search Parameters (Query String)</h2>
          {Object.keys(debugInfo.searchParams || {}).length > 0 ? (
            <div className="space-y-2 text-sm">
              {Object.entries(debugInfo.searchParams || {}).map(([key, value]) => (
                <div key={key}>
                  <strong>{key}:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{String(value)}</code>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No search parameters found</div>
          )}
        </div>

        {/* Hash Parameters */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3 text-yellow-800">🔗 Hash Parameters</h2>
          {Object.keys(debugInfo.hashParams || {}).length > 0 ? (
            <div className="space-y-2 text-sm">
              {Object.entries(debugInfo.hashParams || {}).map(([key, value]) => (
                <div key={key}>
                  <strong>{key}:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{String(value)}</code>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No hash parameters found</div>
          )}
        </div>

        {/* Next.js SearchParams */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3 text-purple-800">⚛️ Next.js SearchParams</h2>
          {Object.keys(debugInfo.nextSearchParams || {}).length > 0 ? (
            <div className="space-y-2 text-sm">
              {Object.entries(debugInfo.nextSearchParams || {}).map(([key, value]) => (
                <div key={key}>
                  <strong>{key}:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{String(value)}</code>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No Next.js searchParams found</div>
          )}
        </div>

        {/* Local Storage */}
        <div className="bg-red-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3 text-red-800">💾 Local Storage</h2>
          {Object.keys(debugInfo.localStorage || {}).length > 0 ? (
            <div className="space-y-2 text-sm">
              {Object.entries(debugInfo.localStorage || {}).map(([key, value]) => (
                <div key={key}>
                  <strong>{key}:</strong> <code className="bg-gray-100 px-2 py-1 rounded break-all">{String(value)}</code>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No localStorage items found</div>
          )}
        </div>

        {/* Session Storage */}
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3 text-indigo-800">🗂️ Session Storage</h2>
          {Object.keys(debugInfo.sessionStorage || {}).length > 0 ? (
            <div className="space-y-2 text-sm">
              {Object.entries(debugInfo.sessionStorage || {}).map(([key, value]) => (
                <div key={key}>
                  <strong>{key}:</strong> <code className="bg-gray-100 px-2 py-1 rounded break-all">{String(value)}</code>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No sessionStorage items found</div>
          )}
        </div>

        {/* Cookies */}
        <div className="bg-orange-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3 text-orange-800">🍪 Cookies</h2>
          <div className="text-sm">
            <code className="bg-gray-100 px-2 py-1 rounded break-all">{debugInfo.cookies || 'No cookies found'}</code>
          </div>
        </div>

        {/* Environment */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">🌐 Environment</h2>
          <div className="space-y-2 text-sm">
            <div><strong>User Agent:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{debugInfo.environment?.userAgent}</code></div>
            <div><strong>Language:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{debugInfo.environment?.language}</code></div>
            <div><strong>Platform:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{debugInfo.environment?.platform}</code></div>
            <div><strong>Cookie Enabled:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{String(debugInfo.environment?.cookieEnabled)}</code></div>
            <div><strong>Online:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{String(debugInfo.environment?.onLine)}</code></div>
            <div><strong>Timestamp:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{debugInfo.timestamp}</code></div>
          </div>
        </div>

        {/* Raw JSON */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">📄 Raw JSON Data</h2>
          <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mt-8 text-center">
        <a 
          href="/auth/reset-password" 
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded"
        >
          ← Back to Reset Password
        </a>
      </div>
    </div>
  )
}
