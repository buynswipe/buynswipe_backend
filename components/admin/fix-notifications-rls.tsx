"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function FixNotificationsRLS() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleFixRLS = async () => {
    try {
      setIsLoading(true)
      setResult(null)

      const response = await fetch("/api/admin/fix-notifications-rls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fix notification RLS policies")
      }

      setResult({
        success: true,
        message: data.message || "Notification RLS policies updated successfully",
      })
    } catch (error) {
      console.error("Error fixing notification RLS policies:", error)
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fix Notification Permissions</CardTitle>
        <CardDescription>
          Update row-level security policies for the notifications table to allow delivery partners to receive
          notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          This will fix issues with delivery partners not receiving notifications about assigned deliveries. Run this if
          delivery partners are not seeing their assigned deliveries or if you see notification permission errors.
        </p>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"} className="mt-4">
            {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleFixRLS} disabled={isLoading}>
          {isLoading ? "Fixing..." : "Fix Notification Permissions"}
        </Button>
      </CardFooter>
    </Card>
  )
}
