import { createClient } from "@supabase/supabase-js"

// Admin client with service role key (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Safe admin client that won't cause build errors
export const safeSupabaseAdmin = supabaseAdmin || {
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
  }),
  auth: {
    admin: {
      listUsers: () => Promise.resolve({ data: { users: [] }, error: new Error("Supabase not configured") }),
      getUserByEmail: () => Promise.resolve({ data: { user: null }, error: new Error("Supabase not configured") }),
    }
  }
}