import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, CheckCircle } from "lucide-react"

interface DeliveryStatsProps {
  activeDeliveries: number
  completedDeliveries: number
  pendingDeliveries: number
  totalEarnings: number
}

export function DeliveryStats({
  activeDeliveries,
  completedDeliveries,
  pendingDeliveries,
  totalEarnings,
}: DeliveryStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeDeliveries}</div>
          <p className="text-xs text-muted-foreground">Currently in progress</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Deliveries</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedDeliveries}</div>
          <p className="text-xs text-muted-foreground">Successfully delivered</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{totalEarnings.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Total earnings from deliveries</p>
        </CardContent>
      </Card>
    </div>
  )
}
