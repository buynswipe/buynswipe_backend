"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [supabase] = useState(() => createClientComponentClient())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log("Attempting to sign in with email:", email)

      // Sign in with Supabase
      const { error: signInError, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error("Sign in error:", signInError)
        throw signInError
      }

      if (!data.user) {
        throw new Error("No user returned from authentication")
      }

      console.log("Sign in successful, fetching profile")

      // Fetch user profile to determine role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_approved")
        .eq("id", data.user.id)
        .maybeSingle()

      if (profileError) {
        console.error("Error fetching profile:", profileError)
        // If there's an error fetching the profile, redirect to dashboard
        router.push("/dashboard")
        return
      }

      // If no profile found, redirect to dashboard
      if (!profile) {
        console.warn("No profile found for user, redirecting to dashboard")
        router.push("/dashboard")
        return
      }

      // Check if user is approved
      if (!profile.is_approved) {
        router.push("/pending-approval")
        return
      }

      console.log("Login successful, redirecting based on role:", profile.role)

      // Redirect based on role
      if (profile.role === "delivery_partner") {
        router.push("/delivery/my-deliveries")
      } else {
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Login error:", error)

      // Provide more specific error messages
      if (error.message === "Failed to fetch") {
        setError("Connection error. Please check your internet connection and try again.")
      } else if (error.message.includes("Invalid login")) {
        setError("Invalid email or password. Please try again.")
      } else {
        setError(error.message || "An error occurred during login. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Demo login credentials
  const loginAsAdmin = () => {
    setEmail("admin@retailbandhu.com")
    setPassword("admin123")
  }

  const loginAsRetailer = () => {
    setEmail("retailer@retailbandhu.com")
    setPassword("retailer123")
  }

  const loginAsWholesaler = () => {
    setEmail("wholesaler@retailbandhu.com")
    setPassword("wholesaler123")
  }

  const loginAsDeliveryPartner = () => {
    setEmail("driver@retailbandhu.com")
    setPassword("driver123")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Retail Bandhu</CardTitle>
          <CardDescription className="text-center">Enter your credentials to sign in</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center space-y-2">
            <div>
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Register
              </Link>
            </div>
          </div>
          <div className="space-y-2 w-full">
            <p className="text-sm text-center font-medium">Demo Accounts</p>
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" size="sm" onClick={loginAsAdmin}>
                Admin
              </Button>
              <Button variant="outline" size="sm" onClick={loginAsRetailer}>
                Retailer
              </Button>
              <Button variant="outline" size="sm" onClick={loginAsWholesaler}>
                Wholesaler
              </Button>
              <Button variant="outline" size="sm" onClick={loginAsDeliveryPartner}>
                Driver
              </Button>
            </div>
          </div>
          <div className="text-sm text-center w-full">
            Are you a delivery partner?{" "}
            <Link href="/register-driver" className="font-medium text-primary hover:underline">
              Register here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
