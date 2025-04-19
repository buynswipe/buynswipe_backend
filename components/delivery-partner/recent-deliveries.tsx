import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, MapPin } from "lucide-react"

interface RecentDeliveriesProps {
  title: string
  deliveries: any[]
  limit?: number
}

export function RecentDeliveries({ title, deliveries, limit = 5 }: RecentDeliveriesProps) {
  const limitedDeliveries = deliveries.slice(0, limit)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {limitedDeliveries.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No recent deliveries</p>
          </div>
        ) : (
          limitedDeliveries.map((delivery) => (
            <div key={delivery.id} className="flex items-center justify-between">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{delivery.retailer?.business_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {delivery.retailer?.address}, {delivery.retailer?.city}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{new Date(delivery.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
