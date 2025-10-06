'use client'

import { useEffect, useState } from 'react'

export default function DebugServerEnv() {
  const [envInfo, setEnvInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEnvInfo = async () => {
      try {
        const response = await fetch('/api/debug-server-env')
        const data = await response.json()
        setEnvInfo(data)
      } catch (error) {
        console.error('Error fetching env info:', error)
        setEnvInfo({ error: 'Failed to fetch environment info' })
      } finally {
        setLoading(false)
      }
    }

    fetchEnvInfo()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка информации о сервере...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            🔍 Debug Server Environment
          </h1>
          
          {envInfo?.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h2 className="text-red-800 font-semibold">Ошибка</h2>
              <p className="text-red-600">{envInfo.error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium text-gray-700 mb-2">Environment Variables</h3>
                <div className="space-y-2">
                  <div><strong>NODE_ENV:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm">{envInfo?.NODE_ENV || 'Not set'}</code></div>
                  <div><strong>NEXTAUTH_URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm break-all">{envInfo?.NEXTAUTH_URL || 'Not set'}</code></div>
                  <div><strong>NEXT_PUBLIC_SITE_URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm break-all">{envInfo?.NEXT_PUBLIC_SITE_URL || 'Not set'}</code></div>
                  <div><strong>SUPABASE_URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm break-all">{envInfo?.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</code></div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium text-gray-700 mb-2">Browser Information</h3>
                <div className="space-y-2">
                  <div><strong>Hostname:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm">{envInfo?.hostname || 'Unknown'}</code></div>
                  <div><strong>Protocol:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm">{envInfo?.protocol || 'Unknown'}</code></div>
                  <div><strong>Port:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm">{envInfo?.port || 'Default'}</code></div>
                  <div><strong>Origin:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm">{envInfo?.origin || 'Unknown'}</code></div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium text-gray-700 mb-2">Expected vs Actual</h3>
                <div className="space-y-2">
                  <div><strong>Expected NODE_ENV:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm">production</code></div>
                  <div><strong>Actual NODE_ENV:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm">{envInfo?.NODE_ENV || 'Not set'}</code></div>
                  <div><strong>Expected Base URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm">https://hvostikalert.ru</code></div>
                  <div><strong>Actual Base URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm">{envInfo?.origin || 'Unknown'}</code></div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium text-gray-700 mb-2">🚨 Diagnosis</h3>
                <div className="space-y-2">
                  {envInfo?.NEXTAUTH_URL?.includes('localhost') ? (
                    <div className="text-red-600 font-semibold">
                      ❌ NEXTAUTH_URL contains localhost: {envInfo.NEXTAUTH_URL}
                    </div>
                  ) : (
                    <div className="text-green-600 font-semibold">
                      ✅ NEXTAUTH_URL is correct: {envInfo?.NEXTAUTH_URL || 'Not set'}
                    </div>
                  )}
                  
                  {envInfo?.NODE_ENV === 'production' ? (
                    <div className="text-green-600 font-semibold">
                      ✅ NODE_ENV is set to 'production'
                    </div>
                  ) : (
                    <div className="text-red-600 font-semibold">
                      ❌ NODE_ENV is not 'production': {envInfo?.NODE_ENV || 'Not set'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
