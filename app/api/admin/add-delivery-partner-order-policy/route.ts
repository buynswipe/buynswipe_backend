import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createClient()

    // SQL to add the delivery partner order policies
    const sql = `
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
    `

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql })

    if (error) {
      console.error("Error adding delivery partner order policies:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Delivery partner order policies added successfully" })
  } catch (error) {
    console.error("Error in add-delivery-partner-order-policy route:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
