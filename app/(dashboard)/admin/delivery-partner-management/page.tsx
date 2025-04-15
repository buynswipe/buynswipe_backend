import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LinkDeliveryPartnersButton } from "@/components/admin/link-delivery-partners-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DeliveryPartnerManagementPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Check if user is an admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Get delivery partner statistics
  const { data: deliveryPartnerCount, error: countError } = await supabase
    .from("delivery_partners")
    .select("id", { count: "exact" })

  const { data: linkedCount, error: linkedError } = await supabase
    .from("delivery_partners")
    .select("id", { count: "exact" })
    .not("user_id", "is", null)

  const { data: unlinkedCount, error: unlinkedError } = await supabase
    .from("delivery_partners")
    .select("id", { count: "exact" })
    .is("user_id", null)

  const { data: deliveryPartnerUserCount, error: userCountError } = await supabase
    .from("profiles")
    .select("id", { count: "exact" })
    .eq("role", "delivery_partner")

  // Get delivery partners with their linked users
  const { data: deliveryPartners, error: deliveryPartnersError } = await supabase
    .from("delivery_partners")
    .select(`
    id,
    name,
    phone,
    email,
    vehicle_type,
    vehicle_number,
    is_active,
    user_id
  `)
    .order("name")

  // Then fetch the profiles separately for those that have user_ids
  const userIds = deliveryPartners?.filter((partner) => partner.user_id).map((partner) => partner.user_id) || []

  let profilesData: Record<string, any> = {}
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, business_name, phone, email")
      .in("id", userIds)

    if (profiles) {
      profilesData = profiles.reduce(
        (acc, profile) => {
          acc[profile.id] = profile
          return acc
        },
        {} as Record<string, any>,
      )
    }
  }

  // Log any errors for debugging
  if (countError || linkedError || unlinkedError || userCountError || deliveryPartnersError) {
    console.error("Database errors:", {
      countError,
      linkedError,
      unlinkedError,
      userCountError,
      deliveryPartnersError,
    })
  }

  // Prepare data for the table
  const tableData =
    deliveryPartners?.map((partner) => ({
      id: partner.id,
      name: partner.name || "N/A",
      phone: partner.phone || "N/A",
      email: partner.email || "N/A",
      vehicleType: partner.vehicle_type || "N/A",
      vehicleNumber: partner.vehicle_number || "N/A",
      status: partner.is_active ? "Active" : "Inactive",
      linkedUser:
        partner.user_id && profilesData[partner.user_id] ? profilesData[partner.user_id].business_name : "Not Linked",
      userPhone: partner.user_id && profilesData[partner.user_id] ? profilesData[partner.user_id].phone : "N/A",
      userEmail: partner.user_id && profilesData[partner.user_id] ? profilesData[partner.user_id].email : "N/A",
    })) || []

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "vehicleType",
      header: "Vehicle Type",
    },
    {
      accessorKey: "vehicleNumber",
      header: "Vehicle Number",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
            row.original.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {row.original.status}
        </div>
      ),
    },
    {
      accessorKey: "linkedUser",
      header: "Linked User",
      cell: ({ row }: any) => (
        <div
          className={`${
            row.original.linkedUser === "Not Linked" ? "text-red-500 font-medium" : "text-green-600 font-medium"
          }`}
        >
          {row.original.linkedUser}
        </div>
      ),
    },
  ]

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Delivery Partner Management</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/create-delivery-partner">Create Delivery Partner</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Delivery Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveryPartnerCount?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Linked to Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{linkedCount?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unlinked Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unlinkedCount?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivery Partner Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveryPartnerUserCount?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Partners</TabsTrigger>
          <TabsTrigger value="linked">Linked</TabsTrigger>
          <TabsTrigger value="unlinked">Unlinked</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Delivery Partners</CardTitle>
              <CardDescription>Manage all delivery partners in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={tableData} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="linked">
          <Card>
            <CardHeader>
              <CardTitle>Linked Delivery Partners</CardTitle>
              <CardDescription>Delivery partners linked to user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={tableData.filter((item) => item.linkedUser !== "Not Linked")} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="unlinked">
          <Card>
            <CardHeader>
              <CardTitle>Unlinked Delivery Partners</CardTitle>
              <CardDescription>Delivery partners not linked to any user account</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={tableData.filter((item) => item.linkedUser === "Not Linked")} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Link Delivery Partners to Users</CardTitle>
          <CardDescription>Fix the connection between delivery partner records and user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">This will:</p>
          <ul className="list-disc pl-5 mt-2 mb-4 space-y-1 text-sm text-muted-foreground">
            <li>Find all users with the role "delivery_partner"</li>
            <li>Create delivery partner records for users that don't have one</li>
            <li>Update existing delivery partner records to link to the correct user</li>
          </ul>

          <LinkDeliveryPartnersButton />
        </CardContent>
      </Card>
    </div>
  )
}
