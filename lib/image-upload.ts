/**
 * Утилиты для загрузки изображений в Supabase Storage
 */

// Константы для валидации изображений
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_IMAGE_WIDTH = 2048 // 2048px
const MAX_IMAGE_HEIGHT = 2048 // 2048px
const MIN_IMAGE_WIDTH = 100 // 100px
const MIN_IMAGE_HEIGHT = 100 // 100px
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

/**
 * Валидирует изображение по размеру и разрешению
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  // Проверяем тип файла
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Неподдерживаемый тип файла. Разрешены: ${ALLOWED_TYPES.join(', ')}`
    }
  }

  // Проверяем размер файла
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
    const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)
    return {
      valid: false,
      error: `Файл слишком большой (${sizeMB}MB). Максимальный размер: ${maxSizeMB}MB`
    }
  }

  return { valid: true }
}

/**
 * Валидирует изображение по разрешению (асинхронно)
 */
export function validateImageDimensions(file: File): Promise<{ valid: boolean; error?: string }> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      
      if (img.width < MIN_IMAGE_WIDTH || img.height < MIN_IMAGE_HEIGHT) {
        resolve({
          valid: false,
          error: `Изображение слишком маленькое (${img.width}x${img.height}px). Минимальный размер: ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT}px`
        })
        return
      }

      if (img.width > MAX_IMAGE_WIDTH || img.height > MAX_IMAGE_HEIGHT) {
        resolve({
          valid: false,
          error: `Изображение слишком большое (${img.width}x${img.height}px). Максимальный размер: ${MAX_IMAGE_WIDTH}x${MAX_IMAGE_HEIGHT}px`
        })
        return
      }

      resolve({ valid: true })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({
        valid: false,
        error: 'Не удалось загрузить изображение для проверки'
      })
    }

    img.src = url
  })
}

/**
 * Автоматически сжимает изображение в зависимости от его размера
 */
export function autoCompressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const originalSize = file.size
    
    // Если файл меньше 500KB, не сжимаем
    if (originalSize < 500 * 1024) {
      resolve(file)
      return
    }
    
    // Определяем параметры сжатия в зависимости от размера
    let maxWidth = 1200
    let maxHeight = 1200
    let quality = 0.8
    
    if (originalSize > 5 * 1024 * 1024) {
      // Очень большие файлы (>5MB) - агрессивное сжатие
      maxWidth = 800
      maxHeight = 800
      quality = 0.6
    } else if (originalSize > 3 * 1024 * 1024) {
      // Большие файлы (3-5MB) - среднее сжатие
      maxWidth = 1000
      maxHeight = 1000
      quality = 0.7
    } else if (originalSize > 1 * 1024 * 1024) {
      // Средние файлы (1-3MB) - легкое сжатие
      maxWidth = 1200
      maxHeight = 1200
      quality = 0.8
    } else {
      // Маленькие файлы (500KB-1MB) - минимальное сжатие
      maxWidth = 1400
      maxHeight = 1400
      quality = 0.9
    }
    
    compressImage(file, maxWidth, maxHeight, quality)
      .then(resolve)
      .catch(reject)
  })
}

/**
 * Сжимает изображение до разумных размеров
 */
