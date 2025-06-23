import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createPOSSystem() {
  console.log("🏪 Setting up POS System...")

  try {
    console.log("Creating POS system tables...")

    // Read and execute the SQL file
    const fs = require("fs")
    const path = require("path")
    const sqlPath = path.join(process.cwd(), "scripts", "create-pos-tables.sql")
    const sql = fs.readFileSync(sqlPath, "utf8")

    // Split SQL into individual statements
    const statements = sql.split(";").filter((stmt) => stmt.trim().length > 0)

    for (const statement of statements) {
      const { error } = await supabase.rpc("exec_sql", {
        sql_query: statement.trim() + ";",
      })

      if (error) {
        console.error("❌ Error executing SQL:", error)
        throw error
      }
    }

    console.log("✅ POS tables created successfully")

    // Create sample products for testing
    const sampleProducts = [
      {
        name: "Coca Cola 500ml",
        price: 25.0,
        barcode: "8901030895016",
        category: "Beverages",
        stock: 100,
      },
      {
        name: "Parle-G Biscuits",
        price: 10.0,
        barcode: "8901719100017",
        category: "Snacks",
        stock: 50,
      },
      {
        name: "Maggi Noodles",
        price: 15.0,
        barcode: "8901030895023",
        category: "Food",
        stock: 75,
      },
      {
        name: "Dairy Milk Chocolate",
        price: 35.0,
        barcode: "8901030895030",
        category: "Confectionery",
        stock: 30,
      },
    ]

    // Insert sample products
    const { error: productsError } = await supabase.from("products").upsert(sampleProducts, { onConflict: "barcode" })

    if (productsError) {
      console.error("❌ Error creating sample products:", productsError)
    } else {
      console.log("✅ Sample products created successfully")
    }

    console.log("🎉 POS System setup completed!")
    console.log("📋 Features available:")
    console.log("   • Barcode scanning")
    console.log("   • Thermal printer integration")
    console.log("   • Inventory management")
    console.log("   • Sales reporting")
    console.log("   • Multiple payment methods")
  } catch (error) {
    console.error("❌ Failed to setup POS System:", error)
    process.exit(1)
  }
}

// Run the setup
createPOSSystem()
