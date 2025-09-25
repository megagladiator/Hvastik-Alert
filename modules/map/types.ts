// Типы для работы с картами
export interface Pet {
  id: string
  name: string
  type: 'lost' | 'found'
  species: string
  breed?: string
  age?: string
  color?: string
  description?: string
  location?: string
  latitude: number
  longitude: number
  image_url?: string
  contact_info?: string
  created_at: string
  updated_at: string
  user_id: string
}

export interface MapConfig {
  center: [number, number]
  zoom: number
  tileLayer: string
  attribution: string
  maxZoom: number
}

export interface MarkerConfig {
  iconSize: [number, number]
  iconAnchor: [number, number]
  className: string
}

export interface MapInstance {
  setView: (center: [number, number], zoom: number) => void
  removeLayer: (layer: any) => void
  addLayer: (layer: any) => void
}

export interface LeafletInstance {
  map: (element: HTMLElement) => MapInstance
  tileLayer: (url: string, options: any) => any
  divIcon: (options: any) => any
  marker: (latlng: [number, number], options?: any) => any
  Icon: {
    Default: {
      prototype: any
      mergeOptions: (options: any) => void
    }
  }
}


