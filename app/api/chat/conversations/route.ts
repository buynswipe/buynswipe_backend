import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if conversations table exists
    try {
      const { error: tableCheckError } = await supabase.from("conversations").select("id").limit(1)

      if (tableCheckError) {
        // Table doesn't exist yet
        return NextResponse.json({
          conversations: [],
          message: "Chat tables not yet created. Please run the database migrations first.",
        })
      }
    } catch (error) {
      console.error("Error checking table existence:", error)
      return NextResponse.json({
        conversations: [],
        message: "Error checking database tables",
      })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") || "active"
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Fetch conversations
    const {
      data: conversations,
      error,
      count,
    } = await supabase
      .from("conversations")
      .select("*, messages!inner(*)", { count: "exact" })
      .eq("user_id", session.user.id)
      .eq("status", status)
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      conversations,
      count,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if conversations table exists
    try {
      const { error: tableCheckError } = await supabase.from("conversations").select("id").limit(1)

      if (tableCheckError) {
        // Table doesn't exist yet
        return NextResponse.json(
          {
            error: "Chat tables not yet created. Please run the database migrations first.",
          },
          { status: 400 },
        )
      }
    } catch (error) {
      console.error("Error checking table existence:", error)
      return NextResponse.json(
        {
          error: "Error checking database tables",
        },
        { status: 500 },
      )
    }

    // Parse request body
    const { title, language = "en" } = await request.json()

    // Create new conversation
    const { data: conversation, error } = await supabase
      .from("conversations")
      .insert({
        user_id: session.user.id,
        title: title || "New Conversation",
        status: "active",
        language,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Add welcome message
    const welcomeMessage = getWelcomeMessage(language)

    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversation.id,
        sender_type: "ai",
        content: welcomeMessage,
      })
      .select()
      .single()

    if (messageError) {
      throw messageError
    }

    return NextResponse.json({
      conversation,
      message,
    })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to get welcome message based on language
function getWelcomeMessage(language = "en"): string {
  switch (language) {
    case "hi":
      return "नमस्ते! रिटेल बंधु सहायता में आपका स्वागत है। मैं आपकी कैसे मदद कर सकता हूँ?"
    case "mr":
      return "नमस्कार! रिटेल बंधु सपोर्टमध्ये आपले स्वागत आहे. मी आपली कशी मदत करू शकतो?"
    case "gu":
      return "નમસ્તે! રિટેલ બંધુ સપોર્ટમાં આપનું સ્વાગત છે. હું આપની કેવી રીતે મદદ કરી શકું?"
    case "ta":
      return "வணக்கம்! ரீடெயில் பந்து ஆதரவில் வரவேற்கிறோம். நான் உங்களுக்கு எப்படி உதவ முடியும்?"
    case "te":
      return "నమస్కారం! రీటైల్ బంధు సపోర్ట్‌కి స్వాగతం. నేను మీకు ఎలా సహాయం చేయగలను?"
    default:
      return "Hello! Welcome to Retail Bandhu Support. How can I help you today?"
  }
}
