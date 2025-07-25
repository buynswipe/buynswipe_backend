import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { AuthProvider } from "@/contexts/auth-context"
import { NotificationProvider } from "@/contexts/notification-provider"
import { NavigationGuard } from "@/components/navigation/navigation-guard"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Retail Bandhu - Connecting Retailers and Wholesalers",
  description:
    "Streamline your retail business with our comprehensive platform for inventory management, order processing, and delivery tracking.",
  generator: "v0.dev",
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

    // Additional session handling can be done here
  } catch (error) {
    console.error("Root layout error:", error)
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NotificationProvider>
            <NavigationGuard />
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
