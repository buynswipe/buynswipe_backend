import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cache } from "react"
import { getSupabaseServiceConfig } from "./supabase-config"

export const createServerSupabaseClient = cache(() => {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
})

export const createServiceClient = () => {
  const { url, serviceRoleKey } = getSupabaseServiceConfig()
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// Legacy export for backward compatibility
export const createClient = createServiceClient
