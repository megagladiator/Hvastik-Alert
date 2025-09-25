import { MapConfig, MarkerConfig } from './types'

// Конфигурация карты по умолчанию для Анапы
export const DEFAULT_MAP_CONFIG: MapConfig = {
  center: [44.89, 37.32], // Координаты Анапы
  zoom: 11,
  tileLayer: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: "© OpenStreetMap contributors",
  maxZoom: 19
}

// Конфигурация маркеров
export const MARKER_CONFIG: MarkerConfig = {
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  className: 'custom-marker'
}

// URL для загрузки Leaflet
export const LEAFLET_CONFIG = {
  cssUrl: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  jsUrl: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  cssIntegrity: "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=",
  jsIntegrity: "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
}


