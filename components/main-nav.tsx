import type * as React from "react"
import Link from "next/link"
import { Store } from "lucide-react"

import { cn } from "@/lib/utils"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link href="/" className="flex items-center space-x-2">
        <Store className="h-6 w-6" />
        <span className="font-bold text-xl">Retail Bandhu</span>
      </Link>
      <Link href="/features" className="text-sm font-medium transition-colors hover:text-primary">
        Features
      </Link>
      <Link href="/benefits" className="text-sm font-medium transition-colors hover:text-primary">
        Benefits
      </Link>
      <Link href="/testimonials" className="text-sm font-medium transition-colors hover:text-primary">
        Testimonials
      </Link>
      <Link href="/contact" className="text-sm font-medium transition-colors hover:text-primary">
        Contact
      </Link>
    </nav>
  )
}
