import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function linkDeliveryPartnersToUsers() {
  console.log("Starting to link delivery partners to user accounts...")

  try {
    // 1. Get all profiles with role = delivery_partner
    const { data: deliveryPartnerProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, business_name, phone, email, address, city, pincode")
      .eq("role", "delivery_partner")

    if (profilesError) {
      throw new Error(`Error fetching delivery partner profiles: ${profilesError.message}`)
    }

    console.log(`Found ${deliveryPartnerProfiles.length} delivery partner profiles`)

    // 2. For each profile, check if there's a corresponding delivery_partners record
    let created = 0
    let updated = 0
    let alreadyLinked = 0

    for (const profile of deliveryPartnerProfiles) {
      // Check if there's a delivery partner record with this user_id
      const { data: existingPartnerByUserId, error: userIdError } = await supabase
        .from("delivery_partners")
        .select("id")
        .eq("user_id", profile.id)
        .maybeSingle()

      if (userIdError && !userIdError.message.includes("No rows found")) {
        console.error(`Error checking delivery partner by user_id for ${profile.id}:`, userIdError)
        continue
      }

      // Check if there's a delivery partner record with the same ID as the profile
      const { data: existingPartnerById, error: idError } = await supabase
        .from("delivery_partners")
        .select("id, user_id")
        .eq("id", profile.id)
        .maybeSingle()

      if (idError && !idError.message.includes("No rows found")) {
        console.error(`Error checking delivery partner by id for ${profile.id}:`, idError)
        continue
      }

      if (existingPartnerByUserId) {
        // Already linked correctly
        alreadyLinked++
        console.log(`User ${profile.id} already linked to delivery partner ${existingPartnerByUserId.id}`)
      } else if (existingPartnerById) {
        // Partner exists with same ID but user_id not set
        if (existingPartnerById.user_id === profile.id) {
          alreadyLinked++
          console.log(`User ${profile.id} already linked to delivery partner ${existingPartnerById.id}`)
        } else {
          // Update the user_id field
          const { error: updateError } = await supabase
            .from("delivery_partners")
            .update({ user_id: profile.id })
            .eq("id", profile.id)

          if (updateError) {
            console.error(`Error updating delivery partner ${profile.id}:`, updateError)
            continue
          }

          updated++
          console.log(`Updated delivery partner ${profile.id} to link to user ${profile.id}`)
        }
      } else {
        // No delivery partner record exists, create one
        const { error: createError } = await supabase.from("delivery_partners").insert({
          id: profile.id, // Use the same ID as the profile
          name: profile.business_name || "Delivery Partner",
          phone: profile.phone || "",
          email: profile.email || "",
          vehicle_type: "bike", // Default value
          vehicle_number: "TBD", // Default value
          address: profile.address || "",
          city: profile.city || "",
          pincode: profile.pincode || "",
          is_active: true,
          user_id: profile.id, // Link to the user account
        })

        if (createError) {
          console.error(`Error creating delivery partner for ${profile.id}:`, createError)
          continue
        }

        created++
        console.log(`Created delivery partner record for ${profile.id}`)
      }
    }

    // 3. Check for orphaned delivery partner records (no user_id or invalid user_id)
    const { data: orphanedPartners, error: orphanedError } = await supabase
      .from("delivery_partners")
      .select("id, name")
      .is("user_id", null)

    if (orphanedError) {
      console.error("Error checking for orphaned delivery partners:", orphanedError)
    } else {
      console.log(`Found ${orphanedPartners.length} orphaned delivery partner records (no user_id)`)
    }

    return {
      success: true,
      message: `Linked delivery partners to users: ${created} created, ${updated} updated, ${alreadyLinked} already linked, ${orphanedPartners?.length || 0} orphaned`,
      details: {
        created,
        updated,
        alreadyLinked,
        orphaned: orphanedPartners?.length || 0,
      },
    }
  } catch (error: any) {
    console.error("Error linking delivery partners to users:", error)
    return { success: false, error: error.message }
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  linkDeliveryPartnersToUsers()
    .then((result) => console.log(result))
    .catch((error) => console.error(error))
    .finally(() => process.exit())
}

export default linkDeliveryPartnersToUsers
