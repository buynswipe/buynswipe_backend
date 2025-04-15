import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDeliveryPartners() {
  console.log("Starting delivery partners seeding...")

  // Create demo delivery partners
  const highPerformerId = uuidv4()
  const moderatePerformerId = uuidv4()
  const lowPerformerId = uuidv4()

  // Check if users already exist
  const { data: existingHighUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", "driver.high@retailbandhu.com")
    .single()

  const { data: existingModerateUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", "driver.moderate@retailbandhu.com")
    .single()

  const { data: existingLowUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", "driver.low@retailbandhu.com")
    .single()

  // Only create users if they don't exist
  if (!existingHighUser) {
    // Create high performer delivery partner
    const { error: highPerformerAuthError } = await supabase.auth.admin.createUser({
      email: "driver.high@retailbandhu.com",
      password: "driver123",
      email_confirm: true,
      user_metadata: { role: "delivery_partner" },
    })

    if (highPerformerAuthError) {
      console.error("Error creating high performer delivery partner:", highPerformerAuthError)
    } else {
      console.log("Created high performer delivery partner user")

      // Get the user ID from auth
      const { data: userData } = await supabase.auth.admin.listUsers()
      const highUser = userData?.users.find((u) => u.email === "driver.high@retailbandhu.com")

      if (highUser) {
        // Create profile
        const { error: highPerformerProfileError } = await supabase.from("profiles").insert({
          id: highUser.id,
          email: "driver.high@retailbandhu.com",
          role: "delivery_partner",
          business_name: "Speedy Deliveries",
          phone: "9876543220",
          address: "123 Fast Lane",
          city: "Delhi",
          pincode: "110001",
          is_approved: true,
        })

        if (highPerformerProfileError) {
          console.error("Error creating high performer profile:", highPerformerProfileError)
        } else {
          console.log("Created high performer profile")
        }
      }
    }
  } else {
    console.log("High performer user already exists, skipping creation")
  }

  // Repeat for moderate performer (similar code structure)
  if (!existingModerateUser) {
    const { error: moderatePerformerAuthError } = await supabase.auth.admin.createUser({
      email: "driver.moderate@retailbandhu.com",
      password: "driver123",
      email_confirm: true,
      user_metadata: { role: "delivery_partner" },
    })

    if (moderatePerformerAuthError) {
      console.error("Error creating moderate performer delivery partner:", moderatePerformerAuthError)
    } else {
      console.log("Created moderate performer delivery partner user")

      // Get the user ID from auth
      const { data: userData } = await supabase.auth.admin.listUsers()
      const moderateUser = userData?.users.find((u) => u.email === "driver.moderate@retailbandhu.com")

      if (moderateUser) {
        // Create profile
        const { error: moderatePerformerProfileError } = await supabase.from("profiles").insert({
          id: moderateUser.id,
          email: "driver.moderate@retailbandhu.com",
          role: "delivery_partner",
          business_name: "Reliable Transports",
          phone: "9876543221",
          address: "456 Main Street",
          city: "Delhi",
          pincode: "110002",
          is_approved: true,
        })

        if (moderatePerformerProfileError) {
          console.error("Error creating moderate performer profile:", moderatePerformerProfileError)
        } else {
          console.log("Created moderate performer profile")
        }
      }
    }
  } else {
    console.log("Moderate performer user already exists, skipping creation")
  }

  // Repeat for low performer (similar code structure)
  if (!existingLowUser) {
    const { error: lowPerformerAuthError } = await supabase.auth.admin.createUser({
      email: "driver.low@retailbandhu.com",
      password: "driver123",
      email_confirm: true,
      user_metadata: { role: "delivery_partner" },
    })

    if (lowPerformerAuthError) {
      console.error("Error creating low performer delivery partner:", lowPerformerAuthError)
    } else {
      console.log("Created low performer delivery partner user")

      // Get the user ID from auth
      const { data: userData } = await supabase.auth.admin.listUsers()
      const lowUser = userData?.users.find((u) => u.email === "driver.low@retailbandhu.com")

      if (lowUser) {
        // Create profile
        const { error: lowPerformerProfileError } = await supabase.from("profiles").insert({
          id: lowUser.id,
          email: "driver.low@retailbandhu.com",
          role: "delivery_partner",
          business_name: "Budget Deliveries",
          phone: "9876543222",
          address: "789 Slow Road",
          city: "Delhi",
          pincode: "110003",
          is_approved: true,
        })

        if (lowPerformerProfileError) {
          console.error("Error creating low performer profile:", lowPerformerProfileError)
        } else {
          console.log("Created low performer profile")
        }
      }
    }
  } else {
    console.log("Low performer user already exists, skipping creation")
  }

  // Get the user IDs for the delivery partners
  const { data: highProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", "driver.high@retailbandhu.com")
    .single()

  const { data: moderateProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", "driver.moderate@retailbandhu.com")
    .single()

  const { data: lowProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", "driver.low@retailbandhu.com")
    .single()

  // Check if delivery partners already exist
  const { data: existingPartners } = await supabase
    .from("delivery_partners")
    .select("email")
    .in("email", ["driver.high@retailbandhu.com", "driver.moderate@retailbandhu.com", "driver.low@retailbandhu.com"])

  const existingEmails = existingPartners?.map((p) => p.email) || []

  // Create delivery partner records if they don't exist
  const deliveryPartners = []

  if (highProfile && !existingEmails.includes("driver.high@retailbandhu.com")) {
    deliveryPartners.push({
      id: uuidv4(),
      name: "Rajesh Kumar",
      phone: "9876543220",
      email: "driver.high@retailbandhu.com",
      vehicle_type: "bike",
      vehicle_number: "DL01AB1234",
      license_number: "DL12345678",
      address: "123 Fast Lane",
      city: "Delhi",
      pincode: "110001",
      is_active: true,
      user_id: highProfile.id,
      total_deliveries: 120,
      on_time_deliveries: 118,
      rating: 4.9,
    })
  }

  if (moderateProfile && !existingEmails.includes("driver.moderate@retailbandhu.com")) {
    deliveryPartners.push({
      id: uuidv4(),
      name: "Suresh Singh",
      phone: "9876543221",
      email: "driver.moderate@retailbandhu.com",
      vehicle_type: "auto",
      vehicle_number: "DL02CD5678",
      license_number: "DL87654321",
      address: "456 Main Street",
      city: "Delhi",
      pincode: "110002",
      is_active: true,
      user_id: moderateProfile.id,
      total_deliveries: 85,
      on_time_deliveries: 75,
      rating: 3.8,
    })
  }

  if (lowProfile && !existingEmails.includes("driver.low@retailbandhu.com")) {
    deliveryPartners.push({
      id: uuidv4(),
      name: "Mahesh Patel",
      phone: "9876543222",
      email: "driver.low@retailbandhu.com",
      vehicle_type: "van",
      vehicle_number: "DL03EF9012",
      license_number: "DL10293847",
      address: "789 Slow Road",
      city: "Delhi",
      pincode: "110003",
      is_active: true,
      user_id: lowProfile.id,
      total_deliveries: 50,
      on_time_deliveries: 35,
      rating: 2.7,
    })
  }

  if (deliveryPartners.length > 0) {
    const { error: deliveryPartnersError } = await supabase.from("delivery_partners").insert(deliveryPartners)

    if (deliveryPartnersError) {
      console.error("Error creating delivery partners:", deliveryPartnersError)
    } else {
      console.log(`Created ${deliveryPartners.length} delivery partner records`)
    }
  } else {
    console.log("No new delivery partners to create")
  }

  console.log("Delivery partners seeding completed!")
}

// Run the seed function
seedDeliveryPartners()
  .catch(console.error)
  .finally(() => {
    console.log("Script execution completed")
  })
