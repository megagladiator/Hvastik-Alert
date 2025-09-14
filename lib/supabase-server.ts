import { createClient } from "@supabase/supabase-js"

// Серверный клиент Supabase с service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Создаем серверный клиент только если есть service role key
export const supabaseServer = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null

// Функция для проверки существования пользователя
export async function checkUserExists(email: string) {
  if (!supabaseServer) {
    console.error('Supabase server client not initialized')
    return false
  }

  try {
    const { data, error } = await supabaseServer.auth.admin.getUserByEmail(email)
    return !error && !!data.user
  } catch (error) {
    console.error('Error checking user existence:', error)
    return false
  }
}
