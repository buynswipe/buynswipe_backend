"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function CreateExecSqlFunction() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleCreateFunction = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/create-exec-sql", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: "SQL execution function created successfully!",
        })
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to create SQL execution function.",
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: "An unexpected error occurred.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SQL Execution Function</CardTitle>
        <CardDescription>Create the exec_sql function for database management.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          This will create a PostgreSQL function that allows executing SQL statements from the application.
        </p>

        {result && (
          <Alert className={`mb-4 ${result.success ? "bg-green-50" : "bg-red-50"}`}>
            {result.success ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleCreateFunction} disabled={isLoading} className="w-full">
          {isLoading ? "Creating..." : "Create SQL Function"}
        </Button>
      </CardContent>
    </Card>
  )
}
