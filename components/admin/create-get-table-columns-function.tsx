"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Copy } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function CreateGetTableColumnsFunction() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  const handleCreateFunction = async () => {
    try {
      setIsLoading(true)
      setResult(null)

      const response = await fetch("/api/admin/create-get-table-columns-function", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      let data
      try {
        data = await response.json()
      } catch (e) {
        console.error("Failed to parse JSON response:", e)
        throw new Error("Server returned an invalid response. Check server logs for details.")
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create get_table_columns function")
      }

      setResult({
        success: true,
        message: data.message || "get_table_columns function created successfully",
      })
    } catch (error: any) {
      console.error("Error creating get_table_columns function:", error)
      setResult({
        success: false,
        error: error.message || "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sqlScript = `
-- Create a function to get table columns
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
  `.trim()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Database Helper Function</CardTitle>
        <CardDescription>Creates the get_table_columns function needed for schema operations</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          This utility creates a PostgreSQL function that allows the application to inspect table schemas. This function
          is required for other database fixes to work properly.
        </p>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"} className="mt-4 mb-4">
            {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{result.success ? result.message : result.error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="automatic" className="mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="automatic">Automatic</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
          <TabsContent value="automatic">
            <Button onClick={handleCreateFunction} disabled={isLoading} className="w-full">
              {isLoading ? "Creating..." : "Create get_table_columns Function"}
            </Button>
          </TabsContent>
          <TabsContent value="manual">
            <div className="bg-slate-50 p-4 rounded-md mb-4 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={copyToClipboard}
                title="Copy to clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <pre className="text-xs overflow-auto whitespace-pre-wrap">{sqlScript}</pre>
            </div>
            <ol className="list-decimal list-inside text-sm text-muted-foreground mb-4 space-y-2">
              <li>Copy the SQL script above</li>
              <li>Go to the Supabase dashboard</li>
              <li>Open the SQL Editor</li>
              <li>Paste the script and run it</li>
              <li>Return here and proceed to the next step</li>
            </ol>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
