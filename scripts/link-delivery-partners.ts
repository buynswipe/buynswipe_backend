import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function linkDeliveryPartners() {
  console.log("Starting to link delivery partners to user profiles...")

  // Get all profiles with role = delivery_partner
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, business_name, phone, email")
    .eq("role", "delivery_partner")

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError)
    return
  }

  console.log(`Found ${profiles.length} delivery partner profiles`)

  for (const profile of profiles) {
    // Check if a delivery partner record exists for this user
    const { data: existingPartner, error: partnerError } = await supabase
      .from("delivery_partners")
      .select("id")
      .eq("id", profile.id)
      .single()

    if (partnerError && partnerError.code !== "PGRST116") {
      // PGRST116 is "not found"
      console.error(`Error checking delivery partner for ${profile.id}:`, partnerError)
      continue
    }

    if (!existingPartner) {
      console.log(`Creating delivery partner record for ${profile.business_name}`)

      // Create a new delivery partner record
      const { error: createError } = await supabase.from("delivery_partners").insert({
        id: profile.id, // Use the same ID as the profile
        name: profile.business_name,
        phone: profile.phone || "",
        email: profile.email || "",
        vehicle_type: "bike", // Default values
        vehicle_number: "",
        license_number: "",
        address: "",
        city: "",
        pincode: "",
        is_active: true,
      })

      if (createError) {
        console.error(`Error creating delivery partner for ${profile.id}:`, createError)
      } else {
        console.log(`Successfully created delivery partner record for ${profile.business_name}`)
      }
    } else {
      console.log(`Delivery partner record already exists for ${profile.business_name}`)
    }
  }

  console.log("Finished linking delivery partners to user profiles")
}

linkDeliveryPartners()
  .then(() => {
    console.log("Script completed successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Script failed:", error)
    process.exit(1)
  })
