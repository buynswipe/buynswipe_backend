import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface ResourcePageTemplateProps {
  title: string
  description: string
  children: React.ReactNode
  backLink?: string
  backLabel?: string
}

export function ResourcePageTemplate({
  title,
  description,
  children,
  backLink = "/",
  backLabel = "Back to Home",
}: ResourcePageTemplateProps) {
  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 p-0 hover:bg-transparent">
          <Link href={backLink} className="flex items-center text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
        <h1 className="text-4xl font-bold tracking-tight mb-4">{title}</h1>
        <p className="text-xl text-muted-foreground">{description}</p>
      </div>
      <div className="prose prose-slate max-w-none dark:prose-invert">{children}</div>
    </div>
  )
}
