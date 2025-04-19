"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Truck, Package, XCircle, Filter } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface QuickFiltersProps {
  onFilterChange: (filter: string) => void
  counts: {
    all: number
    placed: number
    confirmed: number
    dispatched: number
    delivered: number
    rejected: number
  }
  currentFilter: string
}

export function QuickFilters({ onFilterChange, counts, currentFilter }: QuickFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const filters = [
    { id: "all", label: "All", icon: Package, count: counts.all },
    { id: "placed", label: "New", icon: Clock, count: counts.placed },
    { id: "confirmed", label: "Confirmed", icon: CheckCircle, count: counts.confirmed },
    { id: "dispatched", label: "Dispatched", icon: Truck, count: counts.dispatched },
    { id: "delivered", label: "Delivered", icon: CheckCircle, count: counts.delivered },
    { id: "rejected", label: "Rejected", icon: XCircle, count: counts.rejected },
  ]

  // Desktop view
  const desktopFilters = (
    <div className="hidden md:flex space-x-2 overflow-x-auto pb-2 mb-4">
      {filters.map((filter) => (
        <Button
          key={filter.id}
          variant={currentFilter === filter.id ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.id)}
          className="flex items-center gap-2"
        >
          <filter.icon className="h-4 w-4" />
          <span>{filter.label}</span>
          <Badge variant="secondary" className="ml-1">
            {filter.count}
          </Badge>
        </Button>
      ))}
    </div>
  )

  // Mobile view
  const mobileFilters = (
    <div className="md:hidden flex items-center justify-between mb-4">
      <Select value={currentFilter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter orders" />
        </SelectTrigger>
        <SelectContent>
          {filters.map((filter) => (
            <SelectItem key={filter.id} value={filter.id}>
              <div className="flex items-center gap-2">
                <filter.icon className="h-4 w-4" />
                <span>{filter.label}</span>
                <Badge variant="secondary" className="ml-1">
                  {filter.count}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[50vh]">
          <SheetHeader>
            <SheetTitle>Filter Orders</SheetTitle>
          </SheetHeader>
          <div className="grid gap-2 py-4">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={currentFilter === filter.id ? "default" : "outline"}
                className={cn("justify-start", currentFilter === filter.id ? "bg-primary text-primary-foreground" : "")}
                onClick={() => {
                  onFilterChange(filter.id)
                  setIsOpen(false)
                }}
              >
                <filter.icon className="mr-2 h-4 w-4" />
                {filter.label}
                <Badge variant="secondary" className="ml-auto">
                  {filter.count}
                </Badge>
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )

  return (
    <>
      {desktopFilters}
      {mobileFilters}
    </>
  )
}
