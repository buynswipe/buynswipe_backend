"use client"

import { ErrorBoundary } from "@/components/error-boundary"

export default function DeliveryPartnerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorBoundary error={error} reset={reset} />
}
