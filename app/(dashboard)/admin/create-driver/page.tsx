"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CreateDriverPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [constraintUpdated, setConstraintUpdated] = useState(false)

  const updateConstraint = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/admin/update-profiles-role-constraint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update constraint")
      }

      setSuccess("Successfully updated profiles role constraint. You can now create a delivery partner user.")
      setConstraintUpdated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const createDriver = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/admin/create-driver-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create driver user")
      }

      setSuccess(
        "Successfully created delivery partner user with email: driver@retailbandhu.com and password: driver123",
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create Delivery Partner User</CardTitle>
          <CardDescription>This will create a demo delivery partner user with fixed credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              This action will create a delivery partner user with the following credentials:
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Email: driver@retailbandhu.com</li>
              <li>Password: driver123</li>
            </ul>
            <p className="text-sm text-gray-500">
              Note: If a user with this email already exists, it will be deleted and recreated.
            </p>
          </div>

          {!constraintUpdated ? (
            <Button onClick={updateConstraint} disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? "Updating..." : "Step 1: Update Database Constraint"}
            </Button>
          ) : (
            <Button onClick={createDriver} disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? "Creating..." : "Step 2: Create Delivery Partner User"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
