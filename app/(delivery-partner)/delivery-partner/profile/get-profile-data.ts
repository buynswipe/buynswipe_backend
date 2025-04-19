import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function getProfileData() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get the user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single()

  if (profileError) {
    console.error("Error fetching profile:", profileError)
    return null
  }

  return {
    id: profile.id,
    fullName: profile.business_name || "",
    email: session.user.email || "",
    phone: profile.phone || "",
    address: profile.address || "",
    city: profile.city || "",
    pincode: profile.pincode || "",
    role: profile.role,
    vehicleType: "Not provided", // Default values since we're not fetching from delivery_partners
    vehicleNumber: "Not provided",
    joinedDate: new Date(profile.created_at).toLocaleDateString(),
  }
}
