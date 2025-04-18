import { AddDeliveryPartnerOrderPolicy } from "@/components/admin/add-delivery-partner-order-policy"

export default function DeliveryPartnerPermissionsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Delivery Partner Permissions</h1>
      <div className="grid gap-6">
        <AddDeliveryPartnerOrderPolicy />
      </div>
    </div>
  )
}
