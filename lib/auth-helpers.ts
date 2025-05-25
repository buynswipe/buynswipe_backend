import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Client-only auth helper - no server dependencies
export function createSupabaseClient() {
  return createClientComponentClient()
}

export async function getClientSession() {
  try {
    const supabase = createClientComponentClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting client session:", error)
    return null
  }
}

export async function requireClientAuth() {
  const session = await getClientSession()
  if (!session) {
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    return null
  }
  return session
}

// Profile helper
export async function getUserProfile(userId: string) {
  try {
    const supabase = createClientComponentClient()
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}
