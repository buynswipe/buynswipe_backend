"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export function DatabaseMigrationAlert() {
  const [showAlert, setShowAlert] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isRunningMigration, setIsRunningMigration] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkTables = async () => {
      try {
        // Check if user is admin
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) return

        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

        setIsAdmin(profile?.role === "admin")

        // Check if delivery_partners table exists
        const { error: tableCheckError } = await supabase.from("delivery_partners").select("id").limit(1)

        if (tableCheckError && tableCheckError.message.includes('relation "delivery_partners" does not exist')) {
          setShowAlert(true)
        }
      } catch (error) {
        console.error("Error checking database tables:", error)
      }
    }

    checkTables()
  }, [supabase])

  const runMigration = async () => {
    setIsRunningMigration(true)
    try {
      const response = await fetch("/api/admin/create-delivery-partners-table-rpc", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Delivery partners table created successfully",
        })
        setShowAlert(false)
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create delivery partners table",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error running migration:", error)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsRunningMigration(false)
    }
  }

  if (!showAlert) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Database Migration Required</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          The delivery partners feature requires database migration.
          {isAdmin
            ? " Please run the migration to create the necessary tables."
            : " Please contact your administrator."}
        </p>
        {isAdmin && (
          <div className="mt-2">
            <Button onClick={runMigration} disabled={isRunningMigration} size="sm" variant="secondary">
              {isRunningMigration ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Migration...
                </>
              ) : (
                "Run Migration"
              )}
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}
