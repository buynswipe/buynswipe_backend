"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Search, Package, ShoppingCart, User, Store, CreditCard } from "lucide-react"

export function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<any[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const [categories, setCategories] = React.useState<{
    orders: any[]
    products: any[]
    customers: any[]
    wholesalers: any[]
  }>({ orders: [], products: [], customers: [], wholesalers: [] })

  const supabase = createClientComponentClient()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const search = React.useCallback(async (term: string) => {
    if (!term || term.length < 2) {
      setResults([])
      setCategories({ orders: [], products: [], customers: [], wholesalers: [] })
      return
    }

    setIsSearching(true)
    try {
      // Here we would typically make API calls to search different entities
      // For now, let's mock it with some fake data

      // Wait a bit to simulate loading
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Simulate results
      const orders =
        term === "order"
          ? [
              { id: "ord001", name: "Order #12345", type: "order", status: "pending" },
              { id: "ord002", name: "Order #67890", type: "order", status: "completed" },
            ]
          : []

      const products =
        term === "product"
          ? [
              { id: "prod001", name: "Smartphone X1", type: "product", price: "₹12,000" },
              { id: "prod002", name: "Tablet Pro", type: "product", price: "₹24,000" },
            ]
          : []

      const customers =
        term === "customer"
          ? [
              { id: "cust001", name: "Raj Electronics", type: "customer", location: "Mumbai" },
              { id: "cust002", name: "Sharma Store", type: "customer", location: "Delhi" },
            ]
          : []

      const wholesalers =
        term === "wholesaler"
          ? [
              { id: "whole001", name: "Tech Distributors Ltd", type: "wholesaler", location: "Bangalore" },
              { id: "whole002", name: "Mega Supplies Inc", type: "wholesaler", location: "Chennai" },
            ]
          : []

      setCategories({
        orders,
        products,
        customers,
        wholesalers,
      })

      setResults([...orders, ...products, ...customers, ...wholesalers])
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }, [])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      search(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, search])

  const handleSelect = (item: any) => {
    setOpen(false)

    switch (item.type) {
      case "order":
        router.push(`/orders/${item.id}`)
        break
      case "product":
        router.push(`/manage-products?id=${item.id}`)
        break
      case "customer":
        router.push(`/users?id=${item.id}`)
        break
      case "wholesaler":
        router.push(`/wholesalers/${item.id}`)
        break
      default:
        break
    }
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="mr-2 h-4 w-4" />
      case "product":
        return <Package className="mr-2 h-4 w-4" />
      case "customer":
        return <User className="mr-2 h-4 w-4" />
      case "wholesaler":
        return <Store className="mr-2 h-4 w-4" />
      default:
        return <Search className="mr-2 h-4 w-4" />
    }
  }

  return (
    <>
      <div className="w-full md:w-64 lg:w-80">
        <button
          onClick={() => setOpen(true)}
          className="group w-full flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Search className="h-4 w-4" />
          <span className="text-sm">Search anything...</span>
          <kbd className="pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search orders, products, customers..." value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>
              {isSearching ? (
                <div className="py-6 text-center text-sm">
                  <div
                    className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-primary rounded-full"
                    role="status"
                  >
                    <span className="sr-only">Loading...</span>
                  </div>
                  <p className="mt-2">Searching...</p>
                </div>
              ) : query.length > 0 ? (
                "No results found."
              ) : (
                "Type a command or search..."
              )}
            </CommandEmpty>

            {categories.orders.length > 0 && (
              <CommandGroup heading="Orders">
                {categories.orders.map((item) => (
                  <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    <span>{item.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground capitalize">{item.status}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {categories.products.length > 0 && (
              <CommandGroup heading="Products">
                {categories.products.map((item) => (
                  <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
                    <Package className="mr-2 h-4 w-4" />
                    <span>{item.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{item.price}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {categories.customers.length > 0 && (
              <CommandGroup heading="Customers">
                {categories.customers.map((item) => (
                  <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>{item.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{item.location}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {categories.wholesalers.length > 0 && (
              <CommandGroup heading="Wholesalers">
                {categories.wholesalers.map((item) => (
                  <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
                    <Store className="mr-2 h-4 w-4" />
                    <span>{item.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{item.location}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandSeparator />
            <CommandGroup heading="Suggestions">
              <CommandItem onSelect={() => router.push("/orders/new")}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                <span>Create new order</span>
              </CommandItem>
              <CommandItem onSelect={() => router.push("/manage-products?new=true")}>
                <Package className="mr-2 h-4 w-4" />
                <span>Add new product</span>
              </CommandItem>
              <CommandItem onSelect={() => router.push("/analytics")}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>View analytics</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
