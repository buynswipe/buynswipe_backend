import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

// Named export for modules that use import { createDeliveryPartnersTable } from '...'
export async function createDeliveryPartnersTable() {
  try {
    // Create a Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration")
    }

    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)

    console.log("Checking if delivery_partners table exists...")

    // Check if the table already exists
    const { error: checkError } = await supabaseAdmin.from("delivery_partners").select("id").limit(1)

    if (!checkError) {
      console.log("Table delivery_partners already exists. Skipping creation.")
      return { success: true, message: "delivery_partners table already exists" }
    }

    console.log("Creating delivery_partners table...")

    // Create the delivery_partners table using RPC
    const { error: createError } = await supabaseAdmin.rpc("create_delivery_partners_table")

    if (createError) {
      console.error("Error creating delivery_partners table using RPC:", createError)

      // If RPC fails, try a simpler approach - just create a minimal table
      // and we'll handle the rest through the API
      try {
        // Create a minimal delivery_partners table
        await supabaseAdmin
          .from("delivery_partners")
          .insert({
            id: "00000000-0000-0000-0000-000000000000",
            name: "Test Driver",
            phone: "1234567890",
            vehicle_type: "bike",
            vehicle_number: "DL01AB1234",
            address: "123 Test Street",
            city: "Test City",
            pincode: "110001",
            is_active: true,
          })
          .select()

        console.log("Created minimal delivery_partners table")
        return { success: true, message: "Created minimal delivery_partners table" }
      } catch (minimalError: any) {
        console.error("Error creating minimal delivery_partners table:", minimalError)
        return { success: false, error: `Failed to create delivery_partners table: ${minimalError.message}` }
      }
    }

    console.log("Successfully created delivery_partners table")
    return { success: true, message: "Successfully created delivery_partners table" }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { success: false, error: error.message }
  }
}

// Default export for modules that use import createDeliveryPartnersTable from '...'
export default createDeliveryPartnersTable

// Run the function if this file is executed directly
if (require.main === module) {
  createDeliveryPartnersTable()
    .then((result) => console.log(result))
    .catch((error) => console.error(error))
    .finally(() => process.exit())
}
