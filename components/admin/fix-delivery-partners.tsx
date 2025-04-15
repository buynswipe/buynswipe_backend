"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function FixDeliveryPartners() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  async function handleFixDeliveryPartners() {
    try {
      setLoading(true)
      setResult(null)

      // Use the Pages Router API endpoint
      const response = await fetch("/api/admin/fix-delivery-partners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fix delivery partners")
      }

      setResult({
        success: true,
        message: data.message || "Delivery partners fixed successfully",
      })

      toast({
        title: "Success",
        description: data.message || "Delivery partners fixed successfully",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Error fixing delivery partners:", error)

      setResult({
        success: false,
        error: error.message || "Failed to fix delivery partners",
      })

      toast({
        title: "Error",
        description: error.message || "Failed to fix delivery partners",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fix Delivery Partners</CardTitle>
        <CardDescription>
          Resolve issues with delivery partner accounts and ensure proper linking between user accounts and delivery
          partner records
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          This will:
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Create the delivery_partners table if it doesn't exist</li>
            <li>Link existing delivery partner user accounts to delivery_partners records</li>
            <li>Fix missing vehicle information for delivery partners</li>
          </ul>
        </p>

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
              <AlertDescription>{result.success ? result.message : result.error}</AlertDescription>
            </div>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleFixDeliveryPartners} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Fixing..." : "Fix Delivery Partners"}
        </Button>
      </CardFooter>
    </Card>
  )
}
