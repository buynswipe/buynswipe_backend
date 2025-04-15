"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function CreateEarningsTable() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleCreateTable = async () => {
    try {
      setIsLoading(true)
      setResult(null)

      const response = await fetch("/api/admin/create-delivery-partner-earnings-table", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || "Delivery partner earnings table created successfully!",
        })
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to create delivery partner earnings table",
        })
      }
    } catch (error) {
      console.error("Error creating table:", error)
      setResult({
        success: false,
        message: "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Delivery Partner Earnings Table</CardTitle>
        <CardDescription>Create the database table needed to track delivery partner earnings</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          This will create the delivery_partner_earnings table in your database if it doesn't already exist. This table
          is required for tracking payments to delivery partners.
        </p>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
            {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleCreateTable} disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Table"}
        </Button>
      </CardFooter>
    </Card>
  )
}
