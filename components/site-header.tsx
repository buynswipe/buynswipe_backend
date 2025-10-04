"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { isPublicRoute } from "@/lib/public-routes"

export function SiteHeader() {
  const pathname = usePathname()
  const isPublic = isPublicRoute(pathname || "/")

  // In preview we always show the header. If you later enable auth, you can hide for protected routes.
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-6">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Retail%20Bandhu%20Icon-UTC7N2g2VekiBnTd3BPQpxy6SJtc59.png"
            alt="Retail Bandhu"
            className="h-9 w-9 rounded-md"
          />
          <span className="hidden text-base font-semibold sm:inline">Retail Bandhu</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink href="/features" label="Features" currentPath={pathname} />
          <NavLink href="/products" label="Products" currentPath={pathname} />
          <NavLink href="/company" label="Company" currentPath={pathname} />
          <NavLink href="/contact" label="Contact" currentPath={pathname} />
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

function NavLink({
  href,
  label,
  currentPath,
}: {
  href: string
  label: string
  currentPath: string | null
}) {
  const isActive = currentPath === href
  return (
    <Link
      href={href}
      className={`text-sm ${isActive ? "font-semibold text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
    >
      {label}
    </Link>
  )
}
