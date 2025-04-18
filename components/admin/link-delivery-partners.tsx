"use client"

import { useState } from "@/lib/use"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LinkDeliveryPartners() {
  const [loading, setLoading] = useState(false)
  const [result, setResults] = useState<{
    success: boolean
    message?: string
    details?: {
      created: number
      updated: number
      orphaned: number
      total: number
    }
  } | null>(null)

  const handleLinkDeliveryPartners = async () => {
    setLoading(true)
    setResults(null)

    try {
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

      setResults(data)
      toast({
        title: "Success",
        description: `Linked ${data.details?.updated || 0} delivery partners and created ${
          data.details?.created || 0
        } new records.`,
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
        <CardTitle>Link Delivery Partners to Users</CardTitle>
        <CardDescription>Fix the connection between delivery partner records and user accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">This will:</p>
        <ul className="list-disc pl-5 mt-2 mb-4 space-y-1 text-sm text-muted-foreground">
          <li>Find all users with the role "delivery_partner"</li>
          <li>Create delivery partner records for users that don't have one</li>
          <li>Update existing delivery partner records to link to the correct user</li>
        </ul>

        {result && (
          <Alert
            variant={result.success ? "default" : "destructive"}
            className={result.success ? "bg-green-50 text-green-800 border-green-200" : undefined}
          >
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{result.message}</AlertDescription>
            </div>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleLinkDeliveryPartners} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Fixing..." : "Link Delivery Partners"}
        </Button>
      </CardFooter>
    </Card>
  )
}
