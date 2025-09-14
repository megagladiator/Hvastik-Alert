"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { applyActionCode, checkActionCode } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const mode = searchParams.get('mode')
    const oobCode = searchParams.get('oobCode')

    console.log('Verify Email Page:', { mode, oobCode })

    if (mode === 'verifyEmail' && oobCode) {
      handleVerifyEmail(oobCode)
    } else {
      setStatus('error')
      setMessage('Неверная ссылка для подтверждения email.')
    }
  }, [searchParams])

  const handleVerifyEmail = async (oobCode: string) => {
    try {
      // Проверяем код действия
      const info = await checkActionCode(auth, oobCode)
      console.log('Email verification info:', info)

      // Применяем код действия для подтверждения email
      await applyActionCode(auth, oobCode)

      setStatus('success')
      setMessage('Ваш email успешно подтвержден! Теперь вы можете войти в систему.')
      
      // Перенаправляем на страницу входа через 3 секунды
      setTimeout(() => {
        router.push('/auth')
      }, 3000)

    } catch (error: any) {
      console.error('Error verifying email:', error)
      setStatus('error')
      if (error.code === 'auth/invalid-action-code') {
        setMessage('Срок действия ссылки истек или она недействительна. Попробуйте запросить новую.')
      } else if (error.code === 'auth/user-disabled') {
        setMessage('Ваш аккаунт заблокирован. Обратитесь к администратору.')
      } else {
        setMessage(`Ошибка подтверждения email: ${error.message}`)
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">Подтверждение email...</h2>
            <p className="text-gray-600 mt-2">Пожалуйста, подождите.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-green-600">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 className="text-xl font-semibold text-gray-800 mt-4">Email подтвержден!</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Перенаправление на страницу входа...</p>
            <Link href="/auth" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
              Перейти к входу
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-red-600">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 className="text-xl font-semibold text-gray-800 mt-4">Ошибка подтверждения</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <Link href="/auth" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Повторить вход
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}