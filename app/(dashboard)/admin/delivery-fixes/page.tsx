import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DeliveryAssignmentMonitor } from "@/components/admin/delivery-assignment-monitor"
import { LinkDeliveryPartnersButton } from "@/components/admin/link-delivery-partners-button"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DeliveryFixesPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check if user is admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (userProfile?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Delivery System Fixes</h1>
      </div>

      <Tabs defaultValue="monitor">
        <TabsList className="mb-4">
          <TabsTrigger value="monitor">Monitor Assignments</TabsTrigger>
          <TabsTrigger value="link">Link Partners to Users</TabsTrigger>
        </TabsList>

        <TabsContent value="monitor">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Assignment Flow</CardTitle>
                <CardDescription>Diagnose issues with the delivery assignment process</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This utility helps identify issues in the delivery partner assignment flow. Enter an order ID that has
                  been assigned to a delivery partner to check if notifications are being sent correctly.
                </p>
                <DeliveryAssignmentMonitor />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Troubleshooting Steps</CardTitle>
                <CardDescription>Common issues and how to fix them</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Notifications Not Being Created</h3>
                    <ul className="list-disc pl-5 mt-2 text-sm space-y-1 text-muted-foreground">
                      <li>Check if the notifications table has the correct schema</li>
                      <li>Verify that the delivery partner is linked to a user account</li>
                      <li>Check for any errors in the server logs</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Deliveries Not Appearing in Dashboard</h3>
                    <ul className="list-disc pl-5 mt-2 text-sm space-y-1 text-muted-foreground">
                      <li>Verify the delivery partner is linked to a user account</li>
                      <li>Check if the order status is one of: confirmed, dispatched, in_transit, out_for_delivery</li>
                      <li>Ensure the order has the correct delivery_partner_id</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">UUID Errors</h3>
                    <ul className="list-disc pl-5 mt-2 text-sm space-y-1 text-muted-foreground">
                      <li>Ensure all IDs are properly formatted as strings</li>
                      <li>Check for any object references being passed instead of string UUIDs</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="link">
          <Card>
            <CardHeader>
              <CardTitle>Link Delivery Partners to Users</CardTitle>
              <CardDescription>
                Fix connection issues between delivery partner records and user accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This utility will link all delivery partners to their corresponding user accounts. This is necessary for
                deliveries to appear in the delivery partner dashboard.
              </p>
              <div className="mt-4">
                <LinkDeliveryPartnersButton />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
