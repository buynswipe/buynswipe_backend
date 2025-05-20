import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function ResourceNotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 md:px-6 text-center">
      <AlertCircle className="h-16 w-16 text-destructive mb-6" />
      <h1 className="text-4xl font-bold tracking-tight mb-4">Resource Not Found</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        The resource you are looking for does not exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild>
          <Link href="/resources">Browse Resources</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  )
}