export function compressImage(file: File, maxWidth: number = 1200, maxHeight: number = 1200, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Вычисляем новые размеры с сохранением пропорций
      let { width, height } = img
      
      // Умное масштабирование - если изображение очень большое, сжимаем сильнее
      const originalSize = file.size
      let targetQuality = quality
      let targetMaxWidth = maxWidth
      let targetMaxHeight = maxHeight

      // Если файл больше 5MB, сжимаем агрессивнее
      if (originalSize > 5 * 1024 * 1024) {
        targetMaxWidth = 800
        targetMaxHeight = 800
        targetQuality = 0.6
      } else if (originalSize > 3 * 1024 * 1024) {
        targetMaxWidth = 1000
        targetMaxHeight = 1000
        targetQuality = 0.7
      } else if (originalSize > 1 * 1024 * 1024) {
        targetMaxWidth = 1200
        targetMaxHeight = 1200
        targetQuality = 0.8
      }

      // Масштабируем изображение
      if (width > height) {
        if (width > targetMaxWidth) {
          height = (height * targetMaxWidth) / width
          width = targetMaxWidth
        }
      } else {
        if (height > targetMaxHeight) {
          width = (width * targetMaxHeight) / height
          height = targetMaxHeight
        }
      }

      // Устанавливаем размеры canvas
      canvas.width = width
      canvas.height = height

      // Рисуем сжатое изображение
      ctx?.drawImage(img, 0, 0, width, height)

      // Конвертируем в blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg', // Всегда конвертируем в JPEG для лучшего сжатия
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Ошибка сжатия изображения'))
          }
        },
        'image/jpeg', // Всегда используем JPEG для сжатия
        targetQuality
      )
    }

    img.onerror = () => reject(new Error('Ошибка загрузки изображения'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Загружает локальное изображение в Supabase Storage
 * @param imageUrl - URL изображения (локальный или data URL)
 * @returns Promise<string | null> - URL в Supabase Storage или null при ошибке
 */
export async function uploadLocalImageToSupabase(imageUrl: string): Promise<string | null> {
  try {
    // Если это уже URL Supabase Storage, возвращаем как есть
    if (imageUrl.includes('supabase') || imageUrl.includes('storage.googleapis.com')) {
      return imageUrl
    }

    // Если это внешний HTTP URL, проверяем доступность
    if (imageUrl.startsWith('http')) {
      const response = await fetch(imageUrl, { method: 'HEAD' })
      if (response.ok) {
        return imageUrl // Внешний URL доступен, используем его
      } else {
        console.warn('⚠️ Внешний URL недоступен:', imageUrl)
        return null
      }
    }

    // Если это локальный URL (начинается с /), загружаем файл
    if (imageUrl.startsWith('/')) {
      return await uploadLocalFileToSupabase(imageUrl)
    }

    // Если это data URL, конвертируем в файл и загружаем
    if (imageUrl.startsWith('data:')) {
      return await uploadDataUrlToSupabase(imageUrl)
    }

    console.warn('⚠️ Неизвестный тип URL:', imageUrl)
    return null

  } catch (error) {
    console.error('❌ Ошибка загрузки изображения в Supabase Storage:', error)
    return null
  }
}

/**
 * Загружает локальный файл в Supabase Storage
 */
async function uploadLocalFileToSupabase(filePath: string): Promise<string | null> {
  try {
    // Для локальных файлов (например, /placeholder.svg) 
    // мы не можем их загрузить в Supabase Storage
    // Возвращаем null, чтобы использовать placeholder
    console.log('⚠️ Локальный файл не может быть загружен в Supabase Storage:', filePath)
    return null
  } catch (error) {
    console.error('❌ Ошибка загрузки локального файла:', error)
    return null
  }
}

/**
 * Загружает data URL в Supabase Storage
 */
async function uploadDataUrlToSupabase(dataUrl: string): Promise<string | null> {
  try {
    // Конвертируем data URL в файл
    const response = await fetch(dataUrl)
    const blob = await response.blob()
    
    // Создаем файл
    const file = new File([blob], `image-${Date.now()}.jpg`, { type: blob.type })
    
    // Валидируем файл
    const validation = validateImage(file)
    if (!validation.valid) {
      console.error('❌ Валидация файла не пройдена:', validation.error)
      throw new Error(validation.error)
    }

    // Валидируем размеры изображения
    const dimensionValidation = await validateImageDimensions(file)
    if (!dimensionValidation.valid) {
      console.error('❌ Валидация размеров не пройдена:', dimensionValidation.error)
      throw new Error(dimensionValidation.error)
    }

    // Автоматически сжимаем изображение
    console.log('🔄 Обрабатываем изображение...')
    const finalFile = await autoCompressImage(file)
    if (finalFile.size !== file.size) {
      console.log(`✅ Изображение сжато: ${(file.size / 1024 / 1024).toFixed(1)}MB → ${(finalFile.size / 1024 / 1024).toFixed(1)}MB`)
    } else {
      console.log('✅ Изображение не требует сжатия')
    }
    
    // Загружаем в Supabase Storage
    const formData = new FormData()
    formData.append('file', finalFile)
    
    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (uploadResponse.ok) {
      const result = await uploadResponse.json()
      console.log('✅ Data URL загружен в Supabase Storage:', result.url)
      return result.url
    } else {
      console.error('❌ Ошибка загрузки data URL в Supabase Storage')
      return null
    }
  } catch (error) {
    console.error('❌ Ошибка обработки data URL:', error)
    return null
  }
}

/**
 * Проверяет, является ли URL валидным для продакшена
 */
export function isValidProductionUrl(url: string): boolean {
  if (!url) return false
  
  // Локальные URL не подходят для продакшена
  if (url.startsWith('/') && !url.startsWith('//')) {
    return false
  }
  
  // Data URL не подходят для продакшена (слишком большие)
  if (url.startsWith('data:')) {
    return false
  }
  
  // HTTP/HTTPS URL подходят
  if (url.startsWith('http')) {
    return true
  }
  
  return false
}

/**
 * Получает placeholder изображение для продакшена
 */
export function getProductionPlaceholder(): string {
  // Возвращаем URL placeholder изображения, которое будет доступно на продакшене
  return 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=No+Image'
}
