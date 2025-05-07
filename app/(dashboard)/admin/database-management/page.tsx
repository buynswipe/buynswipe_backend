import { CreateNotificationsTable } from "@/components/admin/create-notifications-table"
import { CreateExecSqlFunction } from "@/components/admin/create-exec-sql-function"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DatabaseManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Database Management</h2>
        <p className="text-muted-foreground">Manage your database tables and functions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CreateNotificationsTable />
        <CreateExecSqlFunction />

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
