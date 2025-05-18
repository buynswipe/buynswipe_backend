"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Code } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

export function ExecuteSQL() {
  const [isLoading, setIsLoading] = useState(false)
  const [sql, setSql] = useState("")
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  const handleExecuteSQL = async () => {
    if (!sql.trim()) {
      setResult({
        success: false,
        error: "Please enter SQL to execute",
      })
      return
    }

    try {
      setIsLoading(true)
      setResult(null)

      const response = await fetch("/api/admin/execute-sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql }),
      })

      let data
      try {
        data = await response.json()
      } catch (e) {
        console.error("Failed to parse JSON response:", e)
        throw new Error("Server returned an invalid response. Check server logs for details.")
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to execute SQL")
      }

      setResult({
        success: true,
        message: data.message || "SQL executed successfully",
      })
    } catch (error: any) {
      console.error("Error executing SQL:", error)
      setResult({
        success: false,
        error: error.message || "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadGetTableColumnsFunction = () => {
    setSql(`
CREATE OR REPLACE FUNCTION public.get_table_columns(table_name text)
RETURNS TABLE(column_name text, data_type text, is_nullable boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::text,
    c.data_type::text,
    (c.is_nullable = 'YES') AS is_nullable
  FROM 
    information_schema.columns c
  WHERE 
    c.table_schema = 'public'
    AND c.table_name = get_table_columns.table_name;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_table_columns(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_columns(text) TO service_role;
    `)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execute SQL</CardTitle>
        <CardDescription>Run SQL commands directly on the database</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          This utility allows you to execute SQL commands directly on the database. Use with caution.
        </p>

        <div className="mb-4">
          <Button variant="outline" onClick={handleLoadGetTableColumnsFunction} className="mb-2">
            <Code className="h-4 w-4 mr-2" />
            Load get_table_columns Function SQL
          </Button>
        </div>

        <Textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          placeholder="Enter SQL to execute"
          className="font-mono text-sm h-40"
        />

        {result && (
          <Alert variant={result.success ? "default" : "destructive"} className="mt-4">
            {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{result.success ? result.message : result.error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleExecuteSQL} disabled={isLoading || !sql.trim()}>
          {isLoading ? "Executing..." : "Execute SQL"}
        </Button>
      </CardFooter>
    </Card>
  )
}
