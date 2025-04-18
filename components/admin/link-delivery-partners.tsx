"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function LinkDeliveryPartners() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    total: number
    created: number
    existing: number
    errors: number
  } | null>(null)

  async function handleLinkDeliveryPartners() {
    try {
      setLoading(true)

      const response = await fetch("/api/admin/link-delivery-partners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to link delivery partners")
      }

      setResults(data.results)
      toast({
        title: "Success",
        description: `Linked ${data.results.created} delivery partners`,
        variant: "default",
      })
    } catch (error: any) {
      console.error("Error linking delivery partners:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to link delivery partners",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Link Delivery Partners</CardTitle>
        <CardDescription>Create delivery partner records for users with the delivery_partner role</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          This will check all user profiles with the delivery_partner role and create corresponding records in the
          delivery_partners table if they don't already exist.
        </p>

        {results && (
          <div className="bg-muted p-4 rounded-md mb-4">
            <h4 className="font-medium mb-2">Results:</h4>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-muted-foreground">Total profiles checked:</span> {results.total}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>New records created:</span> {results.created}
              </li>
              <li className="flex items-center gap-2">
                <span>Records already existing:</span> {results.existing}
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
        <Button onClick={handleLinkDeliveryPartners} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Processing..." : "Link Delivery Partners"}
        </Button>
      </CardFooter>
    </Card>
  )
}
