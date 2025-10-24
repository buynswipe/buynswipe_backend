import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClientLayout } from "@/components/client-layout" // Import the ClientLayout component

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Retail Bandhu - Connecting Retailers, Wholesalers & Delivery Partners",
  description:
    "Digitizing India's FMCG supply chain: procurement, logistics, payments, and analytics for retailers and wholesalers.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-white text-slate-900`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
