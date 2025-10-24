import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

interface ParsedIntent {
  action: "add" | "remove" | "update" | "view" | "checkout" | "search"
  product?: string
  quantity?: number
  message: string
  cartUpdate?: {
    productId?: string
    quantity: number
    action: string
  }
}

export async function POST(request: Request) {
  try {
    const { command } = await request.json()

    if (!command || typeof command !== "string") {
      return Response.json({
        message: "कृपया एक वैध कमांड दें। Please provide a valid command.",
        cartUpdate: null,
      })
    }

    // Get user session to fetch products
    const supabase = createServerComponentClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    let products: any[] = []
    if (session) {
      const { data } = await supabase.from("products").select("id, name, price, description").limit(50)
      products = data || []
    }

    // Parse intent using AI SDK with GPT-4
    const systemPrompt = `You are AI Bandhu, a helpful shopping assistant for Indian retailers. 
You understand mixed Hindi-English commands.
Parse the user's command and extract:
1. ACTION: 'add', 'remove', 'update', 'view', 'checkout', or 'search'
2. PRODUCT: Name of the product (e.g., "Tata Salt", "Parle-G")
3. QUANTITY: Number of units
4. CONFIDENCE: How confident you are (0-1)

Available products: ${JSON.stringify(products.map((p) => p.name))}

Respond ONLY with JSON format:
{
  "action": "add|remove|update|view|checkout|search",
  "product": "Product Name" or null,
  "quantity": number or null,
  "confidence": 0.0-1.0,
  "message": "Friendly response in mixed Hindi-English"
}

Examples:
- "10 packet Tata Salt order करो" → {"action":"add","product":"Tata Salt","quantity":10,"confidence":0.95,"message":"ठीक है! 10 पैकेट Tata Salt आपके कार्ट में जोड़ दिया गया है। ✅"}
- "Remove 2 Surf Excel" → {"action":"remove","product":"Surf Excel","quantity":2,"confidence":0.9,"message":"2 Surf Excel को हटा दिया गया है। 🗑️"}
- "क्या आपके पास biscuits हैं?" → {"action":"search","product":"biscuits","quantity":null,"confidence":0.8,"message":"हाँ! हमारे पास Parle-G, Marie Gold और अन्य बिस्कुट हैं।"}`

    const { text } = await generateText({
      model: openai("gpt-4-turbo"),
      system: systemPrompt,
      prompt: command,
    })

    // Parse the JSON response
    let intent: ParsedIntent
    try {
      const parsed = JSON.parse(text)
      intent = {
        action: parsed.action,
        product: parsed.product,
        quantity: parsed.quantity,
        message: parsed.message || "कमांड प्रोसेस किया गया। Command processed.",
        cartUpdate:
          parsed.action === "add" || parsed.action === "remove"
            ? {
                quantity: parsed.quantity || 1,
                action: parsed.action,
              }
            : undefined,
      }
    } catch {
      intent = {
        action: "view",
        message: "क्षमा करें, मुझे समझ नहीं आया। Sorry, I didn't understand. कृपया फिर से प्रयास करें।",
      }
    }

    return Response.json(intent)
  } catch (error) {
    console.error("AI Bandhu error:", error)
    return Response.json(
      {
        message: "क्षमा करें, कुछ गलत हुआ। Sorry, something went wrong. कृपया बाद में प्रयास करें।",
        cartUpdate: null,
      },
      { status: 500 },
    )
  }
}
