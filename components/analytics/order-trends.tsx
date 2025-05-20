"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

interface OrderTrendsProps {
  data: any[]
}

export function OrderTrends({ data }: OrderTrendsProps) {
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-[300px] w-full bg-muted/20 animate-pulse rounded-md" />
  }

  // Sort data by date (descending)
  const sortedData = [...data]
    .sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    .slice(0, 5)

  return (
    <div className="space-y-4">
      {sortedData.map((order, index) => {
        const date = new Date(order.created_at).toLocaleDateString()
        const time = new Date(order.created_at).toLocaleTimeString()

        let statusColor = "default"
        if (order.status === "completed") statusColor = "success"
        if (order.status === "pending") statusColor = "warning"
        if (order.status === "cancelled") statusColor = "destructive"

        return (
          <div key={index} className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Order #{order.id.substring(0, 8)}</p>
              <p className="text-sm text-muted-foreground">
                {date} at {time}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="font-medium">₹{order.total_amount?.toLocaleString()}</div>
              <Badge variant={statusColor as any}>{order.status}</Badge>
            </div>
          </div>
        )
      })}
    </div>
  )
}
