import { createServerComponentClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { CreateExecSqlFunction } from "@/components/admin/create-exec-sql-function"
import { CreateNotificationsTable } from "@/components/admin/create-notifications-table"
import { FixNotificationsSchema } from "@/components/admin/fix-notifications-schema"

export const dynamic = "force-dynamic"

export default async function DatabaseManagementPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user profile to check role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Database Management</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <CreateExecSqlFunction />
        <CreateNotificationsTable />
        <FixNotificationsSchema />
      </div>
    </div>
  )
}
