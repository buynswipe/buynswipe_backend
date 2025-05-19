"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function CreateMessageQueueTables() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  const handleCreateTables = async () => {
    try {
      setIsLoading(true)
      setResult(null)

      const response = await fetch("/api/admin/create-message-queue-tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create message queue tables")
      }

      setResult({
        success: true,
        message: data.message || "Message queue tables created successfully",
      })
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Message Queue Tables</CardTitle>
        <CardDescription>Set up the database tables required for the queue-based notification system</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          This will create the necessary tables for the queue-based notification system:
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-500 mb-4">
          <li>message_queue - Stores messages to be processed</li>
          <li>processed_messages - Tracks processed messages for deduplication</li>
        </ul>

        {result && (
          <Alert className={result.success ? "bg-green-50" : "bg-red-50"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{result.success ? result.message : result.error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleCreateTables} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Tables...
            </>
          ) : (
            "Create Message Queue Tables"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
