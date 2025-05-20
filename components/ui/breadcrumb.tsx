import * as React from "react"
import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  segments: {
    title: string
    href: string
  }[]
  separator?: React.ReactNode
  home?: boolean
}

export function Breadcrumb({
  segments,
  separator = <ChevronRight className="h-4 w-4" />,
  home = true,
  className,
  ...props
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm text-muted-foreground", className)}
      {...props}
    >
      <ol className="flex items-center gap-1.5">
        {home && (
          <li>
            <Link
              href="/"
              className="flex items-center gap-1 text-foreground hover:text-muted-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
        )}
        {home && segments.length > 0 && <li aria-hidden="true">{separator}</li>}
        {segments.map((segment, index) => (
          <React.Fragment key={segment.href}>
            <li>
              {index === segments.length - 1 ? (
                <span className="font-medium text-foreground">{segment.title}</span>
              ) : (
                <Link href={segment.href} className="hover:text-foreground transition-colors">
                  {segment.title}
                </Link>
              )}
            </li>
            {index < segments.length - 1 && <li aria-hidden="true">{separator}</li>}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  )
}
