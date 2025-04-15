import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated and is an admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    // 1. Get all users with role "delivery_partner"
    const { data: deliveryPartnerUsers, error: userError } = await supabase
      .from("profiles")
      .select("id, business_name, phone, email")
      .eq("role", "delivery_partner")

    if (userError) {
      console.error("Error fetching delivery partner users:", userError)
      return NextResponse.json({ success: false, message: "Error fetching delivery partner users" }, { status: 500 })
    }

    // 2. Get all delivery partners
    const { data: deliveryPartners, error: partnerError } = await supabase
      .from("delivery_partners")
      .select("id, user_id, name, phone, email")

    if (partnerError) {
      // If the table doesn't exist, create it
      if (partnerError.message.includes("relation") && partnerError.message.includes("does not exist")) {
        // Create the delivery_partners table
        const { error: createTableError } = await supabase.rpc("exec_sql", {
          sql_query: `
            CREATE TABLE IF NOT EXISTS public.delivery_partners (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              name TEXT,
              phone TEXT,
              email TEXT,
              vehicle_type TEXT,
              vehicle_number TEXT,
              address TEXT,
              city TEXT,
              pincode TEXT,
              is_active BOOLEAN DEFAULT true,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              user_id UUID REFERENCES auth.users(id),
              wholesaler_id UUID REFERENCES auth.users(id)
            );
            
            -- Add RLS policies
            ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;
            
            -- Allow admins to manage all delivery partners
            CREATE POLICY "Admins can manage all delivery partners"
            ON public.delivery_partners
            FOR ALL
            TO authenticated
            USING (
              EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
              )
            );
            
            -- Allow wholesalers to manage their own delivery partners
            CREATE POLICY "Wholesalers can manage their own delivery partners"
            ON public.delivery_partners
            FOR ALL
            TO authenticated
            USING (
              EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid() AND profiles.role = 'wholesaler'
              )
              AND (
                wholesaler_id = auth.uid() OR wholesaler_id IS NULL
              )
            );
            
            -- Allow delivery partners to view their own record
            CREATE POLICY "Delivery partners can view their own record"
            ON public.delivery_partners
            FOR SELECT
            TO authenticated
            USING (
              user_id = auth.uid()
            );
          `,
        })

        if (createTableError) {
          console.error("Error creating delivery_partners table:", createTableError)
          return NextResponse.json(
            { success: false, message: "Error creating delivery_partners table" },
            { status: 500 },
          )
        }

        // Try fetching again after creating the table
        const { data: newDeliveryPartners, error: newPartnerError } = await supabase
          .from("delivery_partners")
          .select("id, user_id, name, phone, email")

        if (newPartnerError) {
          console.error("Error fetching delivery partners after table creation:", newPartnerError)
          return NextResponse.json({ success: false, message: "Error fetching delivery partners" }, { status: 500 })
        }

        const deliveryPartners = newDeliveryPartners
      } else {
        console.error("Error fetching delivery partners:", partnerError)
        return NextResponse.json({ success: false, message: "Error fetching delivery partners" }, { status: 500 })
      }
    }

    // Initialize counters
    let created = 0
    let updated = 0
    let orphaned = 0

    // 3. For each delivery partner user, check if they have a delivery partner record
    for (const user of deliveryPartnerUsers || []) {
      const existingPartner = deliveryPartners?.find((partner) => partner.user_id === user.id)

      if (existingPartner) {
        // Update the existing partner if needed
        const { error: updateError } = await supabase
          .from("delivery_partners")
          .update({
            name: user.business_name || existingPartner.name,
            phone: user.phone || existingPartner.phone,
            email: user.email || existingPartner.email,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingPartner.id)

        if (updateError) {
          console.error(`Error updating delivery partner for user ${user.id}:`, updateError)
        } else {
          updated++
        }
      } else {
        // Create a new delivery partner record
        const { error: insertError } = await supabase.from("delivery_partners").insert({
          name: user.business_name || `Delivery Partner ${user.id.substring(0, 8)}`,
          phone: user.phone || "Not provided",
          email: user.email || "Not provided",
          user_id: user.id,
          is_active: true,
        })

        if (insertError) {
          console.error(`Error creating delivery partner for user ${user.id}:`, insertError)
        } else {
          created++
        }
      }
    }

    // 4. Check for orphaned delivery partners (no user_id)
    orphaned = (deliveryPartners || []).filter((partner) => !partner.user_id).length

    return NextResponse.json({
      success: true,
      message: "Delivery partners linked successfully",
      details: {
        created,
        updated,
        orphaned,
        total: (deliveryPartnerUsers || []).length,
      },
    })
  } catch (error) {
    console.error("Error in link-delivery-partners-to-users:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}
