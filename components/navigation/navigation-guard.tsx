"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function NavigationGuard() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function checkNavigation() {
      // Only run this check on the products page
      if (pathname === "/products") {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

          if (profile && ["admin", "retailer", "wholesaler"].includes(profile.role)) {
            router.replace("/manage-products")
          }
        }
      }
    }

    checkNavigation()
  }, [pathname, router, supabase])

  return null
}
