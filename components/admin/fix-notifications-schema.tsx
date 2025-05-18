"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Copy, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function FixNotificationsSchema() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  const handleFixSchema = async () => {
    try {
      setIsLoading(true)
      setResult(null)

      const response = await fetch("/api/admin/fix-notifications-schema", {
        method: "POST",
      })

      let data
      try {
        data = await response.json()
      } catch (e) {
        console.error("Failed to parse JSON response:", e)
        throw new Error("Server returned an invalid response. Check server logs for details.")
      }

      if (!response.ok || !data.success) {
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
        error: error.message || "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sqlScript = `
-- Check if notifications table exists, create it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
    CREATE TABLE public.notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      related_entity_type TEXT,
      related_entity_id TEXT
    );
  ELSE
    -- Check if related_entity_type column exists, add it if it doesn't
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'notifications' 
                  AND column_name = 'related_entity_type') THEN
      ALTER TABLE public.notifications ADD COLUMN related_entity_type TEXT;
    END IF;

    -- Check if related_entity_id column exists, add it if it doesn't
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'notifications' 
                  AND column_name = 'related_entity_id') THEN
      ALTER TABLE public.notifications ADD COLUMN related_entity_id TEXT;
    END IF;

    -- Check if entity_type column exists and related_entity_type doesn't have values
    IF EXISTS (SELECT FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'notifications' 
              AND column_name = 'entity_type') 
       AND EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'notifications' 
                  AND column_name = 'related_entity_type') THEN
      -- Copy values from entity_type to related_entity_type if related_entity_type is null
      UPDATE public.notifications 
      SET related_entity_type = entity_type 
      WHERE related_entity_type IS NULL AND entity_type IS NOT NULL;
    END IF;

    -- Check if entity_id column exists and related_entity_id doesn't have values
    IF EXISTS (SELECT FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'notifications' 
              AND column_name = 'entity_id') 
       AND EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'notifications' 
                  AND column_name = 'related_entity_id') THEN
      -- Copy values from entity_id to related_entity_id if related_entity_id is null
      UPDATE public.notifications 
      SET related_entity_id = entity_id 
      WHERE related_entity_id IS NULL AND entity_id IS NOT NULL;
    END IF;
  END IF;
END $$;

-- Create RLS policies for the notifications table
DO $$
BEGIN
  -- Enable RLS on the notifications table
  ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
  DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

  -- Create policies
  CREATE POLICY "Users can view their own notifications" 
    ON public.notifications FOR SELECT 
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can update their own notifications" 
    ON public.notifications FOR UPDATE 
    USING (auth.uid() = user_id);
END $$;
  `.trim()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fix Notifications Schema</CardTitle>
        <CardDescription>
          Resolves issues with the notifications table schema that may prevent delivery assignments from working
          properly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          This utility will check and fix the notifications table schema to ensure it has the correct columns for
          delivery partner notifications. Run this if delivery partners are not seeing their assigned deliveries.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-amber-800">What this fixes</h4>
              <ul className="mt-1 text-sm text-amber-700 list-disc list-inside space-y-1">
                <li>Missing notifications table</li>
                <li>Missing columns for entity references</li>
                <li>Incorrectly named columns (entity_type vs related_entity_type)</li>
              </ul>
            </div>
          </div>
        </div>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
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
            <Button onClick={handleFixSchema} disabled={isLoading} className="w-full">
              {isLoading ? "Fixing..." : "Fix Notifications Schema"}
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
              <li>Return here and check if delivery assignments are now working</li>
            </ol>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
