import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Export auth function for compatibility
export const auth = async () => {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  return {
    user: session.user,
    expires: new Date(session.expires_at || 0).toISOString(),
  }
}

// Re-export from lib/auth for convenience
export { authOptions } from "./lib/auth"
