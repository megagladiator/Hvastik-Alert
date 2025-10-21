"use client"

import { useState } from 'react'
import { useAuth } from '../hooks/use-auth'
import { RegisterData } from '../types'

interface RegisterFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
}

export function RegisterForm({ onSuccess, onError, className = "" }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    profile: {
      first_name: '',
      last_name: '',
      phone: ''
    }
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const { register, loading, error } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await register(formData)
      onSuccess?.()
    } catch (err: any) {
      onError?.(err.message)
    }
  }

  const handleInputChange = (field: keyof RegisterData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleProfileChange = (field: keyof NonNullable<RegisterData['profile']>) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: e.target.value
      }
    }))
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
            Имя
          </label>
          <input
            type="text"
            id="first_name"
            value={formData.profile?.first_name || ''}
            onChange={handleProfileChange('first_name')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Введите ваше имя"
          />
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
            Фамилия
          </label>
          <input
            type="text"
            id="last_name"
            value={formData.profile?.last_name || ''}
            onChange={handleProfileChange('last_name')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Введите вашу фамилию"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Введите ваш email"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Телефон
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.profile?.phone || ''}
          onChange={handleProfileChange('phone')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Введите ваш телефон"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Пароль *
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            required
            minLength={6}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Введите пароль (минимум 6 символов)"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Подтвердите пароль *
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            required
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Подтвердите пароль"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error.message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
      </button>
    </form>
  )
}

export default RegisterForm












