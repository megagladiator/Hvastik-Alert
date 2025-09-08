'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface KeepAliveConfig {
  initialDelay: number // Задержка перед первым пингом (мс)
  interval: number // Интервал между пингами (мс)
  maxRetries: number // Максимум попыток при ошибке
  retryDelay: number // Задержка между повторными попытками (мс)
}

const DEFAULT_CONFIG: KeepAliveConfig = {
  initialDelay: 10000, // 10 секунд
  interval: 24 * 60 * 60 * 1000, // 24 часа
  maxRetries: 3,
  retryDelay: 30000 // 30 секунд
}

export default function SupabaseKeepAlive({ 
  config = DEFAULT_CONFIG,
  enableLogging = true 
}: { 
  config?: Partial<KeepAliveConfig>
  enableLogging?: boolean 
} = {}) {
  const [lastPing, setLastPing] = useState<Date | null>(null)
  const [pingCount, setPingCount] = useState(0)
  const [isActive, setIsActive] = useState(false)

  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  const log = (message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') => {
    if (!enableLogging) return
    
    const timestamp = new Date().toLocaleString()
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warn: '⚠️'
    }[type]
    
    console.log(`${prefix} [Keep-Alive] ${message} - ${timestamp}`)
  }

  useEffect(() => {
    if (!supabase) {
      log('Supabase не настроен, keep-alive отключен', 'warn')
      return
    }

    setIsActive(true)
    log('Keep-alive активирован', 'success')

    // Функция для пинга базы данных
    const pingDatabase = async (): Promise<boolean> => {
      try {
        const startTime = Date.now()
        
        // Простой запрос к базе данных
        const { data, error } = await supabase
          .from('pets')
          .select('count')
          .limit(1)
        
        const responseTime = Date.now() - startTime
        
        if (error) {
          log(`Ошибка пинга: ${error.message}`, 'error')
          return false
        }
        
        setLastPing(new Date())
        setPingCount(prev => prev + 1)
        log(`Ping успешен! Время ответа: ${responseTime}ms (попытка #${pingCount + 1})`, 'success')
        return true
      } catch (error: any) {
        log(`Исключение при пинге: ${error.message}`, 'error')
        return false
      }
    }

    // Функция для повторных попыток
    const pingWithRetry = async (): Promise<boolean> => {
      for (let i = 0; i < finalConfig.maxRetries; i++) {
        const success = await pingDatabase()
        if (success) {
          return true
        }
        
        if (i < finalConfig.maxRetries - 1) {
          log(`Повторная попытка через ${finalConfig.retryDelay / 1000} секунд... (${i + 1}/${finalConfig.maxRetries})`, 'warn')
          await new Promise(resolve => setTimeout(resolve, finalConfig.retryDelay))
        }
      }
      
      log(`Все ${finalConfig.maxRetries} попыток пинга неудачны!`, 'error')
      return false
    }

    // Первый пинг с задержкой
    const initialPing = setTimeout(() => {
      log('Выполнение первого пинга...', 'info')
      pingWithRetry()
    }, finalConfig.initialDelay)

    // Настройка периодического пинга
    const interval = setInterval(() => {
      log('Выполнение периодического пинга...', 'info')
      pingWithRetry()
    }, finalConfig.interval)

    // Очистка при размонтировании компонента
    return () => {
      clearTimeout(initialPing)
      clearInterval(interval)
      setIsActive(false)
      log('Keep-alive деактивирован', 'info')
    }
  }, [finalConfig, enableLogging])

  // В режиме разработки показываем статус
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded opacity-50 hover:opacity-100 transition-opacity">
        <div>Keep-Alive: {isActive ? '🟢 Активен' : '🔴 Неактивен'}</div>
        {lastPing && <div>Последний пинг: {lastPing.toLocaleTimeString()}</div>}
        <div>Всего пингов: {pingCount}</div>
      </div>
    )
  }

  // В продакшене компонент не рендерит ничего видимого
  return null
}
