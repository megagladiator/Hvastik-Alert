"use client"

import { useState } from "react"

export default function TestPasswordResetPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testPasswordReset = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      setResult({ status: response.status, data })
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testRedirectUrls = async () => {
    try {
      const response = await fetch('/api/test-redirect-urls')
      const data = await response.json()
      setResult({ redirectUrls: data })
    } catch (error: any) {
      setResult({ error: error.message })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Тест сброса пароля
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email для тестирования
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="test@example.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={testPasswordReset}
                disabled={loading || !email}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Отправка...' : 'Тест сброса пароля'}
              </button>

              <button
                onClick={testRedirectUrls}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Проверить Redirect URLs
              </button>
            </div>

            {result && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Результат:</h3>
                <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
