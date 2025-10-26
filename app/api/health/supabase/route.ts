import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase-server"

/**
 * Health check endpoint for Supabase connectivity
 * Verifies all environment variables and connection status
 */
export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    environment: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    connection: {
      status: "unknown",
      error: null as string | null,
    },
  }

  try {
    // Test service client connection
    const supabase = createServiceClient()
    const { data, error } = await supabase.from("profiles").select("count", { count: "exact", head: true })

    if (error) {
      checks.connection.status = "error"
      checks.connection.error = error.message
      return NextResponse.json(checks, { status: 503 })
    }

    checks.connection.status = "healthy"
    return NextResponse.json(checks, { status: 200 })
  } catch (error) {
    checks.connection.status = "error"
    checks.connection.error = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(checks, { status: 503 })
  }
}
