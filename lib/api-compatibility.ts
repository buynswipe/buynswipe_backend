import { createClient } from "@supabase/supabase-js"
import type { NextApiRequest } from "next"

/**
 * Creates a Supabase client that works in both Pages Router and App Router
 */
export function createCompatibleSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient(supabaseUrl, supabaseKey)
}

/**
 * Gets the session from a Next.js API request
 */
export async function getSessionFromRequest(req: NextApiRequest) {
  const supabase = createCompatibleSupabaseClient()

  // Try to get the token from the Authorization header
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1]

    const { data, error } = await supabase.auth.getUser(token)
    if (!error && data.user) {
      return { user: data.user }
    }
  }

  // Try to get the token from cookies
  const authCookie = req.cookies["sb-auth-token"] || req.cookies["supabase-auth-token"]
  if (authCookie) {
    try {
      const { data, error } = await supabase.auth.getUser(authCookie)
      if (!error && data.user) {
        return { user: data.user }
      }
    } catch (e) {
      console.error("Error getting session from cookie:", e)
    }
  }

  return null
}
