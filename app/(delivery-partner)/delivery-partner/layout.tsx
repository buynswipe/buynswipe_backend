import { DeliveryPartnerHeader } from "@/components/delivery-partner/header"
import { DeliveryPartnerSidebar } from "@/components/delivery-partner/sidebar"
import type { ReactNode } from "react"

export default function DeliveryPartnerDashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <DeliveryPartnerHeader />
      <div className="flex flex-1">
        <DeliveryPartnerSidebar className="w-64 hidden md:block" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
