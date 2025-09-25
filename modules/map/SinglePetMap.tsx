"use client"

import { useRef, useEffect } from "react"
import { MapPin } from "lucide-react"
import { Pet } from './types'
import { loadLeaflet } from './leaflet-loader'
import { initializeMap, createPetMarkerIcon, createPetPopup } from './map-utils'

interface SinglePetMapProps {
  pet: Pet
  className?: string
  zoom?: number
}

export function SinglePetMap({ 
  pet, 
  className = "w-full h-full", 
  zoom = 15 
}: SinglePetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

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
          mapInstanceRef.current = initializeMap(L, mapRef.current, {
            center: [pet.latitude, pet.longitude],
            zoom: zoom,
            tileLayer: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            attribution: "© OpenStreetMap contributors",
            maxZoom: 19
          })

          // Добавляем маркер для питомца
          const icon = createPetMarkerIcon(L, pet)
          const marker = L.marker([pet.latitude, pet.longitude], { icon })
            .addTo(mapInstanceRef.current)
            .bindPopup(createPetPopup(pet))

          // Открываем всплывающую подсказку
          marker.openPopup()
        }

      } catch (error) {
        console.error('Failed to initialize single pet map:', error)
      }
    }

    initializeMapComponent()
  }, [pet, zoom])

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg" 
        style={{ minHeight: "300px" }} 
      />

      {!pet.latitude || !pet.longitude ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Координаты не указаны</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default SinglePetMap


