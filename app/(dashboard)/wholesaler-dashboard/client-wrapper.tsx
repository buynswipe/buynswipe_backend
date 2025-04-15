"use client"

import type React from "react"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import WholesalerDashboardServer from "./server-page"

// Dynamically import the client component with no SSR
const WholesalerDashboardClient = dynamic(() => import("./client-page"), {
  ssr: false,
  loading: () => <WholesalerDashboardServer />,
})

export default function WholesalerDashboardWrapper({
  fallback = <WholesalerDashboardServer />,
}: {
  fallback?: React.ReactNode
}) {
  return (
    <Suspense fallback={fallback}>
      <WholesalerDashboardClient fallback={fallback} />
    </Suspense>
  )
}
