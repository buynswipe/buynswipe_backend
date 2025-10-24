import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    const { subscription } = await req.json()

    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Store push subscription
    const { error } = await supabase.from("push_subscriptions").insert([
      {
        user_id: session.user.id,
        subscription: subscription,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error("Subscription error:", error)
    return Response.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}
