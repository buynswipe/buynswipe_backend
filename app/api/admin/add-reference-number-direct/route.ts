import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Check if user is authenticated and is an admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    // Check if the reference_number column already exists
    try {
      // Try to query the column to see if it exists
      const { data, error } = await supabase.from("orders").select("reference_number").limit(1)

      // If no error, the column exists
      if (!error) {
        return NextResponse.json({ message: "reference_number column already exists in orders table" }, { status: 200 })
      }

      // If error is not about the column not existing, return the error
      if (!error.message.includes("column") || !error.message.includes("does not exist")) {
        throw new Error(error.message)
      }
    } catch (error) {
      // If error is not about the column not existing, it's an unexpected error
      if (error instanceof Error && (!error.message.includes("column") || !error.message.includes("does not exist"))) {
        console.error("Error checking if reference_number column exists:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      // Otherwise, continue with adding the column
    }

    // Add the reference_number column to the orders table
    const addColumnQuery = `
      ALTER TABLE orders 
      ADD COLUMN reference_number TEXT;
      
      CREATE INDEX IF NOT EXISTS orders_reference_number_idx ON orders(reference_number);
      
      UPDATE orders 
      SET reference_number = 'ORD-' || SUBSTRING(id::text, 1, 8)
      WHERE reference_number IS NULL;
    `

    // Execute the SQL query directly
    const { error } = await supabase.rpc("exec_sql_direct", {
      sql_query: addColumnQuery,
    })

    if (error) {
      console.error("Error adding reference_number column:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "reference_number column added to orders table successfully" }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error adding reference_number column:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
