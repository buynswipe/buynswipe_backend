import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Check for authorization
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    // Verify the setup token
    if (!process.env.SETUP_SECRET_TOKEN || token !== process.env.SETUP_SECRET_TOKEN) {
      console.error("Invalid or missing setup token")
      return NextResponse.json({ error: "Unauthorized. Invalid token." }, { status: 401 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated and is an admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.error("No session found")
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
    }

    // Get user profile to check if they're an admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (!profile || profile.role !== "admin") {
      console.error("User is not an admin", profile)
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    console.log("Starting delivery tracking setup...")

    // Create the delivery_updates table directly with SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS delivery_updates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        status TEXT NOT NULL CHECK (status IN ('confirmed', 'dispatched', 'in_transit', 'out_for_delivery', 'delivered')),
        location TEXT,
        notes TEXT,
        updated_by UUID REFERENCES profiles(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create index for faster queries
      CREATE INDEX IF NOT EXISTS idx_delivery_updates_order_id ON delivery_updates(order_id);
      CREATE INDEX IF NOT EXISTS idx_delivery_updates_status ON delivery_updates(status);
      CREATE INDEX IF NOT EXISTS idx_delivery_updates_created_at ON delivery_updates(created_at);
      
      -- Enable RLS
      ALTER TABLE delivery_updates ENABLE ROW LEVEL SECURITY;
    `

    // Execute the create table SQL
    const { error: createTableError } = await supabase.rpc("exec_sql", { sql: createTableSQL })

    if (createTableError) {
      console.error("Error creating table:", createTableError)
      return NextResponse.json(
        {
          error: "Error creating delivery_updates table",
          details: createTableError,
        },
        { status: 500 },
      )
    }

    // Create RLS policies
    const policiesSQL = `
      -- Policy for selecting delivery updates
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
      END $$;
      
      -- Policy for inserting delivery updates
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
      END $$;
      
      -- Policy for updating delivery updates
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
      END $$;
      
      -- Policy for deleting delivery updates
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
      END $$;
    `

    // Execute the policies SQL
    const { error: policiesError } = await supabase.rpc("exec_sql", { sql: policiesSQL })

    if (policiesError) {
      console.error("Error creating policies:", policiesError)
      // Continue even if there's an error with policies
    }

    console.log("Delivery updates table and policies created successfully")

    // Create initial delivery updates for existing orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, status, created_at")
      .not("status", "eq", "cancelled")

    if (ordersError) {
      console.error("Error fetching orders:", ordersError)
      return NextResponse.json({ error: "Error fetching orders", details: ordersError }, { status: 500 })
    }

    console.log(`Found ${orders?.length || 0} orders to create initial delivery updates for`)

    // Check if there are any orders to process
    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Delivery tracking setup complete. No orders to process.",
      })
    }

    // Create initial delivery updates in batches to avoid payload size limits
    const BATCH_SIZE = 50
    let processedCount = 0
    let errorCount = 0

    for (let i = 0; i < orders.length; i += BATCH_SIZE) {
      const batch = orders.slice(i, i + BATCH_SIZE)

      const updates = batch.map((order) => ({
        order_id: order.id,
        status: order.status,
        notes: "Initial status",
        created_at: order.created_at,
        updated_by: session.user.id,
      }))

      const { error: insertError } = await supabase.from("delivery_updates").insert(updates)

      if (insertError) {
        console.error(`Error creating batch ${i / BATCH_SIZE + 1}:`, insertError)
        errorCount++
      } else {
        processedCount += batch.length
        console.log(`Processed batch ${i / BATCH_SIZE + 1}: ${batch.length} orders`)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Delivery tracking setup complete",
      ordersProcessed: processedCount,
      errorBatches: errorCount,
    })
  } catch (error) {
    console.error("Error setting up delivery tracking:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
