import { createClient } from "@supabase/supabase-js"
import type { NextApiRequest } from "next"

// This function creates a Supabase client that works in both Pages Router and App Router
export function createCompatibleSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient(supabaseUrl, supabaseKey)
}

// This function gets the session from a Next.js API request
export async function getSessionFromRequest(req: NextApiRequest) {
  const supabase = createCompatibleSupabaseClient()

  // Extract the token from the request
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.split(" ")[1]

  // Verify the token
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    return null
  }

  return {
    user: data.user,
  }
}
