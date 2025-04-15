import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { AuthProvider } from "@/contexts/auth-context"
import { NotificationProvider } from "@/contexts/notification-provider"
import { headers } from "next/headers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Retail Bandhu",
  description: "Connecting retailers and wholesalers",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Check user role at the root level
  const supabase = createServerSupabaseClient()

  try {
    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      // Get user profile to check role
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

      // If user is a delivery partner and trying to access dashboard, redirect to delivery
      if (profile?.role === "delivery_partner") {
        const headersList = headers()
        const url = new URL(headersList.get("x-url") || "/", "http://localhost")
        if (url.pathname === "/dashboard") {
          redirect("/delivery")
        }
      }
    }
  } catch (error) {
    console.error("Root layout error:", error)
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}


import './globals.css'