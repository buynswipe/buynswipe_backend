"use client"

import type React from "react"
import { Sidebar } from "@/components/delivery-partner/sidebar"
import { DeliveryPartnerHeader } from "@/components/delivery-partner/header"
import { MobileNavigation } from "@/components/mobile-navigation"

export function DeliveryPartnerLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Hide site header and footer on delivery partner pages */}
      <style jsx global>{`
        header.site-header, footer.site-footer {
          display: none !important;
        }
      `}</style>

      <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr]">
        <Sidebar className="hidden border-r md:block" />
        <div className="flex flex-col">
          <DeliveryPartnerHeader />
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 bg-muted/30">{children}</main>
          <MobileNavigation />
        </div>
      </div>
    </>
  )
}
