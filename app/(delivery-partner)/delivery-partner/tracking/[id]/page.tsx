import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertCircle, Info } from "lucide-react"
import { OrderTrackingClient } from "./client"
import { logError } from "@/lib/debug-helpers"
import { directOrderService } from "@/lib/direct-order-service"
import type { DeliveryTrackingPageProps } from "@/types/page-props"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

export default async function DeliveryTrackingPage({ params }: DeliveryTrackingPageProps) {
  const { id } = params
  const supabase = createServerComponentClient({ cookies })

  // Custom not found UI
  const NotFoundUI = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <div className="text-red-500 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold mb-2">Order Not Found</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        We couldn't find the order you're looking for. It may have been deleted or you may have entered an incorrect
        URL.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="default" asChild>
          <a href="/delivery-partner/active">View Active Deliveries</a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/delivery-partner/dashboard">Go to Dashboard</a>
        </Button>
      </div>
    </div>
  )

  try {
    console.log(`[DeliveryTrackingPage] Starting page load for order ID: ${id}`)

    // Check authentication first
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.log(`[DeliveryTrackingPage] No session found, redirecting to login`)
      return redirect("/login?redirect=" + encodeURIComponent(`/delivery-partner/tracking/${id}`))
    }

    console.log(`[DeliveryTrackingPage] User authenticated: ${session.user.id}`)

    // Get the user's profile to check if they're a delivery partner
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      logError("Delivery tracking - profile lookup", profileError)
      throw new Error(`Failed to fetch user profile: ${profileError.message}`)
    }

    if (!userProfile || userProfile.role !== "delivery_partner") {
      console.error(`[DeliveryTrackingPage] User ${session.user.id} is not a delivery partner`)
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don't have permission to view this order.</p>
          <Button variant="default" asChild>
            <a href="/delivery-partner/dashboard">Go to Dashboard</a>
          </Button>
        </div>
      )
    }

    console.log(`[DeliveryTrackingPage] User is a delivery partner, proceeding with order lookup`)

    // Use the direct order service to find the order with admin privileges
    const { order, source, error: lookupError, _debug } = await directOrderService.findOrderDirect(id)

    // If we couldn't find the order
    if (!order) {
      console.error(
        `[DeliveryTrackingPage] Order not found after exhausting all lookup methods: ${lookupError || "No error details"}`,
      )
      return <NotFoundUI />
    }

    console.log(`[DeliveryTrackingPage] Successfully found order: ${order.id} via ${source} lookup`)

    // Skip permission check in development mode
    const isDebugMode = _debug === true

    // Get delivery status updates
    const { data: statusUpdates, error: statusError } = await supabase
      .from("delivery_status_updates")
      .select("*")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true })

    if (statusError) {
      logError("Delivery tracking - status updates", statusError)
    }

    // Get delivery proof
    const { data: deliveryProof, error: proofError } = await supabase
      .from("delivery_proofs")
      .select("*")
      .eq("order_id", order.id)
      .maybeSingle()

    if (proofError) {
      logError("Delivery tracking - delivery proof", proofError)
    }

    const isDelivered = order.status === "delivered"
    const isCod = order.payment_method === "cod"

    console.log(`[DeliveryTrackingPage] Successfully loaded all data for order ${order.id}`)

    // Show debug banner if using mock data
    const DebugBanner = () => {
      if (!isDebugMode) return null

      return (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-700">Debug Mode Active</p>
              <p className="text-sm text-yellow-600">
                This is a mock order created for testing purposes. Some features may not work as expected.
              </p>
            </div>
          </div>
        </div>
      )
    }

    // Pass all data to the client component
    return (
      <>
        {isDebugMode && <DebugBanner />}
        <OrderTrackingClient
          order={order}
          statusUpdates={statusUpdates || []}
          deliveryProof={deliveryProof}
          isDelivered={isDelivered}
          isCod={isCod}
        />
      </>
    )
  } catch (error) {
    logError("Delivery tracking - unexpected error", error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">
          We encountered an error while loading the order details.
          {error instanceof Error ? ` (${error.message})` : ""}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="default" asChild>
            <a href={`/delivery-partner/tracking/${id}`}>Try again</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/delivery-partner/active">Go to Active Deliveries</a>
          </Button>
        </div>
      </div>
    )
  }
}
