"use client"

import { useEffect, useRef } from "react"
import { MapPin } from "lucide-react"

interface Pet {
  id: string
  type: "lost" | "found"
  animal_type: string
  breed: string
  name: string
  description: string
  color: string
  location: string
  latitude: number
  longitude: number
  contact_phone: string
  contact_name: string
  reward?: number
  photo_url?: string
  created_at: string
  status: "active" | "found" | "archived"
}

interface PetMapProps {
  pets: Pet[]
}

export function PetMap({ pets }: PetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

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

        // Загружаем Leaflet JS через CDN вместо динамического импорта
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
          // Устанавливаем центр на Анапу и масштаб как на скриншоте
          mapInstanceRef.current = L.map(mapRef.current).setView([44.89, 37.32], 11)

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
            maxZoom: 19,
          }).addTo(mapInstanceRef.current)
        }

        // Очищаем старые маркеры
        markersRef.current.forEach((marker) => {
          mapInstanceRef.current.removeLayer(marker)
        })
        markersRef.current = []

        // Добавляем новые маркеры
        console.log('🗺️ PetMap получил данные:', pets.map(p => ({
          name: p.name,
          location: p.location,
          lat: p.latitude,
          lng: p.longitude
        })))
        
        pets.forEach((pet, index) => {
          const icon = L.divIcon({
            html: `
              <div style="
                display: flex; 
                align-items: center; 
                justify-content: center; 
                width: 32px; 
                height: 32px; 
                border-radius: 50%; 
                background-color: ${pet.type === "lost" ? "#ef4444" : "#22c55e"}; 
                color: white; 
                font-size: 16px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                border: 2px solid white;
              ">
                ${pet.animal_type === "dog" ? "🐕" : pet.animal_type === "cat" ? "🐱" : "🐾"}
              </div>
            `,
            className: "custom-marker",
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          })

          console.log(`🗺️ Создаем маркер для ${pet.name}: [${pet.latitude}, ${pet.longitude}]`)
          const marker = L.marker([pet.latitude, pet.longitude], { icon })
            .addTo(mapInstanceRef.current)
            .bindPopup(`
              <div style="padding: 8px; min-width: 200px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <span style="
                    padding: 4px 8px; 
                    font-size: 12px; 
                    border-radius: 12px; 
                    background-color: ${pet.type === "lost" ? "#fef2f2" : "#f0fdf4"}; 
                    color: ${pet.type === "lost" ? "#dc2626" : "#16a34a"};
                  ">
                    ${pet.type === "lost" ? "Потерялся" : "Найден"}
                  </span>
                  ${pet.reward ? `<span style="padding: 4px 8px; font-size: 12px; background-color: #fff7ed; color: #ea580c; border-radius: 12px;">${pet.reward.toLocaleString()} ₽</span>` : ""}
                </div>
                <h3 style="font-weight: 600; color: #111827; margin-bottom: 4px;">${pet.name} • ${pet.breed}</h3>
                <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">${pet.description.substring(0, 100)}${pet.description.length > 100 ? "..." : ""}</p>
                <p style="font-size: 12px; color: #9ca3af; margin-bottom: 8px;">📍 ${pet.location}</p>
                <div style="display: flex; gap: 8px;">
                  <a href="/pet/${pet.id}" style="
                    padding: 6px 12px; 
                    font-size: 12px; 
                    background-color: #f3f4f6; 
                    color: #374151; 
                    border-radius: 4px; 
                    text-decoration: none;
                  ">
                    Подробнее
                  </a>
                  <a href="/chat/${pet.id}" style="
                    padding: 6px 12px; 
                    font-size: 12px; 
                    background-color: #f97316; 
                    color: white; 
                    border-radius: 4px; 
                    text-decoration: none;
                  ">
                    Написать
                  </a>
                </div>
              </div>
            `)

          markersRef.current.push(marker)
        })

        // Убираем автоматическую подгонку карты - пользователь сам управляет масштабом
        console.log('🗺️ Маркеры добавлены, автоматическая подгонка отключена')
        
        // Убираем автоматическое центрирование - карта должна показывать весь регион Анапы
        // const gostagaevskayaPet = pets.find(pet => 
        //   pet.location && pet.location.toLowerCase().includes('гостагаевская')
        // )
        // if (gostagaevskayaPet) {
        //   console.log(`🗺️ Найдено объявление для Гостагаевской, центрируем карту на [${gostagaevskayaPet.latitude}, ${gostagaevskayaPet.longitude}]`)
        //   mapInstanceRef.current.setView([gostagaevskayaPet.latitude, gostagaevskayaPet.longitude], 14)
        // }
      } catch (error) {
        console.error("Error loading Leaflet:", error)
      }
    }

    // Небольшая задержка для корректной инициализации
    const timer = setTimeout(loadLeaflet, 100)
    return () => clearTimeout(timer)
  }, [pets])

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-b-lg" style={{ minHeight: "300px" }} />

      {/* Легенда и кнопка сброса */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md z-[1000]">
        <div className="text-sm font-medium mb-2">Легенда</div>
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
              🐾
            </div>
            <span>Потерялся</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
              🐾
            </div>
            <span>Найден</span>
          </div>
        </div>
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([44.89, 37.32], 11)
            }
          }}
          className="w-full text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
        >
          Сброс
        </button>
      </div>

      {pets.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-b-lg">
          <div className="text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Объявления не найдены</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PetMap
