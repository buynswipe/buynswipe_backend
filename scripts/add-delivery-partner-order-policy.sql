-- First, check if the policy already exists and drop it if it does
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'orders' 
        AND policyname = 'Delivery partners can view assigned orders'
    ) THEN
        DROP POLICY "Delivery partners can view assigned orders" ON orders;
    END IF;
END
$$;

-- Create the policy to allow delivery partners to view orders assigned to them
CREATE POLICY "Delivery partners can view assigned orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'delivery_partner'
      AND EXISTS (
        SELECT 1 FROM delivery_partners 
        WHERE id = orders.delivery_partner_id 
        AND user_id = auth.uid()
      )
    )
  );

-- Add a policy for delivery partners to update orders they're assigned to
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'orders' 
        AND policyname = 'Delivery partners can update assigned orders'
    ) THEN
        DROP POLICY "Delivery partners can update assigned orders" ON orders;
    END IF;
END
$$;

CREATE POLICY "Delivery partners can update assigned orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'delivery_partner'
      AND EXISTS (
        SELECT 1 FROM delivery_partners 
        WHERE id = orders.delivery_partner_id 
        AND user_id = auth.uid()
      )
    )
  );
