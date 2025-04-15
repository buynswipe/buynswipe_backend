import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { recipientId, message, orderId } = await request.json()

    if (!recipientId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Find or create conversation
    let conversationId: string

    const { data: existingConversation } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(user_id.eq.${session.user.id},participant_id.eq.${recipientId}),and(user_id.eq.${recipientId},participant_id.eq.${session.user.id})`,
      )
      .maybeSingle()

    if (existingConversation) {
      conversationId = existingConversation.id
    } else {
      // Create new conversation
      const { data: newConversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          user_id: session.user.id,
          participant_id: recipientId,
          last_message: message,
          unread_count: 1,
        })
        .select()
        .single()

      if (convError) {
        return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
      }

      conversationId = newConversation.id
    }

    // Insert message
    const { error: msgError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: session.user.id,
      recipient_id: recipientId,
      content: message,
      order_id: orderId || null,
      read: false,
    })

    if (msgError) {
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    // Update conversation
    await supabase
      .from("conversations")
      .update({
        last_message: message,
        updated_at: new Date().toISOString(),
        unread_count: supabase.sql`unread_count + 1`,
      })
      .eq("id", conversationId)

    // Create notification for recipient
    await supabase.from("notifications").insert({
      user_id: recipientId,
      title: "New Message",
      message: message.length > 50 ? message.substring(0, 50) + "..." : message,
      type: "message",
      is_read: false,
      data: { conversationId, orderId },
    })

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
