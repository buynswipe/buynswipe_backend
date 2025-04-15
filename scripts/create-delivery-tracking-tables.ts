import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createDeliveryTrackingTables() {
  console.log("Creating delivery tracking tables...")

  try {
    // Create delivery_status_updates table
    const { error: statusTableError } = await supabase.rpc("exec_sql", {
      sql_string: `
        CREATE TABLE IF NOT EXISTS delivery_status_updates (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          order_id UUID NOT NULL REFERENCES orders(id),
          delivery_partner_id UUID NOT NULL REFERENCES delivery_partners(id),
          status TEXT NOT NULL CHECK (status IN ('assigned', 'picked_up', 'in_transit', 'delivered', 'failed')),
          location_lat DECIMAL(10, 8),
          location_lng DECIMAL(11, 8),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        );
        
        CREATE INDEX IF NOT EXISTS idx_delivery_status_updates_order_id ON delivery_status_updates(order_id);
        CREATE INDEX IF NOT EXISTS idx_delivery_status_updates_delivery_partner_id ON delivery_status_updates(delivery_partner_id);
      `,
    })

    if (statusTableError) {
      throw new Error(`Error creating delivery_status_updates table: ${statusTableError.message}`)
    }

    // Create delivery_proofs table
    const { error: proofsTableError } = await supabase.rpc("exec_sql", {
      sql_string: `
        CREATE TABLE IF NOT EXISTS delivery_proofs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          order_id UUID NOT NULL REFERENCES orders(id),
          delivery_partner_id UUID NOT NULL REFERENCES delivery_partners(id),
          photo_url TEXT,
          signature_url TEXT,
          receiver_name TEXT NOT NULL,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        );
        
        CREATE INDEX IF NOT EXISTS idx_delivery_proofs_order_id ON delivery_proofs(order_id);
      `,
    })

    if (proofsTableError) {
      throw new Error(`Error creating delivery_proofs table: ${proofsTableError.message}`)
    }

    // Create delivery_partner_earnings table
    const { error: earningsTableError } = await supabase.rpc("exec_sql", {
      sql_string: `
        CREATE TABLE IF NOT EXISTS delivery_partner_earnings (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          delivery_partner_id UUID NOT NULL REFERENCES delivery_partners(id),
          order_id UUID REFERENCES orders(id),
          amount DECIMAL(10, 2) NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'cancelled')),
          payout_id UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          paid_at TIMESTAMP WITH TIME ZONE,
          CONSTRAINT fk_delivery_partner FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners(id) ON DELETE CASCADE
        );
        
        CREATE INDEX IF NOT EXISTS idx_delivery_partner_earnings_partner_id ON delivery_partner_earnings(delivery_partner_id);
        CREATE INDEX IF NOT EXISTS idx_delivery_partner_earnings_order_id ON delivery_partner_earnings(order_id);
      `,
    })

    if (earningsTableError) {
      throw new Error(`Error creating delivery_partner_earnings table: ${earningsTableError.message}`)
    }

    console.log("Delivery tracking tables created successfully!")
    return { success: true }
  } catch (error) {
    console.error("Error creating delivery tracking tables:", error)
    return { success: false, error }
  }
}

// Execute the function
createDeliveryTrackingTables()
  .then((result) => {
    if (result.success) {
      console.log("Migration completed successfully")
      process.exit(0)
    } else {
      console.error("Migration failed:", result.error)
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error("Unexpected error:", error)
    process.exit(1)
  })
