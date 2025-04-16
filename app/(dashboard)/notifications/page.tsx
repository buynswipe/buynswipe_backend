import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserNotifications } from "@/lib/notification-api"

export default async function NotificationsPage() {
  const supabase = createServerSupabaseClient()

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (!profile) {
    redirect("/login")
  }

  // Get notifications
  const { data: notifications } = await getUserNotifications(session.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Notifications</h1>
        <p className="text-muted-foreground">View and manage your notifications.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications && notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">No notifications found</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
