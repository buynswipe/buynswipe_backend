import type { UserRole } from "@/types/database.types"

export type AIBandhuLanguage = "en" | "hi"
export type ConversationStatus = "active" | "closed" | "archived"
export type MessageSenderType = "user" | "ai" | "system"
export type MessageType = "text" | "voice" | "command" | "suggestion"
export type InsightType = "order" | "inventory" | "delivery" | "recommendation" | "alert"
export type InsightPriority = "low" | "normal" | "high" | "urgent"

export interface AIBandhuConversation {
  id: string
  user_id: string
  title: string | null
  language: AIBandhuLanguage
  status: ConversationStatus
  created_at: string
  updated_at: string
  metadata: Record<string, any>
}

export interface AIBandhuMessage {
  id: string
  conversation_id: string
  sender_type: MessageSenderType
  sender_id: string | null
  content: string
  language: AIBandhuLanguage
  message_type: MessageType
  created_at: string
  metadata: Record<string, any>
}

export interface AIBandhuVoiceLog {
  id: string
  user_id: string
  conversation_id: string | null
  audio_duration_seconds: number | null
  transcribed_text: string | null
  language: AIBandhuLanguage
  confidence_score: number | null
  status: "processing" | "processed" | "failed"
  created_at: string
  metadata: Record<string, any>
}

export interface AIBandhuInsight {
  id: string
  user_id: string
  insight_type: InsightType
  title: string
  description: string | null
  data: Record<string, any>
  priority: InsightPriority
  is_read: boolean
  created_at: string
  expires_at: string | null
  metadata: Record<string, any>
}

export interface AIBandhuUserPreferences {
  id: string
  user_id: string
  preferred_language: AIBandhuLanguage
  voice_enabled: boolean
  notifications_enabled: boolean
  auto_suggestions: boolean
  theme: "light" | "dark"
  created_at: string
  updated_at: string
}

export interface AIBandhuRoleConfig {
  role: UserRole
  dashboardPath: string
  features: string[]
  defaultLanguage: AIBandhuLanguage
}
