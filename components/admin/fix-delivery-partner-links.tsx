"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface FixResult {
  partner: string
  success: boolean
  message: string
}

export function FixDeliveryPartnerLinks() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<FixResult[] | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runFix = async () => {
    try {
      setIsLoading(true)
      setResults(null)
      setSummary(null)
      setError(null)

      const response = await fetch("/api/admin/fix-delivery-partner-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fix delivery partner links")
      }

      setResults(data.results || [])
      setSummary(data.message || "Process completed")
    } catch (err: any) {
      console.error("Error fixing delivery partner links:", err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fix Delivery Partner Links</CardTitle>
        <CardDescription>
          Links unlinked delivery partners to their user accounts based on matching email or phone number.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {summary && (
          <Alert className="bg-green-50 border-green-200 mb-4">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Summary</AlertTitle>
            <AlertDescription>{summary}</AlertDescription>
          </Alert>
        )}

        <p className="text-sm text-muted-foreground mb-4">
          This utility will find delivery partners that are not linked to user accounts and attempt to link them based
          on matching email or phone number. This is necessary for delivery partners to receive notifications and see
          their assigned deliveries.
        </p>

        {results && results.length > 0 && (
          <div className="mt-4 border rounded-md">
            <div className="bg-muted px-4 py-2 font-medium border-b">Results</div>
            <div className="divide-y">
              {results.map((result, index) => (
                <div key={index} className="px-4 py-3 flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-medium">{result.partner}</div>
                    <div className="text-sm text-muted-foreground">{result.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={runFix} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fixing...
            </>
          ) : (
            "Fix Delivery Partner Links"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
