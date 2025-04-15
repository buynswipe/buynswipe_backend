-- This script fixes the orders_status_check constraint issue

-- First, let's check the current constraint definition
DO $$
DECLARE
    constraint_def text;
BEGIN
    SELECT pg_get_constraintdef(oid) INTO constraint_def
    FROM pg_constraint
    WHERE conname = 'orders_status_check';
    
    RAISE NOTICE 'Current constraint definition: %', constraint_def;
END $$;

-- Now let's update the constraint to ensure it includes all valid statuses
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add the constraint back with all valid statuses
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('placed', 'confirmed', 'dispatched', 'delivered', 'rejected'));

-- Verify the updated constraint
DO $$
DECLARE
    constraint_def text;
BEGIN
    SELECT pg_get_constraintdef(oid) INTO constraint_def
    FROM pg_constraint
    WHERE conname = 'orders_status_check';
    
    RAISE NOTICE 'Updated constraint definition: %', constraint_def;
END $$;
