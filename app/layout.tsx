import type React from "react"
import type { Metadata } from "next"
import { AiBandhuWrapper } from "@/components/ai-bandhu/ai-bandhu-wrapper"
import "@/styles/globals.css" // Import globals.css here

export const metadata: Metadata = {
  title: "Retail Bandhu",
  description: "Your Digital Supply Chain Partner",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <AiBandhuWrapper />
      </body>
    </html>
  )
}
