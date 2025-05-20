"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface InventoryStatusProps {
  data: any[]
}

export function InventoryStatus({ data }: InventoryStatusProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-[300px] w-full bg-muted/20 animate-pulse rounded-md" />
  }

  // Sort data by inventory count (ascending)
  const sortedData = [...data].sort((a, b) => (a.inventory_count || 0) - (b.inventory_count || 0))

  return (
    <div className="space-y-4">
      {sortedData.map((product) => {
        const inventoryCount = product.inventory_count || 0
        let status = "In Stock"
        let color = "bg-green-500"

        if (inventoryCount <= 0) {
          status = "Out of Stock"
          color = "bg-red-500"
        } else if (inventoryCount < 10) {
          status = "Low Stock"
          color = "bg-yellow-500"
        }

        return (
          <div key={product.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">{product.name}</div>
              <Badge variant={inventoryCount <= 0 ? "destructive" : inventoryCount < 10 ? "outline" : "default"}>
                {status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={Math.min(inventoryCount * 5, 100)} className="h-2" />
              <span className="text-sm text-muted-foreground w-10 text-right">{inventoryCount}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
