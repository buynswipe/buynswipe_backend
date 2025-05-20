import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Documentation - Retail Bandhu",
  description: "Comprehensive documentation for the Retail Bandhu platform",
}

export default function DocumentationPage() {
  return (
    <div className="container py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl/tight">Documentation</h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive guides and references for the Retail Bandhu platform
          </p>
        </div>
        <div className="space-y-8">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-bold">Getting Started</h2>
            <p className="mt-2 text-muted-foreground">
              Learn the basics of the Retail Bandhu platform and how to set up your account.
            </p>
            <Button variant="link" className="mt-4 p-0" asChild>
              <Link href="/resources/documentation/getting-started">Read More</Link>
            </Button>
          </div>
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-bold">API Reference</h2>
            <p className="mt-2 text-muted-foreground">
              Detailed documentation for the Retail Bandhu API endpoints and integration options.
            </p>
            <Button variant="link" className="mt-4 p-0" asChild>
              <Link href="/resources/documentation/api-reference">Read More</Link>
            </Button>
          </div>
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-bold">User Guides</h2>
            <p className="mt-2 text-muted-foreground">
              Step-by-step guides for using the various features of the Retail Bandhu platform.
            </p>
            <Button variant="link" className="mt-4 p-0" asChild>
              <Link href="/resources/documentation/user-guides">Read More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
