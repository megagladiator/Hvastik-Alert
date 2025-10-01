import { createClient } from "@supabase/supabase-js"

// Use placeholder values if environment variables are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

// Only create client if we have real values
export const supabase = (supabaseUrl === "https://placeholder.supabase.co" || supabaseAnonKey === "placeholder-key") ? null : createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Create a safe client that won't throw errors
export const safeSupabase = supabase || {
  from: () => ({
    select: () => ({
      eq: () => ({
        order: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
        single: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }), // Added single for fetching a single row
      }),
    }),
    insert: () => ({
      select: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
    }),
    update: () => ({
      eq: () => ({
        select: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      }),
    }),
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: new Error("Supabase Storage not configured") }),
      getPublicUrl: () => ({ data: { publicUrl: "/placeholder.svg" } }),
    }),
  },
}

// Database schema for pets table
export interface Database {
  public: {
    Tables: {
      pets: {
        Row: {
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
          reward: number | null
          photo_url: string | null
          created_at: string
          status: "active" | "found" | "archived"
        }
        Insert: {
          id?: string
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
          reward?: number | null
          photo_url?: string | null
          created_at?: string
          status?: "active" | "found" | "archived"
        }
        Update: {
          id?: string
          type?: "lost" | "found"
          animal_type?: string
          breed?: string
          name?: string
          description?: string
          color?: string
          location?: string
          latitude?: number
          longitude?: number
          contact_phone?: string
          contact_name?: string
          reward?: number | null
          photo_url?: string | null
          created_at?: string
          status?: "active" | "found" | "archived"
        }
      }
      chats: {
        Row: {
          id: string
          pet_id: string
          user_id: string
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pet_id: string
          user_id: string
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pet_id?: string
          user_id?: string
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          sender_id: string
          sender_type: "user" | "owner"
          text: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          sender_id: string
          sender_type: "user" | "owner"
          text: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          sender_id?: string
          sender_type?: "user" | "owner"
          text?: string
          created_at?: string
          updated_at?: string
        }
      }
      app_settings: {
        Row: {
          id: string
          background_image_url: string | null
          background_darkening_percentage: number
          updated_at: string
        }
        Insert: {
          id?: string
          background_image_url?: string | null
          background_darkening_percentage?: number
          updated_at?: string
        }
        Update: {
          id?: string
          background_image_url?: string | null
          background_darkening_percentage?: number
          updated_at?: string
        }
      }
    }
  }
}

