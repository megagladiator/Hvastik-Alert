"use client"

import { useRef, useEffect } from "react"
import { MapPin } from "lucide-react"
import { Pet } from './types'
import { loadLeaflet } from './leaflet-loader'
import { initializeMap, addPetMarkers, clearMarkers, setMapCenter, calculateCenter } from './map-utils'
import { DEFAULT_MAP_CONFIG } from './config'

interface PetMapProps {
  pets: Pet[]
  className?: string
  showLegend?: boolean
  showResetButton?: boolean
}

export function PetMap({ 
  pets, 
  className = "w-full h-full", 
  showLegend = true, 
  showResetButton = true 
}: PetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    const initializeMapComponent = async () => {
      try {
        const L = await loadLeaflet()
        
        if (!L) {
          console.warn("Leaflet not loaded, skipping map initialization")
          return
        }

        // Инициализируем карту только один раз
        if (!mapInstanceRef.current) {
          const center = pets.length > 0 ? calculateCenter(pets) : DEFAULT_MAP_CONFIG.center
          mapInstanceRef.current = initializeMap(L, mapRef.current, {
            ...DEFAULT_MAP_CONFIG,
            center
          })
        }

        // Очищаем старые маркеры
        clearMarkers(mapInstanceRef.current, markersRef.current)
        markersRef.current = []

        // Добавляем новые маркеры
        if (pets.length > 0) {
          markersRef.current = addPetMarkers(L, mapInstanceRef.current, pets)
        }

      } catch (error) {
        console.error('Failed to initialize map:', error)
      }
    }

    initializeMapComponent()
  }, [pets])

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      setMapCenter(mapInstanceRef.current, DEFAULT_MAP_CONFIG.center, DEFAULT_MAP_CONFIG.zoom)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-b-lg" 
        style={{ minHeight: "300px" }} 
      />

      {/* Легенда и кнопка сброса */}
      {showLegend && (
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
          {showResetButton && (
            <button
              onClick={handleResetView}
              className="w-full text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
            >
              Сброс
            </button>
          )}
        </div>
      )}

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


