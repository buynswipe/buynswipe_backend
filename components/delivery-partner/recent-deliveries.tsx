import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Order } from "@/types/database.types"

interface RecentDeliveriesProps {
  title: string
  deliveries: Order[]
  limit?: number
}

export function RecentDeliveries({ title, deliveries, limit = 5 }: RecentDeliveriesProps) {
  const displayDeliveries = deliveries.slice(0, limit)

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-4">
        {displayDeliveries.map((delivery) => (
          <div key={delivery.id} className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">Order #{delivery.id.substring(0, 8)}</p>
              <p className="text-sm text-muted-foreground">Status: {delivery.status}</p>
            </div>
            <Button asChild size="sm">
              <Link href={`/delivery/tracking/${delivery.id}`}>View Details</Link>
            </Button>
          </div>
        ))}
      </div>

      {deliveries.length > limit && (
        <div className="mt-4 text-center">
          <Button asChild variant="outline">
            <Link href={title.includes("Active") ? "/delivery/active" : "/delivery/completed"}>View All {title}</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
