import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { createTransactionsTable } from "@/scripts/create-transactions-table"
import { syncTransactions } from "@/scripts/sync-transactions"
import { createDeliveryPartnersTable } from "@/scripts/create-delivery-partners-table"
import { createChatTables } from "@/scripts/create-chat-tables"
import { seedChatResponses } from "@/scripts/seed-chat-responses"
import { createUserIntegrationsTable } from "@/scripts/create-user-integrations-table"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user.id) {
      return NextResponse.json({ error: "User ID is missing" }, { status: 400 })
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user's profile
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the form data
    const formData = await request.formData()
    const script = formData.get("script") as string

    if (!script) {
      return NextResponse.json({ error: "Missing script name" }, { status: 400 })
    }

    let result
    let message

    // Run the appropriate script
    switch (script) {
      case "create-transactions-table":
        result = await createTransactionsTable()
        message = "Transactions table created successfully"
        break
      case "sync-transactions":
        result = await syncTransactions()
        message = "Transactions synced successfully"
        break
      case "create-delivery-partners-table":
        result = await createDeliveryPartnersTable()
        message = "Delivery partners table created successfully"
        break
      case "create-chat-tables":
        result = await createChatTables()
        message = "Chat support tables created successfully"
        break
      case "seed-chat-responses":
        result = await seedChatResponses()
        message = "Chat responses seeded successfully"
        break
      case "create-user-integrations-table":
        result = await createUserIntegrationsTable()
        message = "User integrations table created successfully"
        break
      default:
        return NextResponse.json({ error: "Invalid script name" }, { status: 400 })
    }

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error("Error running script:", error)
    return NextResponse.json({ error: "Failed to run script", details: (error as Error).message }, { status: 500 })
  }
}
