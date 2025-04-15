-- Check if image_url column exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'image_url'
  ) THEN
    -- Add the image_url column if it doesn't exist
    ALTER TABLE public.products ADD COLUMN image_url TEXT;
  END IF;
END
$$;

-- If the column exists with a different name (like image_uri), this will rename it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'image_uri'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.products RENAME COLUMN image_uri TO image_url;
  END IF;
END
$$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
