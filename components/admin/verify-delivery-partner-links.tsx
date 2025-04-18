"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function VerifyDeliveryPartnerLinks() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  async function handleVerifyLinks() {
    try {
      setLoading(true)
      setResults(null)

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

      setResults(data)
      toast({
        title: "Fix Complete",
        description: `Linked ${data.details.created} new, and fixed ${data.details.updated} existing delivery partners successfully.`,
        variant: "default",
      })
    } catch (error: any) {
      console.error("Error verifying delivery partner links:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to verify delivery partner links",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fix Delivery Partner Links</CardTitle>
        <CardDescription>Repair inconsistencies in delivery partner links</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          This will create missing delivery partner records, update links between profiles and delivery partners, and
          fix orders with incorrect delivery partner IDs.
        </p>

        {results && (
          <div className="bg-muted p-4 rounded-md mb-4">
            <h4 className="font-medium mb-2">Results:</h4>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>New delivery partner records created:</span> {results.details?.created}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Delivery partner records updated:</span> {results.details?.updated}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Orders fixed:</span> {results.details?.ordersFixed}
              </li>
              {results.details?.errors > 0 && (
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">Errors encountered:</span> {results.details.errors}
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleVerifyLinks} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Verifying..." : "Fix Links"}
        </Button>
      </CardFooter>
    </Card>
  )
}
