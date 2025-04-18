"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function FixDeliveryPartnerLinks() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  async function handleFixLinks() {
    try {
      setLoading(true)

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

      setResults(data.results)
      toast({
        title: "Fix Complete",
        description: `Created ${data.results.created}, updated ${data.results.updated}, fixed ${data.results.ordersFixed} orders`,
        variant: "default",
      })
    } catch (error: any) {
      console.error("Error fixing delivery partner links:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fix delivery partner links",
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
                <span>New delivery partner records created:</span> {results.created}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Delivery partner records updated:</span> {results.updated}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Orders with fixed delivery partner IDs:</span> {results.ordersFixed}
              </li>
              {results.errors > 0 && (
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">Errors encountered:</span> {results.errors}
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleFixLinks} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Fixing..." : "Fix Links"}
        </Button>
      </CardFooter>
    </Card>
  )
}
