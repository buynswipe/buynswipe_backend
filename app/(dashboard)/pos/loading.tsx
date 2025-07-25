import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function POSLoading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Main POS Interface Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Search and Categories */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="cursor-pointer">
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart and Checkout */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center p-2 border rounded">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between font-bold">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>

              {/* Payment Buttons */}
              <div className="space-y-2 pt-4">
                <Skeleton className="h-10 w-full" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
