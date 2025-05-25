import { createServerComponentClient, createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { cache } from "react"
import type { Database } from "@/types/database.types"

// Use React cache to ensure we only create one client per request
export const createServerSupabaseClient = cache(() => {
  return createServerComponentClient<Database>({ cookies })
})

// Create a service role client for admin operations
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Create route handler client for API routes
export const createRouteHandlerSupabaseClient = () => {
  return createRouteHandlerClient<Database>({ cookies })
}

// Helper to get server session
export async function getServerSession() {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting server session:", error)
    return null
  }
}

// Helper to get user profile on server
export async function getServerUserProfile(userId: string) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

// Helper to require authentication on server
export async function requireServerAuth() {
  const session = await getServerSession()
  if (!session) {
    throw new Error("Authentication required")
  }
  return session
}
