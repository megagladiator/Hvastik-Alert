// Экспорт всех компонентов и утилит модуля карт
export { PetMap, default as PetMapDefault } from './PetMap'
export { SinglePetMap, default as SinglePetMapDefault } from './SinglePetMap'

// Экспорт типов
export type { 
  Pet, 
  MapConfig, 
  MarkerConfig, 
  MapInstance, 
  LeafletInstance 
} from './types'

// Экспорт утилит
export {
  createPetMarkerIcon,
  createPetPopup,
  initializeMap,
  addPetMarkers,
  clearMarkers,
  setMapCenter,
  isValidCoordinates,
  calculateCenter
} from './map-utils'

// Экспорт загрузчика Leaflet
export { loadLeaflet, loadLeafletCSS, loadLeafletJS } from './leaflet-loader'

// Экспорт конфигурации
export { 
  DEFAULT_MAP_CONFIG, 
  MARKER_CONFIG, 
  LEAFLET_CONFIG 
} from './config'


