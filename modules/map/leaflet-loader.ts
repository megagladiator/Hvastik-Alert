import { LEAFLET_CONFIG } from './config'

// Функция для загрузки Leaflet CSS
export const loadLeafletCSS = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Проверяем, не загружен ли уже CSS
    if (document.querySelector('link[href*="leaflet"]')) {
      resolve()
      return
    }

    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = LEAFLET_CONFIG.cssUrl
    link.integrity = LEAFLET_CONFIG.cssIntegrity
    link.crossOrigin = ""
    
    link.onload = () => resolve()
    link.onerror = () => reject(new Error('Failed to load Leaflet CSS'))
    
    document.head.appendChild(link)
  })
}

// Функция для загрузки Leaflet JS
export const loadLeafletJS = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Проверяем, не загружен ли уже Leaflet
    if (typeof window !== "undefined" && (window as any).L) {
      resolve((window as any).L)
      return
    }

    const script = document.createElement("script")
    script.src = LEAFLET_CONFIG.jsUrl
    script.integrity = LEAFLET_CONFIG.jsIntegrity
    script.crossOrigin = ""
    
    script.onload = () => {
      const L = (window as any).L
      if (L) {
        // Исправляем иконки маркеров
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: LEAFLET_CONFIG.iconUrl,
          iconUrl: LEAFLET_CONFIG.iconUrl,
          shadowUrl: LEAFLET_CONFIG.shadowUrl,
        })
        resolve(L)
      } else {
        reject(new Error('Leaflet not loaded properly'))
      }
    }
    
    script.onerror = () => reject(new Error('Failed to load Leaflet JS'))
    
    document.head.appendChild(script)
  })
}

// Основная функция для загрузки Leaflet
export const loadLeaflet = async (): Promise<any> => {
  try {
    await loadLeafletCSS()
    const L = await loadLeafletJS()
    return L
  } catch (error) {
    console.error('Failed to load Leaflet:', error)
    throw error
  }
}


