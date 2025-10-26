import { createServerSupabaseClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conversationId, transcribedText, language, confidenceScore, durationSeconds } = await request.json()

    if (!transcribedText || !language) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify conversation belongs to user
    const { data: conversation } = await supabase
      .from("ai_bandhu_conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", session.user.id)
      .single()

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Log voice interaction
    const { data: voiceLog, error } = await supabase
      .from("ai_bandhu_voice_logs")
      .insert({
        user_id: session.user.id,
        conversation_id: conversationId,
        transcribed_text: transcribedText,
        language,
        confidence_score: confidenceScore,
        audio_duration_seconds: durationSeconds,
        status: "processed",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ voiceLog }, { status: 201 })
  } catch (error: any) {
    console.error("Voice logging error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
