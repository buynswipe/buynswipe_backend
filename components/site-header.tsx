import Link from "next/link"
import { Store } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Store className="h-6 w-6" />
            <span className="font-bold text-xl">Retail Bandhu</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/features" className="text-sm font-medium hover:text-primary">
            Features
          </Link>
          <Link href="/benefits" className="text-sm font-medium hover:text-primary">
            Benefits
          </Link>
          <Link href="/testimonials" className="text-sm font-medium hover:text-primary">
            Testimonials
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary">
            Login
          </Link>
          <Button asChild>
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
