import { VerifyDeliveryPartnerLinks } from "@/components/admin/verify-delivery-partner-links"

export default function VerifyLinksPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Delivery Partner Link Verification</h1>
      <VerifyDeliveryPartnerLinks />
    </div>
  )
}
