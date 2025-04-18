"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

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
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Admin
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Setup Delivery Tracking</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Setup Delivery Tracking System</CardTitle>
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

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">What This Setup Will Do</h3>
              <ul className="list-disc pl-5 text-sm text-gray-500 space-y-1">
                <li>Create the delivery_updates table if it doesn't exist</li>
                <li>Set up row-level security policies for proper data access</li>
                <li>Create initial delivery status records for existing orders</li>
                <li>Configure real-time updates for delivery tracking</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Prerequisites</h3>
              <ul className="list-disc pl-5 text-sm text-gray-500 space-y-1">
                <li>You must have admin privileges to run this setup</li>
                <li>The SETUP_SECRET_TOKEN environment variable must be set</li>
                <li>Existing orders will be initialized with their current status</li>
              </ul>
            </div>

            <div className="bg-amber-50 p-4 rounded-md">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> This should only be run once. Running it multiple times may create duplicate
                records.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
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
