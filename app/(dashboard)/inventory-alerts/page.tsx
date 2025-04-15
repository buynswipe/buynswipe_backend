"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Product } from "@/types/database.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Package, AlertTriangle, Edit } from "lucide-react"

export default function InventoryAlertsPage() {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [stockQuantity, setStockQuantity] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Fetch low stock products
  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        setIsLoading(true)

        // Get user session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          throw new Error("Not authenticated")
        }

        // Fetch all products for the wholesaler
        const { data: products, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("wholesaler_id", session.user.id)
          .order("stock_quantity", { ascending: true })

        if (productsError) throw productsError

        // Filter products with low stock (less than 10% of initial quantity)
        const lowStockItems = products.filter((product) => product.stock_quantity <= product.initial_quantity * 0.1)

        setLowStockProducts(lowStockItems || [])
      } catch (error: any) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLowStockProducts()
  }, [supabase])

  // Open update stock dialog
  const openUpdateStockDialog = (product: Product) => {
    setCurrentProduct(product)
    setStockQuantity(product.stock_quantity.toString())
  }

  // Update stock quantity
  const updateStockQuantity = async () => {
    if (!currentProduct) return

    try {
      setIsUpdating(true)
      setUpdateError(null)
      setUpdateSuccess(null)

      const stockValue = Number.parseInt(stockQuantity)

      if (isNaN(stockValue) || stockValue < 0) {
        throw new Error("Stock quantity must be a non-negative integer")
      }

      // Update product stock
      const { error } = await supabase
        .from("products")
        .update({
          stock_quantity: stockValue,
        })
        .eq("id", currentProduct.id)

      if (error) throw error

      // Update local state
      if (stockValue <= currentProduct.initial_quantity * 0.1) {
        // Still low stock, update in the list
        setLowStockProducts((prevProducts) =>
          prevProducts.map((p) => (p.id === currentProduct.id ? { ...p, stock_quantity: stockValue } : p)),
        )
      } else {
        // No longer low stock, remove from the list
        setLowStockProducts((prevProducts) => prevProducts.filter((p) => p.id !== currentProduct.id))
      }

      setUpdateSuccess("Stock quantity updated successfully")

      // Close dialog after a delay
      setTimeout(() => {
        setCurrentProduct(null)
        setStockQuantity("")
        setUpdateSuccess(null)
      }, 2000)
    } catch (error: any) {
      setUpdateError(error.message)
    } finally {
      setIsUpdating(false)
    }
  }

  // Calculate stock percentage
  const calculateStockPercentage = (product: Product) => {
    return (product.stock_quantity / product.initial_quantity) * 100
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-500 rounded-md">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Inventory Alerts</h2>
        <p className="text-muted-foreground">Monitor and manage products with low stock levels.</p>
      </div>

      {lowStockProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Low Stock Products</h3>
          <p className="mt-2 text-sm text-muted-foreground">All your products have sufficient stock levels.</p>
          <Button className="mt-4" onClick={() => (window.location.href = "/products")}>
            View All Products
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lowStockProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </div>
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Low Stock
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-bold">₹{product.price.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Category: {product.category}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current Stock:</span>
                      <span className="font-medium">{product.stock_quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Initial Stock:</span>
                      <span className="font-medium">{product.initial_quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Stock Level:</span>
                      <span className="font-medium">{calculateStockPercentage(product).toFixed(1)}%</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-red-600 h-2.5 rounded-full"
                        style={{ width: `${calculateStockPercentage(product)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => openUpdateStockDialog(product)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Stock
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!currentProduct} onOpenChange={(open) => !open && setCurrentProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock Quantity</DialogTitle>
            <DialogDescription>Update the stock quantity for {currentProduct?.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stock-quantity">Stock Quantity</Label>
              <Input
                id="stock-quantity"
                type="number"
                min="0"
                step="1"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                required
              />
            </div>
            {updateError && (
              <Alert variant="destructive">
                <AlertDescription>{updateError}</AlertDescription>
              </Alert>
            )}
            {updateSuccess && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>{updateSuccess}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentProduct(null)
                setStockQuantity("")
              }}
            >
              Cancel
            </Button>
            <Button onClick={updateStockQuantity} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Stock"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
