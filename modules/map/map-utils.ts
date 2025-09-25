import { Pet, MapConfig, MarkerConfig, LeafletInstance } from './types'
import { DEFAULT_MAP_CONFIG, MARKER_CONFIG } from './config'

// Создание иконки маркера для питомца
export const createPetMarkerIcon = (L: LeafletInstance, pet: Pet) => {
  return L.divIcon({
    className: MARKER_CONFIG.className,
    html: `
      <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ${
        pet.type === 'lost' ? 'bg-red-500' : 'bg-green-500'
      }">
        🐾
      </div>
    `,
    iconSize: MARKER_CONFIG.iconSize,
    iconAnchor: MARKER_CONFIG.iconAnchor
  })
}

// Создание всплывающей подсказки для питомца
export const createPetPopup = (pet: Pet): string => {
  return `
    <div class="text-center">
      <h3 class="font-bold text-lg">${pet.name}</h3>
      <p class="text-sm text-gray-600">${pet.type === 'lost' ? 'Потерялся' : 'Найден'}</p>
      ${pet.location ? `<p class="text-xs text-gray-500 mt-1">${pet.location}</p>` : ''}
      ${pet.species ? `<p class="text-xs text-gray-500">${pet.species}</p>` : ''}
      ${pet.breed ? `<p class="text-xs text-gray-500">${pet.breed}</p>` : ''}
    </div>
  `
}

// Инициализация карты
export const initializeMap = (
  L: LeafletInstance, 
  mapElement: HTMLElement, 
  config: MapConfig = DEFAULT_MAP_CONFIG
) => {
  const map = L.map(mapElement).setView(config.center, config.zoom)
  
  L.tileLayer(config.tileLayer, {
    attribution: config.attribution,
    maxZoom: config.maxZoom,
  }).addTo(map)
  
  return map
}

// Добавление маркеров питомцев на карту
export const addPetMarkers = (
  L: LeafletInstance,
  map: any,
  pets: Pet[]
): any[] => {
  const markers: any[] = []
  
  pets.forEach((pet) => {
    const icon = createPetMarkerIcon(L, pet)
    const marker = L.marker([pet.latitude, pet.longitude], { icon })
      .addTo(map)
      .bindPopup(createPetPopup(pet))
    
    markers.push(marker)
  })
  
  return markers
}

// Очистка маркеров с карты
export const clearMarkers = (map: any, markers: any[]) => {
  markers.forEach((marker) => {
    map.removeLayer(marker)
  })
}

// Установка центра карты
export const setMapCenter = (map: any, center: [number, number], zoom: number) => {
  map.setView(center, zoom)
}

// Проверка валидности координат
export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

// Вычисление центра для массива питомцев
export const calculateCenter = (pets: Pet[]): [number, number] => {
  if (pets.length === 0) {
    return DEFAULT_MAP_CONFIG.center
  }
  
  const validPets = pets.filter(pet => isValidCoordinates(pet.latitude, pet.longitude))
  
  if (validPets.length === 0) {
    return DEFAULT_MAP_CONFIG.center
  }
  
  const avgLat = validPets.reduce((sum, pet) => sum + pet.latitude, 0) / validPets.length
  const avgLng = validPets.reduce((sum, pet) => sum + pet.longitude, 0) / validPets.length
  
  return [avgLat, avgLng]
}


