"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export function CreateNotificationsTable() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  const handleCreateTable = async () => {
    try {
      setIsLoading(true)
      setResult(null)

      const response = await fetch("/api/admin/create-notifications-table", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create notifications table")
      }

      setResult({ success: true, message: data.message || "Notifications table created successfully" })
    } catch (error: any) {
      console.error("Error creating notifications table:", error)
      setResult({ success: false, error: error.message || "An unexpected error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Notifications Table</CardTitle>
        <CardDescription>
          Create the notifications table in the database to enable notification functionality.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {result && result.success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
        {result && !result.success && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        )}
        <p className="text-sm text-muted-foreground">
          This will create the notifications table in your database if it doesn't already exist. This table is required
          for the notification system to work properly.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleCreateTable} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Notifications Table"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
