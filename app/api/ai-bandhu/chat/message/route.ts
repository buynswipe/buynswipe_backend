import { createServerSupabaseClient } from "@/lib/supabase-server"
import { generateAIResponse, saveMessage, getConversationHistory } from "@/lib/ai-bandhu/chat-service"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Parse request body
    const { conversationId, message, language = "en" } = await request.json()

    if (!conversationId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify conversation belongs to user
    const { data: conversation, error: convError } = await supabase
      .from("ai_bandhu_conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", session.user.id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Save user message
    await saveMessage(conversationId, "user", message, session.user.id)

    // Get conversation history
    const history = await getConversationHistory(conversationId)

    // Generate AI response
    const aiResponse = await generateAIResponse(message, history, profile.role, language)

    // Save AI response
    const savedAIMessage = await saveMessage(conversationId, "ai", aiResponse)

    return NextResponse.json({
      success: true,
      userMessage: message,
      aiMessage: aiResponse,
      messageId: savedAIMessage.id,
    })
  } catch (error: any) {
    console.error("Chat error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
