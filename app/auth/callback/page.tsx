"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Обработка аутентификации...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          setMessage('Ошибка аутентификации: ' + error.message)
          return
        }

        if (data.session) {
          setStatus('success')
          setMessage('Успешная аутентификация!')
          
          // Перенаправляем в личный кабинет через 2 секунды
          setTimeout(() => {
            router.push('/cabinet')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('Сессия не найдена')
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setStatus('error')
        setMessage('Произошла неожиданная ошибка')
      }
    }

    handleAuthCallback()
  }, [router])

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-600" />
      case 'error':
        return <XCircle className="w-8 h-8 text-red-600" />
    }
  }

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Обработка аутентификации'
      case 'success':
        return 'Успешный вход'
      case 'error':
        return 'Ошибка аутентификации'
    }
  }

  const getBgColor = () => {
    switch (status) {
      case 'loading':
        return 'from-blue-50 to-indigo-100'
      case 'success':
        return 'from-green-50 to-emerald-100'
      case 'error':
        return 'from-red-50 to-orange-100'
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBgColor()} flex items-center justify-center p-4`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            {getTitle()}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          {status === 'success' && (
            <p className="text-sm text-gray-500">
              Перенаправление в личный кабинет...
            </p>
          )}
          
          {status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={() => router.push('/auth')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Попробовать снова
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
              >
                На главную
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
