import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyDeliveryPartnerLinks() {
  console.log("Starting verification of delivery partner links...")

  try {
    // 1. Get all profiles with role = delivery_partner
    const { data: deliveryPartnerProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, business_name, email")
      .eq("role", "delivery_partner")

    if (profilesError) {
      throw new Error(`Error fetching delivery partner profiles: ${profilesError.message}`)
    }

    console.log(`Found ${deliveryPartnerProfiles.length} delivery partner profiles`)

    // 2. Get all delivery_partners records
    const { data: deliveryPartners, error: partnersError } = await supabase
      .from("delivery_partners")
      .select("id, user_id, name, email")

    if (partnersError) {
      throw new Error(`Error fetching delivery partners: ${partnersError.message}`)
    }

    console.log(`Found ${deliveryPartners.length} delivery partner records`)

    // 3. Check for profiles without delivery partner records
    const profilesWithoutPartners = deliveryPartnerProfiles.filter(
      (profile) => !deliveryPartners.some((partner) => partner.user_id === profile.id),
    )

    console.log(`Found ${profilesWithoutPartners.length} profiles without delivery partner records`)

    // 4. Check for delivery partner records without linked profiles
    const partnersWithoutProfiles = deliveryPartners.filter(
      (partner) => !partner.user_id || !deliveryPartnerProfiles.some((profile) => profile.id === partner.user_id),
    )

    console.log(`Found ${partnersWithoutProfiles.length} delivery partner records without linked profiles`)

    // 5. Check for delivery partner records with mismatched IDs
    const mismatchedIds = deliveryPartners.filter((partner) => partner.user_id && partner.id !== partner.user_id)

    console.log(`Found ${mismatchedIds.length} delivery partner records with mismatched IDs`)

    // 6. Check for orders assigned to delivery partners
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, delivery_partner_id, status")
      .not("delivery_partner_id", "is", null)

    if (ordersError) {
      throw new Error(`Error fetching orders: ${ordersError.message}`)
    }

    console.log(`Found ${orders?.length || 0} orders with assigned delivery partners`)

    // 7. Check for orders with invalid delivery partner IDs
    const ordersWithInvalidPartners = orders?.filter(
      (order) => !deliveryPartners.some((partner) => partner.id === order.delivery_partner_id),
    )

    console.log(`Found ${ordersWithInvalidPartners?.length || 0} orders with invalid delivery partner IDs`)

    // 8. Check if orders are using user_id instead of delivery_partner.id
    const ordersUsingUserId = orders?.filter(
      (order) =>
        !deliveryPartners.some((partner) => partner.id === order.delivery_partner_id) &&
        deliveryPartnerProfiles.some((profile) => profile.id === order.delivery_partner_id),
    )

    console.log(`Found ${ordersUsingUserId?.length || 0} orders using user_id instead of delivery_partner.id`)

    return {
      profilesWithoutPartners,
      partnersWithoutProfiles,
      mismatchedIds,
      ordersWithInvalidPartners,
      ordersUsingUserId,
    }
  } catch (error: any) {
    console.error("Error verifying delivery partner links:", error)
    return { error: error.message }
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  verifyDeliveryPartnerLinks()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => console.error(error))
    .finally(() => process.exit())
}

export default verifyDeliveryPartnerLinks
