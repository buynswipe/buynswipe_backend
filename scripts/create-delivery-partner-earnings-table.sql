-- Create delivery_partner_earnings table if it doesn't exist
CREATE TABLE IF NOT EXISTS delivery_partner_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_partner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_delivery_partner_earnings_delivery_partner_id ON delivery_partner_earnings(delivery_partner_id);
CREATE INDEX IF NOT EXISTS idx_delivery_partner_earnings_order_id ON delivery_partner_earnings(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_partner_earnings_status ON delivery_partner_earnings(status);

-- Create RLS policies
ALTER TABLE delivery_partner_earnings ENABLE ROW LEVEL SECURITY;

-- Policy for delivery partners to view their own earnings
CREATE POLICY delivery_partner_select_own_earnings ON delivery_partner_earnings
  FOR SELECT
  USING (auth.uid() = delivery_partner_id);

-- Policy for admins to manage all earnings
CREATE POLICY admin_manage_all_earnings ON delivery_partner_earnings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
