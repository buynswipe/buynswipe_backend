import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container py-10">
      <Skeleton className="h-10 w-64 mb-6" />
      <Skeleton className="h-5 w-full max-w-2xl mb-8" />

      <div className="grid gap-8">
        <Skeleton className="h-[300px] w-full" />
      </div>
    </div>
  )
}
