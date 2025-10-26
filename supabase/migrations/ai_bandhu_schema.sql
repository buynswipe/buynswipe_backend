-- AI Bandhu Database Schema
-- This migration creates tables for the AI Bandhu assistant system

-- Create ai_bandhu_conversations table
CREATE TABLE IF NOT EXISTS ai_bandhu_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'hi')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create ai_bandhu_messages table
CREATE TABLE IF NOT EXISTS ai_bandhu_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES ai_bandhu_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'ai', 'system')),
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'hi')),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'command', 'suggestion')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create ai_bandhu_voice_logs table
CREATE TABLE IF NOT EXISTS ai_bandhu_voice_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES ai_bandhu_conversations(id) ON DELETE SET NULL,
  audio_duration_seconds FLOAT,
  transcribed_text TEXT,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'hi')),
  confidence_score FLOAT,
  status TEXT DEFAULT 'processed' CHECK (status IN ('processing', 'processed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create ai_bandhu_insights table
CREATE TABLE IF NOT EXISTS ai_bandhu_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('order', 'inventory', 'delivery', 'recommendation', 'alert')),
  title TEXT NOT NULL,
  description TEXT,
  data JSONB NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create ai_bandhu_user_preferences table
CREATE TABLE IF NOT EXISTS ai_bandhu_user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi')),
  voice_enabled BOOLEAN DEFAULT TRUE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  auto_suggestions BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_ai_bandhu_conversations_user_id ON ai_bandhu_conversations(user_id);
CREATE INDEX idx_ai_bandhu_conversations_created_at ON ai_bandhu_conversations(created_at DESC);
CREATE INDEX idx_ai_bandhu_messages_conversation_id ON ai_bandhu_messages(conversation_id);
CREATE INDEX idx_ai_bandhu_messages_created_at ON ai_bandhu_messages(created_at DESC);
CREATE INDEX idx_ai_bandhu_voice_logs_user_id ON ai_bandhu_voice_logs(user_id);
CREATE INDEX idx_ai_bandhu_insights_user_id ON ai_bandhu_insights(user_id);
CREATE INDEX idx_ai_bandhu_insights_created_at ON ai_bandhu_insights(created_at DESC);

-- Enable Row Level Security
ALTER TABLE ai_bandhu_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_bandhu_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_bandhu_voice_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_bandhu_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_bandhu_user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_bandhu_conversations
CREATE POLICY "Users can view their own conversations" ON ai_bandhu_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations" ON ai_bandhu_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON ai_bandhu_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" ON ai_bandhu_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ai_bandhu_messages
CREATE POLICY "Users can view messages in their conversations" ON ai_bandhu_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ai_bandhu_conversations
      WHERE ai_bandhu_conversations.id = ai_bandhu_messages.conversation_id
      AND ai_bandhu_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations" ON ai_bandhu_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_bandhu_conversations
      WHERE ai_bandhu_conversations.id = ai_bandhu_messages.conversation_id
      AND ai_bandhu_conversations.user_id = auth.uid()
    )
  );

-- RLS Policies for ai_bandhu_voice_logs
CREATE POLICY "Users can view their own voice logs" ON ai_bandhu_voice_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create voice logs" ON ai_bandhu_voice_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_bandhu_insights
CREATE POLICY "Users can view their own insights" ON ai_bandhu_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create insights" ON ai_bandhu_insights
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own insights" ON ai_bandhu_insights
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for ai_bandhu_user_preferences
CREATE POLICY "Users can view their own preferences" ON ai_bandhu_user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create preferences" ON ai_bandhu_user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON ai_bandhu_user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_bandhu_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_ai_bandhu_conversations_updated_at
BEFORE UPDATE ON ai_bandhu_conversations
FOR EACH ROW
EXECUTE FUNCTION update_ai_bandhu_conversations_updated_at();
