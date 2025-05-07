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
    const { messageId, rating, comment } = await request.json()

    if (!messageId || ![-1, 1].includes(rating)) {
      return NextResponse.json({ error: "Invalid feedback data" }, { status: 400 })
    }

    // Verify the message exists
    const { data: message, error: messageError } = await supabase
      .from("chat_messages")
      .select("conversation_id")
      .eq("id", messageId)
      .single()

    if (messageError || !message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Verify the conversation belongs to the user
    const { data: conversation, error: conversationError } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("id", message.conversation_id)
      .eq("user_id", user.id)
      .single()

    if (conversationError || !conversation) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if feedback already exists
    const { data: existingFeedback } = await supabase
      .from("chat_feedback")
      .select("id")
      .eq("message_id", messageId)
      .eq("user_id", user.id)
      .single()

    if (existingFeedback) {
      // Update existing feedback
      const { error: updateError } = await supabase
        .from("chat_feedback")
        .update({
          rating,
          comment,
        })
        .eq("id", existingFeedback.id)

      if (updateError) {
        return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 })
      }
    } else {
      // Create new feedback
      const { error: insertError } = await supabase.from("chat_feedback").insert({
        message_id: messageId,
        user_id: user.id,
        rating,
        comment,
      })

      if (insertError) {
        return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in feedback API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
