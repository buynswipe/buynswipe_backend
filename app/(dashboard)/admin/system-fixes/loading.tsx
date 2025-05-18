import { Skeleton } from "@/components/ui/skeleton"

export default function SystemFixesLoading() {
  return (
    <div className="container py-10">
      <Skeleton className="h-10 w-64 mb-6" />
      <Skeleton className="h-6 w-full max-w-2xl mb-8" />

      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="h-[400px] w-full rounded-lg" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    </div>
  )
}
