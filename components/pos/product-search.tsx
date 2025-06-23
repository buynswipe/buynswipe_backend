"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Package } from "lucide-react"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"

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
  const [showResults, setShowResults] = useState(false)
  const isMobile = useIsMobile()

  const searchProducts = async (term: string) => {
    if (!term.trim()) {
      setProducts([])
      setShowResults(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(term)}`)

      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
        setShowResults(true)
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
    setShowResults(false)
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products by name or barcode..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`pl-10 ${isMobile ? "text-base h-12" : ""}`}
          onFocus={() => searchTerm && setShowResults(true)}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Searching...</p>
        </div>
      )}

      {/* Search Results */}
      {showResults && products.length > 0 && (
        <Card>
          <CardContent className="p-2">
            <div className={`space-y-1 ${isMobile ? "max-h-80" : "max-h-64"} overflow-y-auto`}>
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`flex items-center justify-between ${
                    isMobile ? "p-4" : "p-3"
                  } hover:bg-gray-50 rounded-lg cursor-pointer transition-colors`}
                  onClick={() => handleProductSelect(product)}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium ${isMobile ? "text-base" : "text-sm"} truncate`}>{product.name}</h4>
                    <div
                      className={`flex items-center space-x-2 ${isMobile ? "text-sm" : "text-xs"} text-gray-500 mt-1`}
                    >
                      <span>₹{product.price.toFixed(2)}</span>
                      <span>•</span>
                      <span className={product.stock <= 5 ? "text-red-500 font-medium" : ""}>
                        Stock: {product.stock}
                      </span>
                      {product.category && (
                        <>
                          <span>•</span>
                          <span>{product.category}</span>
                        </>
                      )}
                    </div>
                    {product.barcode && (
                      <p className={`${isMobile ? "text-xs" : "text-xs"} text-gray-400 mt-1`}>{product.barcode}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {product.stock <= 5 && product.stock > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        Low Stock
                      </Badge>
                    )}
                    {product.stock === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Out of Stock
                      </Badge>
                    )}
                    <Button
                      size={isMobile ? "default" : "sm"}
                      variant="ghost"
                      disabled={product.stock === 0}
                      className={isMobile ? "h-10 w-10" : "h-8 w-8"}
                    >
                      <Plus className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {showResults && products.length === 0 && !loading && searchTerm && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No products found</p>
            <p className="text-sm text-gray-400">Try a different search term</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Categories (Mobile) */}
      {isMobile && !showResults && (
        <div className="grid grid-cols-2 gap-2">
          {["Electronics", "Groceries", "Clothing", "Books"].map((category) => (
            <Button key={category} variant="outline" size="sm" onClick={() => setSearchTerm(category)} className="h-12">
              {category}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
