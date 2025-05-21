"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Package, ShoppingBag, User, Settings, Search } from "lucide-react"

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [results, setResults] = React.useState<any[]>([])
  const supabase = createClientComponentClient()

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  const handleSearch = async (value: string) => {
    setQuery(value)

    if (value.length < 2) {
      setResults([])
      return
    }

    setLoading(true)

    try {
      // Search products
      const { data: products } = await supabase
        .from("products")
        .select("id, name, category")
        .ilike("name", `%${value}%`)
        .limit(5)

      // Search orders
      const { data: orders } = await supabase
        .from("orders")
        .select("id, status, total_amount")
        .or(`id.ilike.%${value}%,status.ilike.%${value}%`)
        .limit(5)

      // Combine results
      setResults([
        ...(products || []).map((product) => ({
          type: "product",
          id: product.id,
          title: product.name,
          subtitle: product.category,
          url: `/products/${product.id}`,
        })),
        ...(orders || []).map((order) => ({
          type: "order",
          id: order.id,
          title: `Order #${order.id.substring(0, 8)}`,
          subtitle: `${order.status} - ₹${order.total_amount}`,
          url: `/orders/${order.id}`,
        })),
      ])
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (url: string) => {
    onOpenChange(false)
    router.push(url)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search for products, orders, customers..."
        value={query}
        onValueChange={handleSearch}
      />
      <CommandList>
        {loading && (
          <div className="py-6 text-center text-sm">
            <div
              className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-primary rounded-full"
              role="status"
            >
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-2 text-muted-foreground">Searching...</p>
          </div>
        )}

        <CommandEmpty>No results found.</CommandEmpty>

        {results.length > 0 && (
          <>
            <CommandGroup heading="Products">
              {results
                .filter((item) => item.type === "product")
                .map((item) => (
                  <CommandItem key={item.id} onSelect={() => handleSelect(item.url)} className="flex items-center">
                    <Package className="mr-2 h-4 w-4" />
                    <div>
                      <p>{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>

            <CommandGroup heading="Orders">
              {results
                .filter((item) => item.type === "order")
                .map((item) => (
                  <CommandItem key={item.id} onSelect={() => handleSelect(item.url)} className="flex items-center">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <div>
                      <p>{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />

        <CommandGroup heading="Quick Links">
          <CommandItem onSelect={() => handleSelect("/dashboard")}>
            <Search className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/orders")}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>Orders</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/products")}>
            <Package className="mr-2 h-4 w-4" />
            <span>Products</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/profile")}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
