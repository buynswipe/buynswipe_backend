-- Fix Row Level Security policies for notifications table
-- This script adds appropriate policies to allow delivery partners to receive notifications

-- First, check if the notifications table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    -- Drop existing RLS policies if they exist
    DROP POLICY IF EXISTS "Allow users to see their own notifications" ON notifications;
    DROP POLICY IF EXISTS "Allow delivery partners to see their notifications" ON notifications;
    
    -- Create policy to allow users to see their own notifications
    CREATE POLICY "Allow users to see their own notifications" 
    ON notifications FOR ALL 
    USING (auth.uid() = user_id);
    
    -- Create policy to allow delivery partners to see notifications assigned to them
    CREATE POLICY "Allow delivery partners to see their notifications" 
    ON notifications FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM delivery_partners dp
        WHERE dp.user_id = auth.uid() 
        AND dp.id::text = entity_id::text
        AND entity_type = 'delivery_partner'
      )
    );
    
    -- Ensure RLS is enabled on the notifications table
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'Successfully updated notification RLS policies';
  ELSE
    RAISE NOTICE 'Notifications table does not exist, skipping RLS policy updates';
  END IF;
END
$$;
