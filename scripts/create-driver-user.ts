import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createDriverUser() {
  console.log("Creating driver user...")

  // First, delete any existing user with this email to avoid conflicts
  try {
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const driverUser = existingUsers?.users.find((u) => u.email === "driver@retailbandhu.com")

    if (driverUser) {
      console.log("Found existing driver user, deleting...")
      await supabase.auth.admin.deleteUser(driverUser.id)
      console.log("Deleted existing driver user")

      // Also delete from profiles table
      await supabase.from("profiles").delete().eq("email", "driver@retailbandhu.com")
      console.log("Deleted existing driver profile")

      // Also delete from delivery_partners table
      await supabase.from("delivery_partners").delete().eq("email", "driver@retailbandhu.com")
      console.log("Deleted existing delivery partner record")
    }
  } catch (error) {
    console.error("Error checking/deleting existing user:", error)
  }

  // Create a new user with simple credentials
  try {
    const { data: user, error: createUserError } = await supabase.auth.admin.createUser({
      email: "driver@retailbandhu.com",
      password: "driver123",
      email_confirm: true,
      user_metadata: {
        role: "delivery_partner",
        name: "Rajesh Kumar",
      },
    })

    if (createUserError) {
      throw createUserError
    }

    console.log("Created driver user:", user)

    // Create profile record
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.user.id,
      email: "driver@retailbandhu.com",
      role: "delivery_partner",
      business_name: "Speedy Deliveries",
      phone: "9876543210",
      address: "123 Fast Lane",
      city: "Delhi",
      pincode: "110001",
      is_approved: true,
    })

    if (profileError) {
      throw profileError
    }

    console.log("Created driver profile")

    // Create delivery partner record
    const { error: deliveryPartnerError } = await supabase.from("delivery_partners").insert({
      id: uuidv4(),
      name: "Rajesh Kumar",
      phone: "9876543210",
      email: "driver@retailbandhu.com",
      vehicle_type: "bike",
      vehicle_number: "DL01AB1234",
      license_number: "DL12345678",
      address: "123 Fast Lane",
      city: "Delhi",
      pincode: "110001",
      is_active: true,
      user_id: user.user.id,
      total_deliveries: 120,
      on_time_deliveries: 118,
      rating: 4.9,
    })

    if (deliveryPartnerError) {
      throw deliveryPartnerError
    }

    console.log("Created delivery partner record")
    console.log("\nDriver user created successfully!")
    console.log("Email: driver@retailbandhu.com")
    console.log("Password: driver123")
  } catch (error) {
    console.error("Error creating driver user:", error)
  }
}

// Run the function
createDriverUser()
  .catch(console.error)
  .finally(() => {
    console.log("Script execution completed")
  })
