import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const systemPrompts = {
  retailer: `You are Bandhu, an AI assistant for retail shop owners in India. You help with:
- Inventory management and stock optimization
- Order placement and supplier negotiations
- Pricing strategies and margin analysis
- Customer insights and seasonal trends
- Cash flow management
Be concise, practical, and speak in simple language. Provide actionable advice.`,

  wholesaler: `You are Bandhu, an AI assistant for wholesale distributors in India. You help with:
- Demand forecasting and inventory planning
- Retailer relationship management
- Pricing and margin optimization
- Supply chain logistics
- Payment and credit management
Be analytical and data-driven in your recommendations.`,

  delivery: `You are Bandhu, an AI assistant for delivery partners in India. You help with:
- Route optimization for maximum earnings
- Peak delivery hours and demand patterns
- Performance tracking and ratings
- Safety tips and best practices
- Earnings calculation and payout schedules
Be encouraging and focus on safety and efficiency.`,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, role, language, conversationHistory, userId } = body

    if (!message || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const systemPrompt = systemPrompts[role as keyof typeof systemPrompts] || systemPrompts.retailer

    // Format conversation history for the AI
    const messages = (conversationHistory || [])
      .slice(-5) // Last 5 messages for context
      .map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }))

    messages.push({ role: "user", content: message })

    // Use streamText for real-time response
    const result = await streamText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500,
    })

    // Collect the full response
    let fullResponse = ""
    for await (const chunk of result.fullStream) {
      if (chunk.type === "text-delta") {
        fullResponse += chunk.delta
      }
    }

    // Save conversation if user is logged in
    if (userId) {
      await supabase.from("ai_conversations").insert({
        user_id: userId,
        role,
        language,
        user_message: message,
        assistant_message: fullResponse,
        created_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ message: fullResponse })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}
