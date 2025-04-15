import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

// Create a Supabase client
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
)

export async function createDeliveryPartnersTableRPC() {
  try {
    // Create the RPC function to create the delivery_partners table
    const { error } = await supabaseAdmin.rpc("create_function", {
      function_name: "create_delivery_partners_table",
      function_definition: `
        CREATE OR REPLACE FUNCTION create_delivery_partners_table()
        RETURNS void AS $$
        BEGIN
          -- Create the delivery_partners table if it doesn't exist
          CREATE TABLE IF NOT EXISTS public.delivery_partners (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            phone TEXT,
            vehicle_type TEXT,
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
          );
          
          -- Add RLS policies
          ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;
          
          -- Allow users to view their own delivery partner record
          DROP POLICY IF EXISTS "Users can view their own delivery partner record" ON public.delivery_partners;
          CREATE POLICY "Users can view their own delivery partner record"
            ON public.delivery_partners
            FOR SELECT
            USING (auth.uid() = id);
          
          -- Allow admins to view all delivery partner records
          DROP POLICY IF EXISTS "Admins can view all delivery partner records" ON public.delivery_partners;
          CREATE POLICY "Admins can view all delivery partner records"
            ON public.delivery_partners
            FOR SELECT
            USING (
              EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
              )
            );
          
          -- Allow admins to insert delivery partner records
          DROP POLICY IF EXISTS "Admins can insert delivery partner records" ON public.delivery_partners;
          CREATE POLICY "Admins can insert delivery partner records"
            ON public.delivery_partners
            FOR INSERT
            WITH CHECK (
              EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
              )
            );
          
          -- Allow admins to update delivery partner records
          DROP POLICY IF EXISTS "Admins can update delivery partner records" ON public.delivery_partners;
          CREATE POLICY "Admins can update delivery partner records"
            ON public.delivery_partners
            FOR UPDATE
            USING (
              EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
              )
            );
        END;
        $$ LANGUAGE plpgsql;
      `,
    })

    if (error) {
      console.error("Error creating RPC function:", error)
      return { success: false, error: error.message }
    }

    return { success: true, message: "Successfully created RPC function" }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { success: false, error: error.message }
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  createDeliveryPartnersTableRPC()
    .then((result) => console.log(result))
    .catch((error) => console.error(error))
    .finally(() => process.exit())
}
