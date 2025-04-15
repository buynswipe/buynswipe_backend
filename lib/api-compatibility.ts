import { createClient } from "@supabase/supabase-js"

// This function creates a Supabase client that can be used in both Pages and App Router
export function createCompatibleSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!,
  )
}

// Helper function to get session from request headers (for Pages API routes)
export async function getSessionFromRequest(req: any) {
  const supabase = createCompatibleSupabaseClient()

  // Try to get the session from the request cookies
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
