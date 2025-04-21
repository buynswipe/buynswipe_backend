import { createClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the request body
    const { conversationId } = await request.json()

    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversation ID" }, { status: 400 })
    }

    // Verify the conversation belongs to the user
    if (!user.id) {
      return NextResponse.json({ error: "User ID is missing" }, { status: 400 })
    }
    const { data: conversation, error: conversationError } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single()

    if (conversationError || !conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Update conversation status to escalated
    const { data: updatedConversation, error: updateError } = await supabase
      .from("chat_conversations")
      .update({
        status: "escalated",
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: "Failed to escalate conversation" }, { status: 500 })
    }

    // Get user profile for notification
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("business_name, email, role")
      .eq("id", user.id)
      .single()

    // Notify admins (in a real implementation, this would send an email or push notification)
    console.log(`Conversation ${conversationId} escalated by ${userProfile?.business_name} (${userProfile?.email})`)

    return NextResponse.json({
      conversation: {
        id: updatedConversation.id,
        title: updatedConversation.title,
        status: updatedConversation.status,
        language: updatedConversation.language,
        updatedAt: updatedConversation.updated_at,
      },
    })
  } catch (error) {
    console.error("Error in escalate API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
