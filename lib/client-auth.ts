import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export const supabaseClient = createClientComponentClient()

export async function getClientSession() {
  try {
    const {
      data: { session },
    } = await supabaseClient.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting client session:", error)
    return null
  }
}

export async function requireClientAuth() {
  const session = await getClientSession()
  if (!session) {
    window.location.href = "/login"
    return null
  }
  return session
}
