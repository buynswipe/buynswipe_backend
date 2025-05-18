import { CreateExecSqlFunction } from "@/components/admin/create-exec-sql-function"
import { CreateGetTableColumnsFunction } from "@/components/admin/create-get-table-columns-function"
import { FixNotificationsSchema } from "@/components/admin/fix-notifications-schema"

export default function DatabaseFixesPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Database Schema Fixes</h1>
      <p className="text-muted-foreground mb-8">
        Use these utilities to fix database schema issues. These should be run by administrators only.
      </p>

      <div className="grid gap-8">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold text-amber-800 mb-2">Important: Run These Fixes in Order</h2>
          <ol className="list-decimal list-inside text-amber-700 space-y-1">
            <li>First, create the SQL Execution Function</li>
            <li>Then, create the Table Columns Function</li>
            <li>Finally, fix the Notifications Schema</li>
          </ol>
        </div>

        <CreateExecSqlFunction />
        <CreateGetTableColumnsFunction />
        <FixNotificationsSchema />
      </div>
    </div>
  )
}
