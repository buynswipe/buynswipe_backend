import { createClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

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
    const { conversationId, content } = await request.json()

    if (!conversationId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the conversation belongs to the user
    const { data: conversation, error: conversationError } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single()

    if (conversationError || !conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Don't allow messages if conversation is closed
    if (conversation.status === "closed") {
      return NextResponse.json({ error: "Conversation is closed" }, { status: 400 })
    }

    // Insert the user message
    const { data: userMessage, error: userMessageError } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        role: "user",
        content,
      })
      .select()
      .single()

    if (userMessageError) {
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
    }

    // Get user profile for context
    const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    // Get conversation history
    const { data: messageHistory } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20)

    // Format messages for the AI
    const formattedHistory =
      messageHistory?.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })) || []

    // Prepare system prompt based on user role and language
    let systemPrompt = `You are a helpful assistant for Retail Bandhu, a B2B platform connecting retailers with wholesalers in India.
User role: ${userProfile?.role || "unknown"}
Language: ${conversation.language || "en"}

If the user asks about:
- Products: You can help with product information, inventory, and catalog management.
- Orders: You can help with order status, history, and management.
- Payments: You can explain payment methods, status, and issues.
- Returns: You can explain the return policy and process.
- Account: You can help with account settings and profile management.

Always be polite, concise, and helpful. If you don't know the answer, say so and offer to escalate to a human agent.
`

    // If language is not English, add translation instruction
    if (conversation.language && conversation.language !== "en") {
      systemPrompt += `
Please respond in ${getLanguageName(conversation.language)} language.`
    }

    // Generate AI response
    const { text: aiResponse } = await generateText({
      model: openai("gpt-4o"),
      messages: [{ role: "system", content: systemPrompt }, ...formattedHistory],
      temperature: 0.7,
      max_tokens: 500,
    })

    // Save the AI response
    const { data: assistantMessage, error: assistantMessageError } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        role: "assistant",
        content: aiResponse,
      })
      .select()
      .single()

    if (assistantMessageError) {
      return NextResponse.json({ error: "Failed to save AI response" }, { status: 500 })
    }

    // Update conversation timestamp
    await supabase.from("chat_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId)

    // Get all messages for the conversation
    const { data: allMessages } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    return NextResponse.json({
      messages: allMessages?.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.created_at,
      })),
    })
  } catch (error) {
    console.error("Error in chat message API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    mr: "Marathi",
    gu: "Gujarati",
    ta: "Tamil",
    te: "Telugu",
  }
  return languages[code] || "English"
}
