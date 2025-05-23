"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Package, Store, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (!open) {
      setQuery("")
      setResults([])
    }
  }, [open])

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        // Search orders
        const { data: orders } = await supabase
          .from("orders")
          .select("id, status, created_at, total_amount")
          .or(`id.ilike.%${query}%, reference.ilike.%${query}%`)
          .limit(5)

        // Search products
        const { data: products } = await supabase
          .from("products")
          .select("id, name, sku")
          .or(`name.ilike.%${query}%, sku.ilike.%${query}%`)
          .limit(5)

        // Search retailers
        const { data: retailers } = await supabase
          .from("profiles")
          .select("id, business_name")
          .eq("role", "retailer")
          .ilike("business_name", `%${query}%`)
          .limit(5)

        // Search wholesalers
        const { data: wholesalers } = await supabase
          .from("profiles")
          .select("id, business_name")
          .eq("role", "wholesaler")
          .ilike("business_name", `%${query}%`)
          .limit(5)

        // Combine results
        setResults([
          ...(orders || []).map((order) => ({
            type: "order",
            id: order.id,
            title: `Order #${order.id.substring(0, 8)}`,
            description: `${order.status} - ${new Date(order.created_at).toLocaleDateString()}`,
            url: `/orders/${order.id}`,
            icon: FileText,
          })),
          ...(products || []).map((product) => ({
            type: "product",
            id: product.id,
            title: product.name,
            description: `SKU: ${product.sku}`,
            url: `/products/${product.id}`,
            icon: Package,
          })),
          ...(retailers || []).map((retailer) => ({
            type: "retailer",
            id: retailer.id,
            title: retailer.business_name,
            description: "Retailer",
            url: `/retailers/${retailer.id}`,
            icon: Store,
          })),
          ...(wholesalers || []).map((wholesaler) => ({
            type: "wholesaler",
            id: wholesaler.id,
            title: wholesaler.business_name,
            description: "Wholesaler",
            url: `/wholesalers/${wholesaler.id}`,
            icon: Store,
          })),
        ])
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query, supabase])

  const handleSelect = (item: any) => {
    setOpen(false)
    router.push(item.url)
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search...</span>
        <span className="sr-only">Search</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search orders, products, retailers..."
          value={query}
          onValueChange={setQuery}
          ref={inputRef}
        />
        <CommandList>
          <CommandEmpty>{loading ? "Searching..." : "No results found."}</CommandEmpty>
          {results.length > 0 && (
            <>
              <CommandGroup heading="Orders">
                {results
                  .filter((item) => item.type === "order")
                  .map((item) => (
                    <CommandItem key={`${item.type}-${item.id}`} onSelect={() => handleSelect(item)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
              <CommandGroup heading="Products">
                {results
                  .filter((item) => item.type === "product")
                  .map((item) => (
                    <CommandItem key={`${item.type}-${item.id}`} onSelect={() => handleSelect(item)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
              <CommandGroup heading="Businesses">
                {results
                  .filter((item) => item.type === "retailer" || item.type === "wholesaler")
                  .map((item) => (
                    <CommandItem key={`${item.type}-${item.id}`} onSelect={() => handleSelect(item)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
