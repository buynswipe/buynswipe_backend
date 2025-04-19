import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const email = "driver@retailbandhu.com"
const password = "driver123"

async function createDeliveryPartnerUser() {
  try {
    console.log("Checking if user exists...")

    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users.find((user) => user.email === email)

    // Delete user if exists
    if (existingUser) {
      console.log("User exists, deleting...")
      await supabase.auth.admin.deleteUser(existingUser.id)
    }

    // Create new user
    console.log("Creating new user...")
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (userError) {
      throw userError
    }

    const userId = userData.user.id

    // Create profile
    console.log("Creating profile...")
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      email,
      role: "delivery_partner",
      business_name: "Delivery Partner",
      phone: "1234567890",
      address: "123 Delivery St",
      city: "Delivery City",
      pincode: "123456",
      is_approved: true,
    })

    if (profileError) {
      throw profileError
    }

    // Create delivery partner record
    console.log("Creating delivery partner record...")
    const { error: deliveryPartnerError } = await supabase.from("delivery_partners").insert({
      name: "Demo Delivery Partner",
      phone: "1234567890",
      email,
      vehicle_type: "bike",
      vehicle_number: "DL-01-AB-1234",
      license_number: "DL12345678",
      address: "123 Delivery St",
      city: "Delivery City",
      pincode: "123456",
      is_active: true,
    })

    if (deliveryPartnerError) {
      throw deliveryPartnerError
    }

    console.log("Successfully created delivery partner user")
    return {
      success: true,
      message: "Successfully created delivery partner user",
      credentials: { email, password },
    }
  } catch (error) {
    console.error("Error creating delivery partner user:", error)
    return { success: false, error: String(error) }
  }
}

export default createDeliveryPartnerUser
