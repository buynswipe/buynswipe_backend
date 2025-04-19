import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface DeliveryTrackingProps {
  orderId: string
}

export function DeliveryTracking({ orderId }: DeliveryTrackingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Tracking</CardTitle>
        <CardDescription>Delivery tracking is not yet implemented</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Delivery tracking is not yet implemented</p>
      </CardContent>
    </Card>
  )
}
