"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, Package, Filter, Star, TrendingUp, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"

interface Product {
  id: string
  name: string
  price: number
  barcode?: string
  category?: string
  categoryId?: string
  stock: number
  costPrice?: number
  marginPercentage?: number
  isActive: boolean
  tags?: string[]
  supplier?: string
}

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

interface EnhancedProductSearchProps {
  onProductSelect: (product: Product) => void
  categories?: Category[]
  selectedCategory?: string | null
  onCategoryChange?: (categoryId: string | null) => void
}

export function EnhancedProductSearch({
  onProductSelect,
  categories = [],
  selectedCategory,
  onCategoryChange,
}: EnhancedProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock" | "popularity">("name")
  const [filterBy, setFilterBy] = useState<"all" | "low_stock" | "high_margin">("all")
  const isMobile = useIsMobile()

  const searchProducts = async (term: string, categoryId?: string | null) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (term.trim()) params.append("search", term)
      if (categoryId) params.append("category", categoryId)
      if (filterBy !== "all") params.append("filter", filterBy)
      params.append("sort", sortBy)

      const response = await fetch(`/api/products?${params.toString()}`)

      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
        setShowResults(term.trim().length > 0 || categoryId !== null)
      }
    } catch (error) {
      toast.error("Failed to search products")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchProducts(searchTerm, selectedCategory)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, selectedCategory, sortBy, filterBy])

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    switch (filterBy) {
      case "low_stock":
        filtered = filtered.filter((p) => p.stock <= 10)
        break
      case "high_margin":
        filtered = filtered.filter((p) => (p.marginPercentage || 0) > 30)
        break
    }

    switch (sortBy) {
      case "price":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "stock":
        filtered.sort((a, b) => b.stock - a.stock)
        break
      case "popularity":
        // Mock popularity sort - in real app, use sales data
        filtered.sort((a, b) => Math.random() - 0.5)
        break
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    return filtered
  }, [products, sortBy, filterBy])

  const handleProductSelect = (product: Product) => {
    if (!product.isActive) {
      toast.error("Product is inactive")
      return
    }

    if (product.stock <= 0) {
      toast.error("Product is out of stock")
      return
    }

    onProductSelect(product)
    setSearchTerm("")
    setProducts([])
    setShowResults(false)
  }

  const handleCategorySelect = (categoryId: string | null) => {
    onCategoryChange?.(categoryId)
    setSearchTerm("")
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const }
    if (stock <= 5) return { label: "Low Stock", variant: "destructive" as const }
    if (stock <= 10) return { label: "Limited", variant: "secondary" as const }
    return { label: "In Stock", variant: "default" as const }
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products by name, barcode, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`pl-10 ${isMobile ? "text-base h-12" : ""}`}
          onFocus={() => (searchTerm || selectedCategory) && setShowResults(true)}
        />
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Categories</h4>
            {selectedCategory && (
              <Button variant="ghost" size="sm" onClick={() => handleCategorySelect(null)}>
                Clear
              </Button>
            )}
          </div>
          <ScrollArea className="w-full">
            <div className="flex space-x-2 pb-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategorySelect(category.id)}
                  className="whitespace-nowrap"
                  style={{
                    backgroundColor: selectedCategory === category.id ? category.color : undefined,
                    borderColor: category.color,
                  }}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Filters and Sorting */}
      {(showResults || selectedCategory) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">All Products</option>
              <option value="low_stock">Low Stock</option>
              <option value="high_margin">High Margin</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="stock">Stock</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Searching...</p>
        </div>
      )}

      {/* Search Results */}
      {showResults && filteredProducts.length > 0 && !loading && (
        <Card>
          <CardContent className="p-2">
            <div className={`space-y-1 ${isMobile ? "max-h-80" : "max-h-64"} overflow-y-auto`}>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`flex items-center justify-between ${
                    isMobile ? "p-4" : "p-3"
                  } hover:bg-gray-50 rounded-lg cursor-pointer transition-colors ${
                    !product.isActive ? "opacity-50" : ""
                  }`}
                  onClick={() => handleProductSelect(product)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-medium ${isMobile ? "text-base" : "text-sm"} truncate`}>{product.name}</h4>
                      {product.tags && product.tags.includes("bestseller") && (
                        <Star className="h-3 w-3 text-yellow-500" />
                      )}
                      {product.tags && product.tags.includes("trending") && (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      )}
                    </div>
                    <div
                      className={`flex items-center space-x-2 ${isMobile ? "text-sm" : "text-xs"} text-gray-500 mt-1`}
                    >
                      <span className="font-medium">₹{product.price.toFixed(2)}</span>
                      {product.costPrice && (
                        <>
                          <span>•</span>
                          <span>Cost: ₹{product.costPrice.toFixed(2)}</span>
                        </>
                      )}
                      {product.marginPercentage && (
                        <>
                          <span>•</span>
                          <span className={product.marginPercentage > 30 ? "text-green-600" : ""}>
                            {product.marginPercentage.toFixed(1)}% margin
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge {...getStockStatus(product.stock)} className="text-xs">
                        {getStockStatus(product.stock).label}: {product.stock}
                      </Badge>
                      {product.category && (
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      )}
                      {product.supplier && <span className="text-xs text-gray-400">{product.supplier}</span>}
                    </div>
                    {product.barcode && (
                      <p className={`${isMobile ? "text-xs" : "text-xs"} text-gray-400 mt-1 font-mono`}>
                        {product.barcode}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {product.stock <= 5 && product.stock > 0 && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                    <Button
                      size={isMobile ? "default" : "sm"}
                      variant="ghost"
                      disabled={product.stock === 0 || !product.isActive}
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
      {showResults && filteredProducts.length === 0 && !loading && (searchTerm || selectedCategory) && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No products found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Categories (Mobile) */}
      {isMobile && !showResults && categories.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Quick Access</h4>
          <div className="grid grid-cols-2 gap-2">
            {categories.slice(0, 4).map((category) => (
              <Button
                key={category.id}
                variant="outline"
                size="sm"
                onClick={() => handleCategorySelect(category.id)}
                className="h-12 flex flex-col items-center justify-center"
                style={{ borderColor: category.color }}
              >
                <span className="text-xs font-medium">{category.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Product Stats */}
      {showResults && filteredProducts.length > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{filteredProducts.length} products found</span>
          <span>{filteredProducts.filter((p) => p.stock <= 5).length} low stock items</span>
        </div>
      )}
    </div>
  )
}
