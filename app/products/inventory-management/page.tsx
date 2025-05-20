import type { Metadata } from "next"
import Image from "next/image"
import { ResourcePageTemplate } from "@/components/resource-page-template"

export const metadata: Metadata = {
  title: "Inventory Management | Retail Bandhu",
  description: "Streamline your inventory management with Retail Bandhu",
}

export default function InventoryManagementPage() {
  return (
    <ResourcePageTemplate
      title="Inventory Management"
      description="Streamline your inventory management with real-time tracking, automated reordering, and comprehensive reporting."
      backLink="/products"
      backLabel="Back to Products"
    >
      <div className="space-y-8">
        <section>
          <div className="relative h-[400px] w-full rounded-lg overflow-hidden mb-6">
            <Image src="/inventory-management.png" alt="Inventory Management Dashboard" fill className="object-cover" />
          </div>

          <h2 className="text-2xl font-bold">Real-time Inventory Tracking</h2>
          <p>
            Keep track of your inventory in real-time across all your locations. Our system updates automatically as
            products are received, sold, or transferred, giving you an accurate view of your stock at all times.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Automated Reordering</h2>
          <p>
            Set up automated reordering based on minimum stock levels. When inventory falls below your specified
            threshold, the system can automatically generate purchase orders to your preferred suppliers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Batch and Expiry Tracking</h2>
          <p>
            For FMCG products, track batches and expiry dates to ensure proper stock rotation and minimize waste.
            Receive alerts for products approaching their expiry date so you can take appropriate action.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Comprehensive Reporting</h2>
          <p>
            Generate detailed reports on inventory turnover, stock valuation, slow-moving items, and more. Use these
            insights to optimize your purchasing decisions and improve cash flow.
          </p>
        </section>
      </div>
    </ResourcePageTemplate>
  )
}
