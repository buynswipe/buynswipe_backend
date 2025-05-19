"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Changed from default export to named export
export function CreateGetTableColumnsFunction() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleCreateFunction = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/create-get-table-columns-function", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create function")
      }

      setResult({
        success: true,
        message: data.message || "Function created successfully",
      })
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Table Columns Function</CardTitle>
        <CardDescription>
          Creates a database function that allows querying table column information. This is useful for dynamic queries
          and schema validation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {result && (
          <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
            {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
        <p className="text-sm text-muted-foreground mb-4">
          This function will create a PostgreSQL function called <code>get_table_columns</code> that returns column
          information for any table in the database.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleCreateFunction} disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Function"}
        </Button>
      </CardFooter>
    </Card>
  )
}

// Add this line to ensure both default and named exports are available
export default CreateGetTableColumnsFunction
