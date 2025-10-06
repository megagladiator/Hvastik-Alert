"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function AuthErrorPage() {
  const [errorInfo, setErrorInfo] = useState<{
    error: string | null
    errorDescription: string | null
    errorCode: string | null
  }>({
    error: null,
    errorDescription: null,
    errorCode: null
  })
  
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    const errorCode = searchParams.get('error_code')
    
    setErrorInfo({ error, errorDescription, errorCode })
    
    console.log('Auth Error Page - Error details:', { error, errorDescription, errorCode })
  }, [searchParams])

  const getErrorMessage = () => {
    if (errorInfo.error === 'access_denied') {
      return {
        title: 'Доступ запрещен',
        message: 'Ссылка для сброса пароля была отклонена или истекла.',
        action: 'Запросите новую ссылку для сброса пароля.'
      }
    }
    
    if (errorInfo.error === 'server_error') {
      return {
        title: 'Ошибка сервера',
        message: 'Произошла временная ошибка на сервере.',
        action: 'Попробуйте снова через несколько минут.'
      }
    }
    
    if (errorInfo.error === 'invalid_request') {
      return {
        title: 'Неверный запрос',
        message: 'Ссылка для сброса пароля повреждена или недействительна.',
        action: 'Запросите новую ссылку для сброса пароля.'
      }
    }
    
    if (errorInfo.errorCode === 'PKCE_GRANT_PARAMS_AUTH_CODE_TYPE_ERROR') {
      return {
        title: 'Ошибка обработки ссылки',
        message: 'Произошла ошибка при обработке ссылки для сброса пароля. Это может быть связано с настройками браузера или устаревшей ссылкой.',
        action: 'Попробуйте запросить новую ссылку или очистите кэш браузера.'
      }
    }
    
    return {
      title: 'Ошибка аутентификации',
      message: errorInfo.errorDescription || 'Произошла неизвестная ошибка при обработке ссылки.',
      action: 'Попробуйте запросить новую ссылку для сброса пароля.'
    }
  }

  const errorMessage = getErrorMessage()

  return (
    <div className="max-w-md w-full mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <div className="text-red-600 text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-4 text-red-600">{errorMessage.title}</h2>
        <p className="text-gray-600 mb-6">{errorMessage.message}</p>
        
        {errorInfo.error && (
          <div className="bg-gray-100 p-3 rounded mb-4 text-sm">
            <div><strong>Код ошибки:</strong> {errorInfo.error}</div>
            {errorInfo.errorCode && <div><strong>Детали:</strong> {errorInfo.errorCode}</div>}
            {errorInfo.errorDescription && <div><strong>Описание:</strong> {errorInfo.errorDescription}</div>}
          </div>
        )}
        
        <div className="space-y-3">
          <Link 
            href="/auth/forgot-password" 
            className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded text-center"
          >
            Запросить новую ссылку
          </Link>
          
          <Link 
            href="/auth" 
            className="block w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-center"
          >
            Вернуться к входу
          </Link>
          
          <Link 
            href="/debug-password-reset" 
            className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-center"
          >
            🔍 Debug информация
          </Link>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p><strong>Рекомендации:</strong></p>
          <ul className="text-left mt-2 space-y-1">
            <li>• Убедитесь, что ссылка не была использована ранее</li>
            <li>• Проверьте, что ссылка не истекла (действительна 1 час)</li>
            <li>• Попробуйте в другом браузере</li>
            <li>• Очистите кэш и cookies браузера</li>
          </ul>
        </div>
      </div>
    </div>
  )
}