import { createClient } from "@supabase/supabase-js"

export async function updatePaymentSchema() {
  try {
    // Initialize Supabase client with service role key for admin access
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials")
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log("Updating payment schema...")

    // Read the SQL file
    const sql = `
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
    `

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql })

    if (error) {
      throw error
    }

    console.log("Payment schema updated successfully")
    return { success: true, message: "Payment schema updated successfully" }
  } catch (error: any) {
    console.error("Error updating payment schema:", error)
    return { success: false, error: error.message }
  }
}

// Allow running directly from command line
if (require.main === module) {
  updatePaymentSchema()
    .then((result) => {
      if (result.success) {
        console.log(result.message)
        process.exit(0)
      } else {
        console.error(result.error)
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error("Unhandled error:", error)
      process.exit(1)
    })
}
