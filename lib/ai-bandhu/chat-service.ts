import { generateText } from "ai"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import type { AIBandhuMessage } from "./types"

const SYSTEM_PROMPTS = {
  retailer: `You are AI Bandhu, a helpful assistant for retail store owners in India. You help retailers with:
- Placing orders from wholesalers
- Finding products and best prices
- Managing inventory
- Tracking deliveries
- Getting business insights

Be friendly, professional, and provide practical advice. Respond in the user's preferred language (English or Hindi).
Keep responses concise and actionable.`,

  wholesaler: `You are AI Bandhu, a helpful assistant for wholesale distributors in India. You help wholesalers with:
- Managing orders from retailers
- Inventory management
- Delivery coordination
- Pricing strategies
- Business analytics

Be friendly, professional, and provide practical advice. Respond in the user's preferred language (English or Hindi).
Keep responses concise and actionable.`,

  delivery_partner: `You are AI Bandhu, a helpful assistant for delivery partners in India. You help delivery partners with:
- Tracking deliveries
- Route optimization
- Earnings management
- Performance tracking
- Customer communication

Be friendly, professional, and provide practical advice. Respond in the user's preferred language (English or Hindi).
Keep responses concise and actionable.`,
}

export async function generateAIResponse(
  userMessage: string,
  conversationHistory: AIBandhuMessage[],
  userRole: string,
  language: "en" | "hi" = "en",
): Promise<string> {
  try {
    const systemPrompt = SYSTEM_PROMPTS[userRole as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.retailer

    // Build conversation context
    const messages = conversationHistory
      .filter((msg) => msg.sender_type === "user" || msg.sender_type === "ai")
      .map((msg) => ({
        role: msg.sender_type === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      }))

    // Add current user message
    messages.push({
      role: "user" as const,
      content: userMessage,
    })

    // Generate response using AI SDK
    const { text } = await generateText({
      model: "openai/gpt-4-mini",
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 500,
    })

    return text
  } catch (error) {
    console.error("Error generating AI response:", error)
    throw new Error("Failed to generate AI response")
  }
}

export async function saveMessage(conversationId: string, senderType: "user" | "ai", content: string, userId?: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("ai_bandhu_messages")
    .insert({
      conversation_id: conversationId,
      sender_type: senderType,
      sender_id: senderType === "user" ? userId : null,
      content,
      message_type: "text",
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving message:", error)
    throw error
  }

  return data as AIBandhuMessage
}

export async function getConversationHistory(conversationId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("ai_bandhu_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching conversation history:", error)
    throw error
  }

  return data as AIBandhuMessage[]
}
