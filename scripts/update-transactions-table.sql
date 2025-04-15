-- Add external_reference column to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS external_reference VARCHAR(255);

-- Add payment_reference column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255);

-- Create index on payment_reference for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON orders(payment_reference);

-- Update RLS policies to allow access to payment_reference
ALTER POLICY "Enable read access for authenticated users" ON orders
  USING (auth.uid() = retailer_id OR auth.uid() = wholesaler_id OR 
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
