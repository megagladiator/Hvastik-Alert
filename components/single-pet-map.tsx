"use client"

import { useEffect, useRef } from "react"
import { MapPin } from "lucide-react"

interface Pet {
  id: string
  name: string
  latitude: number
  longitude: number
  type: "lost" | "found"
  location?: string
}

interface SinglePetMapProps {
  pet: Pet
}

export function SinglePetMap({ pet }: SinglePetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Динамически загружаем Leaflet и его стили
    const loadLeaflet = async () => {
      try {
        // Загружаем CSS для Leaflet
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          link.crossOrigin = ""
          document.head.appendChild(link)
        }

        // Загружаем Leaflet JS через CDN
        if (typeof window !== "undefined" && !(window as any).L) {
          const script = document.createElement("script")
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          script.crossOrigin = ""
          document.head.appendChild(script)
          
          // Ждем загрузки скрипта
          await new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = reject
          })
        }
        
        const L = (window as any).L
        
        if (!L) {
          console.warn("Leaflet not loaded, skipping map initialization")
          return
        }

        // Исправляем иконки маркеров
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        })

        // Инициализируем карту только один раз
        if (!mapInstanceRef.current && mapRef.current) {
          // Устанавливаем центр на координаты питомца
          mapInstanceRef.current = L.map(mapRef.current).setView([pet.latitude, pet.longitude], 15)

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
            maxZoom: 19,
          }).addTo(mapInstanceRef.current)

          // Добавляем маркер для питомца
          const icon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ${
                pet.type === 'lost' ? 'bg-red-500' : 'bg-green-500'
              }">
                🐾
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          })

          const marker = L.marker([pet.latitude, pet.longitude], { icon })
            .addTo(mapInstanceRef.current)

          // Добавляем всплывающую подсказку
          marker.bindPopup(`
            <div class="text-center">
              <h3 class="font-bold text-lg">${pet.name}</h3>
              <p class="text-sm text-gray-600">${pet.type === 'lost' ? 'Потерялся' : 'Найден'}</p>
              ${pet.location ? `<p class="text-xs text-gray-500 mt-1">${pet.location}</p>` : ''}
            </div>
          `)

          // Открываем всплывающую подсказку
          marker.openPopup()
        }

      } catch (error) {
        console.error("Ошибка загрузки карты:", error)
      }
    }

    loadLeaflet()

    // Очистка при размонтировании
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [pet])

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" style={{ minHeight: "256px" }} />
      
      {/* Информация о местоположении */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="text-sm font-medium text-gray-700">
          📍 {pet.location || 'Местоположение'}
        </div>
        <div className="text-xs text-gray-500">
          Координаты: {pet.latitude.toFixed(6)}, {pet.longitude.toFixed(6)}
        </div>
      </div>

      {/* Статус питомца */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className={`flex items-center gap-2 text-sm font-medium ${
          pet.type === 'lost' ? 'text-red-600' : 'text-green-600'
        }`}>
          <div className={`w-3 h-3 rounded-full ${
            pet.type === 'lost' ? 'bg-red-500' : 'bg-green-500'
          }`}></div>
          {pet.type === 'lost' ? 'Потерялся' : 'Найден'}
        </div>
      </div>
    </div>
  )
}

export default SinglePetMap

