"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"

export function FixNotificationsSchema() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)

  const handleFix = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/fix-notifications-schema", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fix notifications schema")
      }

      setResult({
        success: true,
        message: data.message || "Notifications schema fixed successfully",
      })
    } catch (error: any) {
      console.error("Error fixing notifications schema:", error)
      setResult({
        success: false,
        error: error.message || "An error occurred while fixing the notifications schema",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fix Notifications Schema</CardTitle>
        <CardDescription>
          This will add missing columns to the notifications table and fix any invalid UUIDs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {result && (
          <div
            className={`p-4 mb-4 rounded-md ${
              result.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            <div className="flex items-start">
              {result.success ? (
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2 mt-0.5" />
              )}
              <div>
                {result.success ? (
                  <p>{result.message}</p>
                ) : (
                  <>
                    <p className="font-medium">Error:</p>
                    <p>{result.error}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        <p className="text-sm text-gray-500">
          This operation will:
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Add a &apos;data&apos; column of type JSONB if it doesn&apos;t exist</li>
            <li>
              Add &apos;related_entity_type&apos; and &apos;related_entity_id&apos; columns if they don&apos;t exist
            </li>
            <li>Fix any invalid UUIDs in the &apos;related_entity_id&apos; column</li>
          </ul>
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleFix} disabled={isLoading}>
          {isLoading ? "Fixing..." : "Fix Notifications Schema"}
        </Button>
      </CardFooter>
    </Card>
  )
}
