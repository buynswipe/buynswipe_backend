import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// This script directly creates a delivery partner user in Supabase
// It handles both the auth user and the necessary database records

async function createDeliveryPartnerUser() {
  // Initialize Supabase client with admin privileges
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase URL or service role key")
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Fixed credentials for the delivery partner
  const email = "driver@retailbandhu.com"
  const password = "driver123"
  const name = "Demo Driver"

  try {
    console.log("Creating delivery partner user...")

    // Step 1: Check if user already exists
    const { data: existingUser } = await supabase.from("auth.users").select("id").eq("email", email).maybeSingle()

    let userId

    if (existingUser) {
      console.log("User already exists, deleting...")
      // Delete existing user
      await supabase.auth.admin.deleteUser(existingUser.id)
    }

    // Step 2: Create user in auth.users
    const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: "delivery_partner",
      },
    })

    if (createUserError) {
      throw createUserError
    }

    userId = newUser.user.id
    console.log("Created auth user with ID:", userId)

    // Step 3: Create profile record
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      email,
      role: "delivery_partner",
      business_name: `${name}'s Delivery Service`,
      phone: "9876543210",
      address: "123 Delivery Street",
      city: "Delhi",
      pincode: "110001",
      is_approved: true,
    })

    if (profileError) {
      throw profileError
    }

    console.log("Created profile record")

    // Step 4: Create delivery partner record
    const deliveryPartnerId = uuidv4()
    const { error: deliveryPartnerError } = await supabase.from("delivery_partners").upsert({
      id: deliveryPartnerId,
      name,
      phone: "9876543210",
      email,
      vehicle_type: "bike",
      vehicle_number: "DL01AB1234",
      license_number: "DL20230987654",
      address: "123 Delivery Street",
      city: "Delhi",
      pincode: "110001",
      is_active: true,
      user_id: userId,
      total_deliveries: 25,
      on_time_deliveries: 23,
      rating: 4.8,
    })

    if (deliveryPartnerError) {
      throw deliveryPartnerError
    }

    console.log("Created delivery partner record with ID:", deliveryPartnerId)

    console.log("Successfully created delivery partner user")
    console.log("Email:", email)
    console.log("Password:", password)
  } catch (error) {
    console.error("Error creating delivery partner user:", error)
  }
}

// Execute the function
createDeliveryPartnerUser()
