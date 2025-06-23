"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus } from "lucide-react"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  price: number
  barcode?: string
  category?: string
  stock: number
}

interface ProductSearchProps {
  onProductSelect: (product: Product) => void
}

export function ProductSearch({ onProductSelect }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  const searchProducts = async (term: string) => {
    if (!term.trim()) {
      setProducts([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(term)}`)

      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      toast.error("Failed to search products")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchProducts(searchTerm)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const handleProductSelect = (product: Product) => {
    if (product.stock <= 0) {
      toast.error("Product is out of stock")
      return
    }

    onProductSelect(product)
    setSearchTerm("")
    setProducts([])
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products by name or barcode..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {products.length > 0 && (
        <Card>
          <CardContent className="p-2">
            <div className="max-h-64 overflow-y-auto space-y-1">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => handleProductSelect(product)}
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>₹{product.price.toFixed(2)}</span>
                      <span>•</span>
                      <span>Stock: {product.stock}</span>
                      {product.category && (
                        <>
                          <span>•</span>
                          <span>{product.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">Searching...</p>
        </div>
      )}
    </div>
  )
}
