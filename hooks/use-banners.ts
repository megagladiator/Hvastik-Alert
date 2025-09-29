import { useState, useEffect } from 'react'

interface Banner {
  id: string
  title: string
  description: string
  image_url: string
  link_url: string
  type: 'veterinary' | 'shelter' | 'shop' | 'service'
  priority: number
  is_active: boolean
  start_date: string
  end_date: string
  contact_info?: {
    phone?: string
    address?: string
    workingHours?: string
  }
  style?: {
    backgroundColor?: string
    textColor?: string
    borderColor?: string
  }
  created_at: string
  updated_at: string
}

interface UseBannersOptions {
  type?: string
  limit?: number
  activeOnly?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useBanners(options: UseBannersOptions = {}) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    type,
    limit,
    activeOnly = true,
    autoRefresh = false,
    refreshInterval = 30000 // 30 секунд
  } = options

  const fetchBanners = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (type) params.append('type', type)
      if (limit) params.append('limit', limit.toString())
      if (!activeOnly) params.append('activeOnly', 'false')

      const response = await fetch(`/api/banners?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setBanners(data.banners || [])
    } catch (err) {
      console.error('Error fetching banners:', err)
      setError(err instanceof Error ? err.message : 'Ошибка загрузки баннеров')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()

    let interval: NodeJS.Timeout | null = null
    if (autoRefresh) {
      interval = setInterval(fetchBanners, refreshInterval)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [type, limit, activeOnly, autoRefresh, refreshInterval])

  const createBanner = async (bannerData: Omit<Banner, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bannerData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setBanners(prev => [data.banner, ...prev])
      return data.banner
    } catch (err) {
      console.error('Error creating banner:', err)
      setError(err instanceof Error ? err.message : 'Ошибка создания баннера')
      throw err
    }
  }

  const updateBanner = async (id: string, updates: Partial<Banner>) => {
    try {
      const response = await fetch(`/api/banners/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setBanners(prev => prev.map(banner => 
        banner.id === id ? data.banner : banner
      ))
      return data.banner
    } catch (err) {
      console.error('Error updating banner:', err)
      setError(err instanceof Error ? err.message : 'Ошибка обновления баннера')
      throw err
    }
  }

  const deleteBanner = async (id: string) => {
    try {
      const response = await fetch(`/api/banners/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setBanners(prev => prev.filter(banner => banner.id !== id))
    } catch (err) {
      console.error('Error deleting banner:', err)
      setError(err instanceof Error ? err.message : 'Ошибка удаления баннера')
      throw err
    }
  }

  const getBannersByType = (type: string) => {
    return banners.filter(banner => banner.type === type)
  }

  const getActiveBanners = () => {
    const now = new Date().toISOString()
    return banners.filter(banner => 
      banner.is_active && 
      banner.start_date <= now && 
      banner.end_date >= now
    )
  }

  const getBannersByPriority = () => {
    return [...banners].sort((a, b) => b.priority - a.priority)
  }

  return {
    banners,
    loading,
    error,
    refetch: fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    getBannersByType,
    getActiveBanners,
    getBannersByPriority
  }
}
