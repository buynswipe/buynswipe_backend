import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function MyDeliveriesLoading() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <Skeleton className="h-10 w-[200px] mb-2" />
        <Skeleton className="h-4 w-[300px]" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="w-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-[120px]" />
                <Skeleton className="h-5 w-[100px]" />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Skeleton className="h-4 w-4 mt-1" />
                  <div>
                    <Skeleton className="h-5 w-[150px] mb-1" />
                    <Skeleton className="h-4 w-[250px] mb-1" />
                    <Skeleton className="h-4 w-[120px]" />
                  </div>
                </div>

                <div>
                  <Skeleton className="h-4 w-[200px] mb-2" />
                  <Skeleton className="h-4 w-[250px]" />
                </div>

                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-[180px]" />
                </div>
              </div>
            </CardContent>
            <div className="p-4 pt-0">
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
