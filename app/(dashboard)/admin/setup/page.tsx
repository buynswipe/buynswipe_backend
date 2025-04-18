"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    error?: string
    ordersProcessed?: number
  } | null>(null)
  const router = useRouter()

  const runSetup = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // Get the token from localStorage or prompt the user
      let token = localStorage.getItem("setupToken")

      if (!token) {
        token = prompt("Please enter the setup token:")
        if (token) {
          localStorage.setItem("setupToken", token)
        } else {
          setResult({ error: "Setup token is required" })
          setIsLoading(false)
          return
        }
      }

      const response = await fetch(`/api/admin/setup-delivery-tracking?token=${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        setResult({
          success: false,
          error: data.error || "An error occurred during setup",
        })

        // If unauthorized, clear the token
        if (response.status === 401) {
          localStorage.removeItem("setupToken")
        }
      } else {
        setResult({
          success: true,
          message: data.message,
          ordersProcessed: data.ordersProcessed,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Setup Delivery Tracking</CardTitle>
          <CardDescription>
            Run this setup once to create the delivery tracking database and initialize existing orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result?.success && (
            <Alert className="mb-4 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                {result.message}
                {result.ordersProcessed !== undefined && (
                  <p className="mt-2">Processed {result.ordersProcessed} orders.</p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {result?.error && (
            <Alert className="mb-4 bg-red-50" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{result.error}</AlertDescription>
            </Alert>
          )}

          <p className="text-sm text-gray-500 mb-4">This process will:</p>
          <ul className="list-disc pl-5 text-sm text-gray-500 space-y-1 mb-4">
            <li>Create the delivery_updates table if it doesn't exist</li>
            <li>Set up row-level security policies</li>
            <li>Create initial delivery status records for existing orders</li>
          </ul>
          <p className="text-sm text-gray-500">
            <strong>Note:</strong> This should only be run once. Running it multiple times may create duplicate records.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/admin")}>
            Back to Admin
          </Button>
          <Button onClick={runSetup} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              "Run Setup"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
