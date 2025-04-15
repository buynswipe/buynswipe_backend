import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createDeliveryPartnerEarningsTable() {
  try {
    console.log("Creating delivery partner earnings table...")

    // Read SQL file
    const sqlFilePath = path.join(process.cwd(), "scripts", "create-delivery-partner-earnings-table.sql")
    const sqlQuery = fs.readFileSync(sqlFilePath, "utf8")

    // Execute SQL
    const { error } = await supabase.rpc("exec_sql", { sql_query: sqlQuery })

    if (error) {
      throw error
    }

    console.log("Delivery partner earnings table created successfully!")
  } catch (error) {
    console.error("Error creating delivery partner earnings table:", error)
    process.exit(1)
  }
}

createDeliveryPartnerEarningsTable()
