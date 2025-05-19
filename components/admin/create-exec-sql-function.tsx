"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Copy } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function CreateExecSqlFunction() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showManualInstructions, setShowManualInstructions] = useState(false)

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
          message: data.message || "SQL execution function created successfully!",
        })
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to create SQL execution function.",
        })
        setShowManualInstructions(true)
      }
    } catch (error) {
      setResult({
        success: false,
        message: "An unexpected error occurred.",
      })
      setShowManualInstructions(true)
    } finally {
      setIsLoading(false)
    }
  }

  const sqlScript = `
-- Create the exec_sql function
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
  `.trim()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SQL Execution Function</CardTitle>
        <CardDescription>Create the exec_sql function for database management.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          This will create a PostgreSQL function that allows executing SQL statements from the application. This
          function is required before other database fixes can work.
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

        <Tabs defaultValue="automatic" className="mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="automatic">Automatic</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
          <TabsContent value="automatic">
            <Button onClick={handleCreateFunction} disabled={isLoading} className="w-full">
              {isLoading ? "Creating..." : "Create SQL Function"}
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
