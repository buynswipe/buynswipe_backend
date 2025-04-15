-- Function to create conversations table
CREATE OR REPLACE FUNCTION create_conversations_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'escalated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Add RLS policies
  ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

  -- Policy for users to see their own conversations
  DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
  CREATE POLICY "Users can view their own conversations"
    ON conversations FOR SELECT
    USING (auth.uid() = user_id);

  -- Policy for users to insert their own conversations
  DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;
  CREATE POLICY "Users can insert their own conversations"
    ON conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  -- Policy for users to update their own conversations
  DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
  CREATE POLICY "Users can update their own conversations"
    ON conversations FOR UPDATE
    USING (auth.uid() = user_id);

  -- Policy for admins to view all conversations
  DROP POLICY IF EXISTS "Admins can view all conversations" ON conversations;
  CREATE POLICY "Admins can view all conversations"
    ON conversations FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );

  -- Policy for admins to update all conversations
  DROP POLICY IF EXISTS "Admins can update all conversations" ON conversations;
  CREATE POLICY "Admins can update all conversations"
    ON conversations FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
END;
$$;

-- Function to create messages table
CREATE OR REPLACE FUNCTION create_messages_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    feedback VARCHAR(20) CHECK (feedback IN ('helpful', 'not_helpful')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Add RLS policies
  ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

  -- Policy for users to see messages in their conversations
  DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
  CREATE POLICY "Users can view messages in their conversations"
    ON messages FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM conversations
        WHERE conversations.id = messages.conversation_id
        AND conversations.user_id = auth.uid()
      )
    );

  -- Policy for users to insert messages in their conversations
  DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
  CREATE POLICY "Users can insert messages in their conversations"
    ON messages FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM conversations
        WHERE conversations.id = messages.conversation_id
        AND conversations.user_id = auth.uid()
      )
    );

  -- Policy for admins to view all messages
  DROP POLICY IF EXISTS "Admins can view all messages" ON messages;
  CREATE POLICY "Admins can view all messages"
    ON messages FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );

  -- Policy for admins to insert messages in any conversation
  DROP POLICY IF EXISTS "Admins can insert messages in any conversation" ON messages;
  CREATE POLICY "Admins can insert messages in any conversation"
    ON messages FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
END;
$$;

-- Function to create chat_feedback table
CREATE OR REPLACE FUNCTION create_chat_feedback_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS chat_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feedback VARCHAR(20) NOT NULL CHECK (feedback IN ('helpful', 'not_helpful')),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Add RLS policies
  ALTER TABLE chat_feedback ENABLE ROW LEVEL SECURITY;

  -- Policy for users to see their own feedback
  DROP POLICY IF EXISTS "Users can view their own feedback" ON chat_feedback;
  CREATE POLICY "Users can view their own feedback"
    ON chat_feedback FOR SELECT
    USING (auth.uid() = user_id);

  -- Policy for users to insert their own feedback
  DROP POLICY IF EXISTS "Users can insert their own feedback" ON chat_feedback;
  CREATE POLICY "Users can insert their own feedback"
    ON chat_feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  -- Policy for admins to view all feedback
  DROP POLICY IF EXISTS "Admins can view all feedback" ON chat_feedback;
  CREATE POLICY "Admins can view all feedback"
    ON chat_feedback FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
END;
$$;

-- Function to create suggested_responses table
CREATE OR REPLACE FUNCTION create_suggested_responses_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS suggested_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL,
    query_pattern TEXT NOT NULL,
    response_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Add RLS policies
  ALTER TABLE suggested_responses ENABLE ROW LEVEL SECURITY;

  -- Policy for all authenticated users to view suggested responses
  DROP POLICY IF EXISTS "All users can view suggested responses" ON suggested_responses;
  CREATE POLICY "All users can view suggested responses"
    ON suggested_responses FOR SELECT
    USING (auth.role() = 'authenticated');

  -- Policy for admins to manage suggested responses
  DROP POLICY IF EXISTS "Admins can manage suggested responses" ON suggested_responses;
  CREATE POLICY "Admins can manage suggested responses"
    ON suggested_responses FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
END;
$$;
