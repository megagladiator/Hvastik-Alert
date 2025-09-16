import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json({ error: 'Адрес не указан' }, { status: 400 })
    }

    console.log('🔍 API геокодирования для адреса:', address)

    // Используем ту же логику, что и в форме
    const normalizedAddress = address.trim().replace(/\s+/g, ' ')
    let found = false
    let coordinates = null
    let locationName = ''

    // Создаем массив вариантов поиска
    const searchVariants = [
      normalizedAddress,
      `${normalizedAddress}, Краснодарский край, Россия`,
      `${normalizedAddress}, Россия`,
      `станица ${normalizedAddress}, Краснодарский край, Россия`,
      `село ${normalizedAddress}, Краснодарский край, Россия`,
      `хутор ${normalizedAddress}, Краснодарский край, Россия`,
      `поселок ${normalizedAddress}, Краснодарский край, Россия`
    ]

    // Пробуем каждый вариант поиска
    for (const searchQuery of searchVariants) {
      if (found) break

      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1&countrycodes=ru`
        const response = await fetch(url)

        if (!response.ok) {
          continue
        }

        const data = await response.json()

        if (data && data.length > 0) {
          const result = data[0]
          coordinates = {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon)
          }
          locationName = result.display_name
          found = true
          break
        }
      } catch (searchError) {
        continue
      }
    }

    // Если не найдено через Nominatim, используем координаты по умолчанию
    if (!found) {
      const lowerAddress = normalizedAddress.toLowerCase()

      if (lowerAddress.includes('гостагаевская')) {
        coordinates = { latitude: 45.02063, longitude: 37.50175 }
        locationName = 'Гостагаевская'
      } else if (lowerAddress.includes('варениковская')) {
        coordinates = { latitude: 45.12085, longitude: 37.64171 }
        locationName = 'Варениковская'
      } else if (lowerAddress.includes('натухаевская')) {
        coordinates = { latitude: 45.0, longitude: 37.6 }
        locationName = 'Натухаевская'
      } else if (lowerAddress.includes('новороссийск')) {
        coordinates = { latitude: 44.7239, longitude: 37.7708 }
        locationName = 'Новороссийск'
      } else if (lowerAddress.includes('анапа')) {
        coordinates = { latitude: 44.8951, longitude: 37.3142 }
        locationName = 'Анапа'
      } else if (lowerAddress.includes('краснодар')) {
        coordinates = { latitude: 45.0448, longitude: 38.976 }
        locationName = 'Краснодар'
      } else if (lowerAddress.includes('сочи')) {
        coordinates = { latitude: 43.5855, longitude: 39.7231 }
        locationName = 'Сочи'
      } else if (lowerAddress.includes('геленджик')) {
        coordinates = { latitude: 44.5622, longitude: 38.0768 }
        locationName = 'Геленджик'
      }
    }

    if (coordinates) {
      return NextResponse.json({
        success: true,
        address: address,
        location: locationName,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        found: found
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Адрес не найден',
        address: address
      }, { status: 404 })
    }

  } catch (error) {
    console.error('❌ Ошибка геокодирования:', error)
    return NextResponse.json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 })
  }
}




