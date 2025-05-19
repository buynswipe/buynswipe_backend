import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-red-500 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold mb-2">Order Not Found</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        We couldn't find the order you're looking for. It may have been deleted or you may have entered an incorrect
        URL.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/delivery-partner/active">View Active Deliveries</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/delivery-partner/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
