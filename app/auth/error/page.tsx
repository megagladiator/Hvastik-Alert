"use client"

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Проблема с конфигурацией сервера'
      case 'AccessDenied':
        return 'Доступ запрещен'
      case 'Verification':
        return 'Ошибка верификации токена'
      case 'Default':
        return 'Произошла ошибка при аутентификации'
      default:
        return 'Неизвестная ошибка аутентификации'
    }
  }

  const getErrorDescription = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Проверьте настройки Supabase в переменных окружения'
      case 'AccessDenied':
        return 'У вас нет прав для доступа к этому ресурсу'
      case 'Verification':
        return 'Ссылка для подтверждения недействительна или истекла'
      case 'Default':
        return 'Попробуйте войти снова или обратитесь к администратору'
      default:
        return 'Попробуйте обновить страницу или войти заново'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">
            Ошибка аутентификации
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {getErrorMessage(error)}
            </h3>
            <p className="text-gray-600 text-sm">
              {getErrorDescription(error)}
            </p>
          </div>

          {error && (
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-xs text-gray-500 font-mono">
                Код ошибки: {error}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              asChild 
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              <Link href="/auth">
                <RefreshCw className="w-4 h-4 mr-2" />
                Попробовать снова
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              className="w-full"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                На главную
              </Link>
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Если проблема повторяется, обратитесь к администратору</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
