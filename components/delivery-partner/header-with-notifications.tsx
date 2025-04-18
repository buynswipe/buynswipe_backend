"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useDeliveryAssignments } from "@/lib/delivery-assignment-service"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface DeliveryPartnerHeaderProps {
  title: string
}

export function DeliveryPartnerHeaderWithNotifications({ title }: DeliveryPartnerHeaderProps) {
  const { newAssignments } = useDeliveryAssignments()

  return (
    <div className="flex h-16 items-center px-4 border-b bg-white">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="mr-2 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] sm:w-[280px]">
          <nav className="flex flex-col gap-4 mt-8">
            <Link href="/delivery-partner/dashboard" className="text-sm font-medium">
              Dashboard
            </Link>
            <Link href="/delivery-partner/active" className="text-sm font-medium flex items-center">
              Active Deliveries
              {newAssignments > 0 && (
                <Badge className="ml-2 bg-red-500 text-white" variant="secondary">
                  {newAssignments}
                </Badge>
              )}
            </Link>
            <Link href="/delivery-partner/my-deliveries" className="text-sm font-medium">
              My Deliveries
            </Link>
            <Link href="/delivery-partner/completed" className="text-sm font-medium">
              Completed
            </Link>
            <Link href="/delivery-partner/profile" className="text-sm font-medium">
              Profile
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex items-center justify-between w-full">
        <h1 className="text-lg font-semibold">{title}</h1>
        {newAssignments > 0 && (
          <Button asChild variant="default" size="sm" className="bg-red-500 hover:bg-red-600">
            <Link href="/delivery-partner/active">
              {newAssignments} New {newAssignments === 1 ? "Assignment" : "Assignments"}
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
