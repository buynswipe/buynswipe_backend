-- Add updated_at column to delivery_partners table
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
