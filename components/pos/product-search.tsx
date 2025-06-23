"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Package } from "lucide-react"
import Image from "next/image"

interface Product {
  id: string
  name: string
  sku?: string
  price: number
  stock_quantity: number
  category: string
  image_url?: string
}

interface ProductSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchQuery: string
  onProductSelect: (product: Product) => void
}

export function ProductSearch({ open, onOpenChange, searchQuery, onProductSelect }: ProductSearchProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState(searchQuery)

  useEffect(() => {
    if (open && searchQuery) {
      setQuery(searchQuery)
      searchProducts(searchQuery)
    }
  }, [open, searchQuery])

  const searchProducts = async (searchTerm: string) => {
    if (!searchTerm.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/pos/products/search?q=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.products)
      }
    } catch (error) {
      console.error("Error searching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (query.trim()) {
      searchProducts(query.trim())
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Products
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by name, SKU, or description..."
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Searching products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No products found</p>
                <p className="text-sm text-gray-400">Try a different search term</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => onProductSelect(product)}
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {product.image_url ? (
                        <Image
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-medium">{product.name}</h4>
                      {product.sku && <p className="text-sm text-gray-500">SKU: {product.sku}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{product.category}</Badge>
                        <span className="text-sm text-gray-500">Stock: {product.stock_quantity}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-lg">₹{product.price.toFixed(2)}</p>
                      <Button size="sm">Add to Cart</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
