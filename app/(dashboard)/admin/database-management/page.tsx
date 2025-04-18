import { CreateExecSqlFunction } from "@/components/admin/create-exec-sql-function"
import { CreateNotificationsTable } from "@/components/admin/create-notifications-table"
import { AddDeliveryPartnerOrderPolicy } from "@/components/admin/add-delivery-partner-order-policy"
import { FixNotificationsRLS } from "@/components/admin/fix-notifications-rls"

export default function DatabaseManagementPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6">Database Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <CreateExecSqlFunction />
        <CreateNotificationsTable />
      </div>

      <h2 className="text-2xl font-semibold mb-4">Permissions & Policies</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AddDeliveryPartnerOrderPolicy />
        <FixNotificationsRLS />
      </div>
    </div>
  )
}
