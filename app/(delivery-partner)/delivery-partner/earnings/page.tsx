"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import { EarningsSummary } from "@/components/delivery-partner/earnings/earnings-summary"
import { EarningsChart } from "@/components/delivery-partner/earnings/earnings-chart"
import { EarningsTable } from "@/components/delivery-partner/earnings/earnings-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function EarningsPage() {
  // Add a state to track if the table exists
  const [tableExists, setTableExists] = useState(true)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const [userId, setUserId] = useState<string | null>(null)

  // Add a useEffect to check if the table exists
  useEffect(() => {
    async function checkTableExists() {
      try {
        const { error } = await supabase
          .from("delivery_partner_earnings")
          .select("id", { count: "exact", head: true })
          .limit(1)

        if (error && error.message.includes("does not exist")) {
          setTableExists(false)
        }
      } catch (error) {
        console.error("Error checking if table exists:", error)
      } finally {
        setLoading(false)
      }
    }

    checkTableExists()
  }, [supabase])

  useEffect(() => {
    async function getSessionAndUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        redirect("/login")
      }

      const { data: profile } = await supabase.from("profiles").select("id, role").eq("id", session.user.id).single()

      if (!profile || profile.role !== "delivery_partner") {
        redirect("/")
      }

      setUserId(profile.id)
    }

    getSessionAndUser()
  }, [supabase])

  if (loading) {
    return <div>Loading...</div>
  }

  // Modify the return statement to conditionally render sections based on tableExists
  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Earnings Dashboard</h1>

      {!tableExists ? (
        <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Earnings System Not Available</AlertTitle>
          <AlertDescription>
            The earnings tracking system is not yet set up. Please contact an administrator.
          </AlertDescription>
        </Alert>
      ) : userId ? (
        <>
          <EarningsSummary deliveryPartnerId={userId} />

          <Card>
            <CardHeader>
              <CardTitle>Earnings Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <EarningsChart deliveryPartnerId={userId} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Earnings History</CardTitle>
            </CardHeader>
            <CardContent>
              <EarningsTable deliveryPartnerId={userId} />
            </CardContent>
          </Card>
        </>
      ) : (
        <div>Loading user data...</div>
      )}
    </div>
  )
}
