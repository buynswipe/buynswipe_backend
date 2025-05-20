"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)

    // Format error details for display
    setErrorDetails(`${error.name}: ${error.message}${error.stack ? `\n\nStack trace:\n${error.stack}` : ""}`)
  }, [error])

  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message || "An unexpected error occurred"}</AlertDescription>
          </Alert>

          <p className="text-sm text-muted-foreground mb-4">
            We apologize for the inconvenience. Our team has been notified of this issue.
          </p>

          {errorDetails && (
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)} className="mb-2">
                {showDetails ? "Hide" : "Show"} technical details
              </Button>

              {showDetails && (
                <pre className="mt-2 max-h-[200px] overflow-auto rounded bg-slate-950 p-4 text-xs text-white">
                  {errorDetails}
                </pre>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go to Home
          </Button>
          <Button onClick={reset}>Try again</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
