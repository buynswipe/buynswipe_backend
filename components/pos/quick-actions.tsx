"use client"

import { Button } from "@/components/ui/button"
import { Users, Tag, Percent, BarChart3 } from "lucide-react"

interface QuickActionsProps {
  onOpenCategories: () => void
  onOpenDiscounts: () => void
  onOpenCustomers: () => void
  onOpenAnalytics: () => void
}

export function QuickActions({
  onOpenCategories,
  onOpenDiscounts,
  onOpenCustomers,
  onOpenAnalytics,
}: QuickActionsProps) {
  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm" onClick={onOpenCustomers}>
        <Users className="h-4 w-4 mr-2" />
        Customers
      </Button>
      <Button variant="outline" size="sm" onClick={onOpenCategories}>
        <Tag className="h-4 w-4 mr-2" />
        Categories
      </Button>
      <Button variant="outline" size="sm" onClick={onOpenDiscounts}>
        <Percent className="h-4 w-4 mr-2" />
        Discounts
      </Button>
      <Button variant="outline" size="sm" onClick={onOpenAnalytics}>
        <BarChart3 className="h-4 w-4 mr-2" />
        Analytics
      </Button>
    </div>
  )
}
