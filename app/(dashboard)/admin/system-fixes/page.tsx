import { FixNotificationsSchema } from "@/components/admin/fix-notifications-schema"
import { FixDeliveryPartnerLinks } from "@/components/admin/fix-delivery-partner-links"

export default function SystemFixesPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">System Fixes</h1>
      <p className="text-muted-foreground mb-8">
        Use these utilities to fix common issues with the system. These should be run by administrators only.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <FixNotificationsSchema />
        <FixDeliveryPartnerLinks />
      </div>
    </div>
  )
}
