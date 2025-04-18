import { createClient } from "@supabase/supabase-js"

export default async function fixDeliveryPartners() {
  try {
    // Create a direct Supabase client using environment variables
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!,
    )

    // Check if delivery_partners table exists
    const { error: tableCheckError } = await supabase.from("delivery_partners").select("id").limit(1)

    // If table doesn't exist, create it
    if (tableCheckError && tableCheckError.message.includes('relation "delivery_partners" does not exist')) {
      console.log("Creating delivery_partners table...")

      // Create the delivery_partners table
      const { error: createTableError } = await supabase.rpc("exec_sql", {
        sql_query: `
          CREATE TABLE IF NOT EXISTS public.delivery_partners (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            vehicle_type TEXT NOT NULL,
            vehicle_number TEXT NOT NULL,
            license_number TEXT,
            address TEXT NOT NULL,
            city TEXT NOT NULL,
            pincode TEXT NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            wholesaler_id UUID REFERENCES auth.users(id),
            user_id UUID REFERENCES auth.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Add RLS policies
          ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;
          
          -- Allow wholesalers to manage their own delivery partners
          CREATE POLICY "Wholesalers can manage their own delivery partners" 
          ON public.delivery_partners 
          FOR ALL 
          USING (
            (auth.uid() = wholesaler_id) OR 
            (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')) OR
            (auth.uid() = user_id)
          );
          
          -- Allow all authenticated users to view delivery partners
          CREATE POLICY "All users can view delivery partners" 
          ON public.delivery_partners 
          FOR SELECT 
          USING (auth.uid() IS NOT NULL);
        `,
      })

      if (createTableError) {
        console.error("Error creating delivery_partners table:", createTableError)
        return { success: false, error: "Failed to create delivery_partners table" }
      }
    }

    // Find delivery partner users without corresponding delivery_partners records
    const { data: deliveryPartnerUsers, error: usersError } = await supabase
      .from("profiles")
      .select("id, business_name, phone, address, city, pincode")
      .eq("role", "delivery_partner")

    if (usersError) {
      console.error("Error fetching delivery partner users:", usersError)
      return { success: false, error: "Failed to fetch delivery partner users" }
    }

    // For each delivery partner user, check if they have a record in delivery_partners
    let linkedCount = 0
    let createdCount = 0

    for (const user of deliveryPartnerUsers) {
      // Check if user already has a delivery_partners record
      const { data: existingPartner, error: checkError } = await supabase
        .from("delivery_partners")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle()

      if (checkError) {
        console.error(`Error checking delivery partner for user ${user.id}:`, checkError)
        continue
      }

      if (!existingPartner) {
        // Create a new delivery_partners record for this user
        const { error: createError } = await supabase.from("delivery_partners").insert({
          id: user.id, // Use the same ID as the user
          name: user.business_name || "Delivery Partner",
          phone: user.phone || "0000000000",
          vehicle_type: "bike", // Default value
          vehicle_number: "TBD", // Default value
          address: user.address || "Address TBD",
          city: user.city || "City TBD",
          pincode: user.pincode || "000000",
          is_active: true,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        })

        if (createError) {
          console.error(`Error creating delivery partner for user ${user.id}:`, createError)
          continue
        }

        createdCount++
      } else {
        linkedCount++
      }
    }

    return {
      success: true,
      message: `Fixed delivery partners: ${createdCount} created, ${linkedCount} already linked`,
    }
  } catch (error: any) {
    console.error("Error in fixDeliveryPartners:", error)
    return { success: false, error: error.message || "Unknown error occurred" }
  }
}
