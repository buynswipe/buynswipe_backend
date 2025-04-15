"use client"

import type React from "react"
import dynamic from "next/dynamic"
import { Suspense } from "react"

// This component's sole purpose is to handle the dynamic import with ssr: false
export default function DynamicClientLoader({ fallback }: { fallback: React.ReactNode }) {
  // Dynamic import with ssr: false is only used in this client component
  const WholesalerDashboardClient = dynamic(() => import("./client-page"), {
    ssr: false,
    loading: () => <div>{fallback}</div>,
  })

  return (
    <Suspense fallback={fallback}>
      <WholesalerDashboardClient />
    </Suspense>
  )
}
