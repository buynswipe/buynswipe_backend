-- AI Conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('retailer', 'wholesaler', 'delivery_partner')),
  user_message TEXT NOT NULL,
  assistant_response TEXT NOT NULL,
  detected_language TEXT CHECK (detected_language IN ('hi', 'en')),
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_role ON ai_conversations(role);
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at DESC);

-- AB Testing experiments table
CREATE TABLE IF NOT EXISTS ab_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  variant_a_name TEXT NOT NULL,
  variant_b_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  weight_a DECIMAL(3,2) DEFAULT 0.5,
  weight_b DECIMAL(3,2) DEFAULT 0.5,
  created_at TIMESTAMP DEFAULT NOW(),
  ends_at TIMESTAMP,
  created_by TEXT
);

-- AB Test assignments
CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES ab_experiments(id),
  user_id TEXT NOT NULL,
  assigned_variant TEXT NOT NULL CHECK (assigned_variant IN ('a', 'b')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ab_test_assignments_experiment_id ON ab_test_assignments(experiment_id);
CREATE INDEX idx_ab_test_assignments_user_id ON ab_test_assignments(user_id);

-- AB Test events (conversions)
CREATE TABLE IF NOT EXISTS ab_test_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES ab_experiments(id),
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_value DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ab_test_events_experiment_id ON ab_test_events(experiment_id);
CREATE INDEX idx_ab_test_events_user_id ON ab_test_events(user_id);

-- Enable RLS
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own conversations"
  ON ai_conversations FOR SELECT
  USING (user_id = current_user_id());

CREATE POLICY "Admins can view all experiments"
  ON ab_experiments FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');
