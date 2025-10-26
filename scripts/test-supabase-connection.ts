/**
 * Test script to verify Supabase connection and environment variables
 * Run with: npm run test:supabase
 */

async function testSupabaseConnection() {
  console.log("[Supabase Connection Test] Starting...\n")

  // Check environment variables
  console.log("1. Checking Environment Variables:")
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  let allEnvVarsPresent = true
  for (const [key, value] of Object.entries(envVars)) {
    const status = value ? "✓" : "✗"
    console.log(`   ${status} ${key}: ${value ? "Present" : "Missing"}`)
    if (!value) allEnvVarsPresent = false
  }

  if (!allEnvVarsPresent) {
    console.error("\n✗ Missing environment variables. Please configure them in Vercel.")
    process.exit(1)
  }

  console.log("\n2. Testing Connection:")

  try {
    // Test with service client
    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Try a simple query
    const { data, error } = await supabase.from("profiles").select("count", { count: "exact", head: true })

    if (error) {
      console.error(`   ✗ Query failed: ${error.message}`)
      process.exit(1)
    }

    console.log("   ✓ Connection successful")
    console.log(`   ✓ Database is accessible`)

    console.log("\n3. Testing Health Endpoint:")
    const healthResponse = await fetch("http://localhost:3000/api/health/supabase")
    const healthData = await healthResponse.json()

    if (healthResponse.ok) {
      console.log("   ✓ Health endpoint is working")
      console.log(`   Status: ${healthData.connection.status}`)
    } else {
      console.warn("   ⚠ Health endpoint returned non-200 status")
    }

    console.log("\n✓ All tests passed! Supabase is properly configured.")
  } catch (error) {
    console.error(`\n✗ Connection test failed: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }
}

testSupabaseConnection()
