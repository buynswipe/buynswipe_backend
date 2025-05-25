import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Server-side auth helper (only for app/ directory)
export async function getServerSession() {
  try {
    const supabase = createServerComponentClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting server session:", error)
    return null
  }
}

// Client-side auth helper (for pages/ directory and client components)
export function getClientSession() {
  // This should be used with createClientComponentClient
  return null // Placeholder - actual implementation should use client-side auth
}

export async function requireAuth() {
  const session = await getServerSession()
  if (!session) {
    redirect("/login")
  }
  return session
}
