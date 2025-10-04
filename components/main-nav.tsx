"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function MainNav() {
  const pathname = usePathname()
  const links = [
    { href: "/features", label: "Features" },
    { href: "/products", label: "Products" },
    { href: "/company", label: "Company" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <nav className="hidden items-center gap-6 md:flex">
      {links.map((l) => {
        const active = pathname === l.href
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`text-sm ${active ? "font-semibold text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
          >
            {l.label}
          </Link>
        )
      })}
    </nav>
  )
}
