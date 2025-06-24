"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScanLine, Search, Package, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  price: number
  barcode: string
  category?: string
  stock: number
}

interface QuickBarcodeLookupProps {
  onProductFound: (product: Product) => void
  onOpenScanner: () => void
}

export function QuickBarcodeLookup({ onProductFound, onOpenScanner }: QuickBarcodeLookupProps) {
  const [barcode, setBarcode] = useState("")
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)

  const lookupBarcode = async (code: string) => {
    if (!code.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/barcode/${encodeURIComponent(code)}`)

      if (response.ok) {
        const product = await response.json()
        setLastResult(product)
        onProductFound(product)
        setBarcode("")
        toast.success(`Found: ${product.name}`)
      } else if (response.status === 404) {
        setError("Product not found for this barcode")
        toast.error("Product not found")
      } else {
        throw new Error("Lookup failed")
      }
    } catch (error) {
      setError("Failed to lookup barcode")
      toast.error("Failed to lookup barcode")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    lookupBarcode(barcode)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Handle barcode scanner input (usually ends with Enter)
    if (e.key === "Enter") {
      e.preventDefault()
      lookupBarcode(barcode)
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <div className="flex-1 relative">
          <Input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Scan or enter barcode..."
            className="pr-10"
            disabled={loading}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <Button type="button" variant="outline" onClick={onOpenScanner} disabled={loading}>
          <ScanLine className="h-4 w-4" />
        </Button>
        <Button type="submit" disabled={!barcode.trim() || loading}>
          {loading ? "..." : "Lookup"}
        </Button>
      </form>

      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {lastResult && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{lastResult.name}</h4>
                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                  <span>₹{lastResult.price.toFixed(2)}</span>
                  {lastResult.category && (
                    <>
                      <span>•</span>
                      <span>{lastResult.category}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{lastResult.stock} in stock</span>
                </div>
                <p className="text-xs text-gray-400 font-mono mt-1">{lastResult.barcode}</p>
              </div>
              <Badge variant="secondary">
                <Package className="h-3 w-3 mr-1" />
                Found
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
