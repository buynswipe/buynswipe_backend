"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function ChatMigrationAlert() {
  const [isRunningMigration, setIsRunningMigration] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const runChatMigration = async () => {
    setIsRunningMigration(true)
    try {
      // Check if user is admin
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to run the migration",
          variant: "destructive",
        })
        setIsRunningMigration(false)
        return
      }

      // Check if user is admin
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

      if (profile?.role !== "admin") {
        toast({
          title: "Admin access required",
          description: "Only administrators can run database migrations",
          variant: "destructive",
        })
        setIsRunningMigration(false)
        return
      }

      // Run the migration
      const response = await fetch("/api/admin/run-chat-migration", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Chat support tables created successfully",
        })
        // Refresh the page to show the chat widget
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create chat support tables",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error running chat migration:", error)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsRunningMigration(false)
    }
  }

  return (
    <Alert className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Chat Support Not Available</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>
          The chat support system requires database tables to be created. Please run the database migration to enable
          chat support.
        </p>
        <div className="flex gap-2">
          <Button onClick={runChatMigration} disabled={isRunningMigration} size="sm">
            {isRunningMigration ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Migration...
              </>
            ) : (
              "Run Database Migration"
            )}
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/database">Go to Database Management</Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
