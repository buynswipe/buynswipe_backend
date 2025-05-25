import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cache } from "react"

// Use React cache to ensure we only create one client per request
// This should ONLY be used in Server Components
export const createServerSupabaseClient = cache(() => {
  return createServerComponentClient({ cookies })
})

// Service role client for server-side operations
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Alternative export for compatibility
export const createServerClient = createClient

// Helper to get current user in server components
export const getCurrentUserServer = async () => {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Error getting session:", error)
      return null
    }

    return session?.user || null
  } catch (error) {
    console.error("Error in getCurrentUserServer:", error)
    return null
  }
}

// Helper to get user profile in server components
export const getUserProfileServer = async (userId: string) => {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getUserProfileServer:", error)
    return null
  }
}
