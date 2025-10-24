-- AB Testing Tables
CREATE TABLE IF NOT EXISTS ab_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  variants JSONB NOT NULL,
  target_metrics VARCHAR(255)[] DEFAULT ARRAY[]::VARCHAR[],
  status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_status (status),
  INDEX idx_created_at (created_at DESC)
);

CREATE TABLE IF NOT EXISTS ab_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES ab_experiments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  variant_id VARCHAR(255) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(experiment_id, user_id),
  INDEX idx_experiment_id (experiment_id),
  INDEX idx_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS ab_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES ab_experiments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_experiment_id (experiment_id),
  INDEX idx_user_id (user_id),
  INDEX idx_event_type (event_type),
  INDEX idx_timestamp (timestamp)
);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE ab_experiments;
ALTER PUBLICATION supabase_realtime ADD TABLE ab_events;
