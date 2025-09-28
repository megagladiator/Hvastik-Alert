import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { AuthConfig } from './types'
import { DEFAULT_AUTH_CONFIG } from './config'

// Клиент для браузера (публичный)
export const createSupabaseClient = (config: AuthConfig = DEFAULT_AUTH_CONFIG): SupabaseClient => {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key are required')
  }

  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
}

// Админ клиент для сервера (с service role key)
export const createSupabaseAdminClient = (config: AuthConfig = DEFAULT_AUTH_CONFIG): SupabaseClient => {
  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    throw new Error('Supabase URL and Service Role Key are required for admin client')
  }

  return createClient(config.supabaseUrl, config.supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Безопасный админ клиент с fallback
export const createSafeSupabaseAdminClient = (config: AuthConfig = DEFAULT_AUTH_CONFIG) => {
  const adminClient = createSupabaseAdminClient(config)
  
  return adminClient || {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
          single: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
        }),
      }),
      insert: () => ({
        select: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
        single: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      }),
      update: () => ({
        eq: () => ({
          select: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
        }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      }),
    }),
    auth: {
      admin: {
        listUsers: () => Promise.resolve({ data: { users: [] }, error: new Error("Supabase not configured") }),
        getUserByEmail: () => Promise.resolve({ data: { user: null }, error: new Error("Supabase not configured") }),
        deleteUser: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
        updateUserById: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      }
    }
  }
}




