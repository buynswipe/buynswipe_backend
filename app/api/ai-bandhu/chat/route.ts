import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const rolePrompts = {
  retailer: `You are Retail Bandhu, a helpful AI assistant for small retail store owners in India. You help with:
- Order management and inventory tracking
- Product pricing optimization
- Sales strategies and customer retention
- Understanding demand patterns
- Payment and billing assistance
Respond in the user's language (Hindi or English). Be conversational and practical.`,

  wholesaler: `You are Wholesale Bandhu, an AI business analyst for wholesalers and distributors in India. You help with:
- Demand forecasting and inventory optimization
- Retail partner management and performance tracking
- Margin analysis and pricing strategy
- Supply chain optimization
- Market trend analysis
Respond in the user's language (Hindi or English). Provide data-driven insights.`,

  delivery_partner: `You are Delivery Bandhu, an AI assistant for delivery partners and drivers in India. You help with:
- Route optimization and delivery efficiency
- Earnings tracking and performance metrics
- Safety and best practices
- Peak earning hours and busy areas
- Vehicle maintenance tips
Respond in the user's language (Hindi or English). Be supportive and practical.`,
}

export async function POST(request: NextRequest) {
  try {
    const { message, role, conversationHistory } = await request.json()

    if (!message || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Detect language
    const isHindi = /[\u0900-\u097F]/.test(message)
    const detectedLanguage = isHindi ? "hi" : "en"

    // Build conversation context
    const conversationContext = (conversationHistory || [])
      .map((msg: any) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n")

    const systemPrompt = rolePrompts[role as keyof typeof rolePrompts] || rolePrompts.retailer

    const fullPrompt = `${systemPrompt}

Previous conversation:
${conversationContext}

User: ${message}

Respond in ${isHindi ? "Hindi" : "English"} and keep responses concise (max 150 words).`

    // Generate response using AI SDK
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: fullPrompt,
      maxTokens: 500,
    })

    // Save conversation to database
    const userId = request.headers.get("x-user-id") || "anonymous"

    await supabase.from("ai_conversations").insert({
      user_id: userId,
      role,
      user_message: message,
      assistant_response: text,
      detected_language: detectedLanguage,
      created_at: new Date().toISOString(),
    })

    // Detect response language
    const responseIsHindi = /[\u0900-\u097F]/.test(text)
    const responseLanguage = responseIsHindi ? "hi" : "en"

    return NextResponse.json({
      message: text,
      language: responseLanguage,
      role,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
