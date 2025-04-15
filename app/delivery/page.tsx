import { redirect } from "next/navigation"

export default function DeliveryRedirectPage() {
  // Redirect to the new delivery partner dashboard
  redirect("/delivery-partner/dashboard")
}
