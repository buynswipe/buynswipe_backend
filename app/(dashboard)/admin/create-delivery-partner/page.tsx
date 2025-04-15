"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2, Truck } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function CreateDeliveryPartnerPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    error?: string
    credentials?: { email: string; password: string }
  } | null>(null)
  const { toast } = useToast()

  const createDeliveryPartner = async () => {
    setIsCreating(true)
    setResult(null)

    try {
      // First, try to create the RPC function
      try {
        await fetch("/api/admin/create-delivery-partners-table-rpc", {
          method: "POST",
        })
        // Ignore any errors, as we'll try to create the user anyway
      } catch (error) {
        console.warn("Warning: Failed to create RPC function:", error)
        // Continue anyway
      }

      // Now create the delivery partner
      const response = await fetch("/api/admin/create-delivery-partner", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          credentials: data.credentials,
        })
        toast({
          title: "Success",
          description: "Delivery partner created successfully",
        })
      } else {
        setResult({
          success: false,
          error: data.error || "Failed to create delivery partner",
        })
        toast({
          title: "Error",
          description: data.error || "Failed to create delivery partner",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error creating delivery partner:", error)
      setResult({
        success: false,
        error: error.message || "An unexpected error occurred",
      })
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Delivery Partner User</h1>
        <p className="text-muted-foreground">This will create a demo delivery partner user with fixed credentials</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Create Delivery Partner User
          </CardTitle>
          <CardDescription>This will create a delivery partner user with the following credentials:</CardDescription>
        </CardHeader>
        <CardContent>
          {result && (
            <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
              <div className="flex items-center gap-2">
                {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              </div>
              <AlertDescription>{result.success ? result.message : result.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="font-medium">
                This action will create a delivery partner user with the following credentials:
              </h3>
              <ul className="list-disc pl-5 mt-2">
                <li>Email: driver@retailbandhu.com</li>
                <li>Password: driver123</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Note: If a user with this email already exists, it will be deleted and recreated.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={createDeliveryPartner} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Delivery Partner User"
            )}
          </Button>
        </CardFooter>
      </Card>

      {result?.success && result.credentials && (
        <Card>
          <CardHeader>
            <CardTitle>Delivery Partner Created Successfully</CardTitle>
            <CardDescription>You can now log in with the following credentials:</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md">
              <div className="mb-2">
                <span className="font-semibold">Email:</span> {result.credentials.email}
              </div>
              <div>
                <span className="font-semibold">Password:</span> {result.credentials.password}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
