"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface BreadcrumbProps {
  segments: {
    title: string
    href: string
  }[]
}

export function Breadcrumb({ segments }: BreadcrumbProps) {
  return (
    <nav className="flex items-center text-sm text-muted-foreground">
      {segments.map((segment, index) => (
        <div key={segment.href} className="flex items-center">
          {index > 0 && <ChevronRight className="mx-1 h-4 w-4" />}
          <Link
            href={segment.href}
            className={index === segments.length - 1 ? "font-medium text-foreground" : "hover:text-foreground"}
          >
            {segment.title}
          </Link>
        </div>
      ))}
    </nav>
  )
}
