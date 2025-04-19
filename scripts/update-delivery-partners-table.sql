-- Add user_id column to delivery_partners table
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_delivery_partners_user_id ON delivery_partners(user_id);

-- Add earnings related columns
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS pending_payout DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS last_payout_date TIMESTAMP WITH TIME ZONE;

-- Add performance metrics
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS total_deliveries INTEGER DEFAULT 0;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS on_time_deliveries INTEGER DEFAULT 0;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2);
