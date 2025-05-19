import type { Metadata } from "next"
import { CreateSqlFunction } from "@/components/admin/create-sql-function"
import { CreateNotificationsTable } from "@/components/admin/create-notifications-table"
import { CreateMessageQueueTables } from "@/components/admin/create-message-queue-tables"
import { AddReferenceNumberToOrders } from "@/components/admin/add-reference-number-to-orders"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Database Management",
  description: "Manage database tables and functions",
}

export default function DatabaseManagementPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Database Management</h1>

      <div className="grid gap-6">
        <CreateSqlFunction />
        <AddReferenceNumberToOrders />
        <CreateNotificationsTable />
        <CreateMessageQueueTables />

        {/* Placeholder for future components */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Partners Table</CardTitle>
            <CardDescription>Create or update the delivery partners table structure.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">This functionality will be available soon.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Earnings Table</CardTitle>
            <CardDescription>Create or update the delivery partner earnings table.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">This functionality will be available soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
