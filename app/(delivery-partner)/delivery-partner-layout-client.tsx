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

      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
        <Sidebar className="hidden border-r md:block" />
        <div className="flex flex-col">
          <DeliveryPartnerHeader />
          <main id="main-content" className="flex-1 p-4 md:p-6 pb-20 md:pb-6 animate-in">
            {children}
          </main>
          <MobileNavigation />
        </div>
      </div>
    </>
  )
}
