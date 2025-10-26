import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { AIBandhuConversation, AIBandhuMessage, AIBandhuInsight } from "./types"

let supabaseClient: ReturnType<typeof createClientComponentClient> | null = null

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient()
  }
  return supabaseClient
}

export async function createConversation(title: string | null, language: "en" | "hi" = "en") {
  const supabase = getSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("ai_bandhu_conversations")
    .insert({
      user_id: session.user.id,
      title,
      language,
    })
    .select()
    .single()

  if (error) throw error
  return data as AIBandhuConversation
}

export async function getConversations(limit = 20) {
  const supabase = getSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("ai_bandhu_conversations")
    .select("*")
    .eq("user_id", session.user.id)
    .order("updated_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as AIBandhuConversation[]
}

export async function getConversationMessages(conversationId: string) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("ai_bandhu_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return data as AIBandhuMessage[]
}

export async function addMessage(
  conversationId: string,
  content: string,
  messageType: "text" | "voice" | "command" | "suggestion" = "text",
) {
  const supabase = getSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("ai_bandhu_messages")
    .insert({
      conversation_id: conversationId,
      sender_type: "user",
      sender_id: session.user.id,
      content,
      message_type: messageType,
    })
    .select()
    .single()

  if (error) throw error
  return data as AIBandhuMessage
}

export async function addAIMessage(conversationId: string, content: string) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("ai_bandhu_messages")
    .insert({
      conversation_id: conversationId,
      sender_type: "ai",
      content,
      message_type: "text",
    })
    .select()
    .single()

  if (error) throw error
  return data as AIBandhuMessage
}

export async function getInsights(limit = 10) {
  const supabase = getSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("ai_bandhu_insights")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as AIBandhuInsight[]
}

export async function markInsightAsRead(insightId: string) {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from("ai_bandhu_insights").update({ is_read: true }).eq("id", insightId)

  if (error) throw error
}
