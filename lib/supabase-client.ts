import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Client-side client for client components
export const createClientSupabaseClient = () => {
  return createClientComponentClient()
}

// Public client for client-side operations
export const createPublicClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing public Supabase environment variables")
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}
