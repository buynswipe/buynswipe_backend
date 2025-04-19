"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { ChangePasswordForm } from "@/components/delivery-partner/change-password-form"
import { ProfileEditForm } from "@/components/delivery-partner/profile-edit-form"

export default function DeliveryPartnerProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<{
    id: string
    email: string
    business_name: string
    phone: string
    address: string
    city: string
    pincode: string
    vehicle_type: string
    vehicle_number: string
  } | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)

        // Get user session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          throw new Error("Not authenticated")
        }

        // Fetch user profile and delivery partner info
        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
            id,
            email,
            business_name,
            phone,
            address,
            city,
            pincode,
            delivery_partners (
              vehicle_type,
              vehicle_number
            )
          `,
          )
          .eq("id", session.user.id)
          .single()

        if (error) throw error

        // Extract delivery partner info
        const deliveryPartner = data?.delivery_partners

        // Set profile data
        setProfile({
          id: data.id,
          email: data.email,
          business_name: data.business_name,
          phone: data.phone,
          address: data.address,
          city: data.city,
          pincode: data.pincode,
          vehicle_type: deliveryPartner?.vehicle_type || "",
          vehicle_number: deliveryPartner?.vehicle_number || "",
        })
      } catch (error: any) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-500 rounded-md">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile Settings</h2>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      {profile && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your basic information</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileEditForm initialData={profile} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
