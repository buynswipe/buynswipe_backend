-- Create delivery_updates table if it doesn't exist
CREATE TABLE IF NOT EXISTS delivery_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'dispatched', 'in_transit', 'out_for_delivery', 'delivered')),
  location TEXT,
  notes TEXT,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add any additional constraints or indexes
  CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_delivery_updates_order_id ON delivery_updates(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_updates_status ON delivery_updates(status);
CREATE INDEX IF NOT EXISTS idx_delivery_updates_created_at ON delivery_updates(created_at);

-- Create RLS policies
ALTER TABLE delivery_updates ENABLE ROW LEVEL SECURITY;

-- Policy for selecting delivery updates
-- Anyone can view delivery updates for orders they're involved with
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'delivery_updates' AND policyname = 'select_delivery_updates'
  ) THEN
    CREATE POLICY select_delivery_updates ON delivery_updates
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM orders o
          WHERE o.id = order_id
          AND (
            o.retailer_id = auth.uid() OR
            o.wholesaler_id = auth.uid() OR
            o.delivery_partner_id = auth.uid() OR
            EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
          )
        )
      );
  END IF;
END
$$;

-- Policy for inserting delivery updates
-- Only delivery partners assigned to the order and admins can insert updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'delivery_updates' AND policyname = 'insert_delivery_updates'
  ) THEN
    CREATE POLICY insert_delivery_updates ON delivery_updates
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM orders o
          WHERE o.id = order_id
          AND (
            o.delivery_partner_id = auth.uid() OR
            EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
          )
        )
      );
  END IF;
END
$$;

-- Policy for updating delivery updates
-- Only the user who created the update or admins can update it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'delivery_updates' AND policyname = 'update_delivery_updates'
  ) THEN
    CREATE POLICY update_delivery_updates ON delivery_updates
      FOR UPDATE USING (
        updated_by = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
      );
  END IF;
END
$$;

-- Policy for deleting delivery updates
-- Only admins can delete updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'delivery_updates' AND policyname = 'delete_delivery_updates'
  ) THEN
    CREATE POLICY delete_delivery_updates ON delivery_updates
      FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
      );
  END IF;
END
$$;
