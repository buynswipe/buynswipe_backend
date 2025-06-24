"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MobilePOSCart } from "@/components/pos/mobile-pos-cart"
import {
  Calculator,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Settings,
  Printer,
  CreditCard,
  Search,
  Banknote,
  Smartphone,
  Users,
  BarChart3,
  Package,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  barcode?: string
  category?: string
  discount?: number
  discountType?: "percentage" | "fixed"
}

interface POSSession {
  id: string
  startTime: Date
  openingCash: number
  totalSales: number
  totalTransactions: number
}

interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
  loyaltyPoints: number
}

interface Category {
  id: string
  name: string
  color: string
  icon: string
  productCount: number
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [session, setSession] = useState<POSSession | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [showPayment, setShowPayment] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showMobileCart, setShowMobileCart] = useState(false)

  const [lastTransaction, setLastTransaction] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("products")
  const isMobile = useIsMobile()

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity
    const itemDiscount = item.discount || 0
    return sum + (itemTotal - itemDiscount)
  }, 0)

  const tax = subtotal * 0.18 // 18% GST
  const total = subtotal + tax

  useEffect(() => {
    initializeSession()
    loadCategories()
  }, [])

  const initializeSession = async () => {
    try {
      setError(null)
      const response = await fetch("/api/pos/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openingCash: 1000 }),
      })

      if (response.ok) {
        const sessionData = await response.json()
        setSession(sessionData)
        toast.success("POS session started")
      } else {
        throw new Error("Failed to start session")
      }
    } catch (error: any) {
      console.error("Failed to start POS session:", error)
      setError("Failed to start POS session")
      toast.error("Failed to start POS session")
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/pos/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error("Failed to load categories:", error)
    }
  }

  const searchProducts = async (term: string) => {
    if (!term.trim()) {
      setProducts([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append("search", term)
      if (selectedCategory) {
        params.append("category", selectedCategory)
      }

      const response = await fetch(`/api/products?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else {
        throw new Error("Failed to search products")
      }
    } catch (error: any) {
      console.error("Failed to search products:", error)
      setError("Failed to search products")
      toast.error("Failed to search products")
    } finally {
      setLoading(false)
    }
  }

  const addToCart = useCallback(
    (product: any) => {
      if (!product.id || !product.name || !product.price) {
        toast.error("Invalid product data")
        return
      }

      const existingItem = cart.find((item) => item.id === product.id)

      if (existingItem) {
        setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
      } else {
        setCart([...cart, { ...product, quantity: 1 }])
      }

      toast.success(`${product.name} added to cart`)
    },
    [cart],
  )

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(id)
        return
      }

      setCart(cart.map((item) => (item.id === id ? { ...item, quantity } : item)))
    },
    [cart],
  )

  const removeFromCart = useCallback(
    (id: string) => {
      setCart(cart.filter((item) => item.id !== id))
      toast.success("Item removed from cart")
    },
    [cart],
  )

  const clearCart = useCallback(() => {
    setCart([])
    setSelectedCustomer(null)
    toast.success("Cart cleared")
  }, [])

  const handlePaymentComplete = async (paymentData: any) => {
    try {
      setError(null)
      const transactionData = {
        sessionId: session?.id,
        customerId: selectedCustomer?.id,
        items: cart,
        subtotal,
        tax,
        total,
        paymentData,
        loyaltyPointsEarned: Math.floor(total / 10), // 1 point per ₹10
      }

      const response = await fetch("/api/pos/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      })

      if (response.ok) {
        const result = await response.json()
        setLastTransaction(result.transaction)
        setShowPayment(false)
        setShowReceipt(true)
        clearCart()
        toast.success("Transaction completed successfully")
      } else {
        throw new Error("Transaction failed")
      }
    } catch (error: any) {
      console.error("Transaction failed:", error)
      setError("Transaction failed")
      toast.error("Transaction failed")
    }
  }

  // Enhanced Product Search Component
  const ProductSearch = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products by name, barcode, or category..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            searchProducts(e.target.value)
          }}
          className={`pl-10 ${isMobile ? "text-base h-12" : ""}`}
        />
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Categories</h4>
            {selectedCategory && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
                Clear
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedCategory(category.id)
                  if (searchTerm) {
                    searchProducts(searchTerm)
                  }
                }}
                className="text-xs"
                style={{
                  backgroundColor: selectedCategory === category.id ? category.color : undefined,
                  borderColor: category.color,
                }}
              >
                {category.name} ({category.productCount})
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Searching products...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center py-4 text-red-600">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Search Results */}
      {products.length > 0 && !loading && (
        <Card>
          <CardContent className="p-2">
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  onClick={() => addToCart(product)}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{product.name}</h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                      <span>₹{product.price?.toFixed(2) || "0.00"}</span>
                      {product.category && (
                        <>
                          <span>•</span>
                          <span>{product.category}</span>
                        </>
                      )}
                      {product.stock !== undefined && (
                        <>
                          <span>•</span>
                          <span className={product.stock <= 5 ? "text-red-500" : ""}>{product.stock} in stock</span>
                        </>
                      )}
                    </div>
                    {product.barcode && <p className="text-xs text-gray-400 mt-1 font-mono">{product.barcode}</p>}
                  </div>
                  <Button size="sm" variant="ghost" className="ml-4">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {searchTerm && products.length === 0 && !loading && !error && (
        <div className="text-center py-8">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No products found</p>
          <p className="text-sm text-gray-400">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  )

  // Enhanced Payment Dialog
  const PaymentDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Payment Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Summary */}
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (18%):</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Customer Info */}
          {selectedCustomer && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{selectedCustomer.name}</p>
                  <p className="text-xs text-gray-600">
                    {selectedCustomer.loyaltyPoints} points • Earning {Math.floor(total / 10)} points
                  </p>
                </div>
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          )}

          {/* Payment Methods */}
          <div className="space-y-3">
            <h4 className="font-medium">Select Payment Method</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handlePaymentComplete({ method: "cash", amount: total })}
                className="h-16 flex flex-col items-center justify-center"
                variant="outline"
              >
                <Banknote className="h-6 w-6 mb-1" />
                <span className="text-sm">Cash</span>
              </Button>
              <Button
                onClick={() => handlePaymentComplete({ method: "card", amount: total })}
                className="h-16 flex flex-col items-center justify-center"
                variant="outline"
              >
                <CreditCard className="h-6 w-6 mb-1" />
                <span className="text-sm">Card</span>
              </Button>
              <Button
                onClick={() => handlePaymentComplete({ method: "upi", amount: total })}
                className="h-16 flex flex-col items-center justify-center"
                variant="outline"
              >
                <Smartphone className="h-6 w-6 mb-1" />
                <span className="text-sm">UPI</span>
              </Button>
              <Button
                onClick={() => handlePaymentComplete({ method: "wallet", amount: total })}
                className="h-16 flex flex-col items-center justify-center"
                variant="outline"
              >
                <CreditCard className="h-6 w-6 mb-1" />
                <span className="text-sm">Wallet</span>
              </Button>
            </div>
          </div>

          <Button variant="outline" onClick={() => setShowPayment(false)} className="w-full">
            Cancel Payment
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <h1 className="text-lg font-bold">POS System</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4" />
            </Button>
            {session && (
              <Badge variant="secondary" className="text-xs">
                {new Date(session.startTime).toLocaleTimeString()}
              </Badge>
            )}
          </div>
        </div>

        {/* Mobile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-white border-b">
            <TabsTrigger value="products" className="text-xs">
              <Package className="h-4 w-4 mr-1" />
              Products
            </TabsTrigger>
            <TabsTrigger value="customers" className="text-xs">
              <Users className="h-4 w-4 mr-1" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">
              <BarChart3 className="h-4 w-4 mr-1" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="flex-1 p-4">
            <ProductSearch />
          </TabsContent>

          <TabsContent value="customers" className="flex-1 p-4">
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Customer management</p>
              <p className="text-sm text-gray-400">Coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="flex-1 p-4">
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Sales analytics</p>
              <p className="text-sm text-gray-400">Coming soon</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Mobile Action Bar */}
        <div className="bg-white border-t px-4 py-2">
          <div className="flex space-x-2">
            <Sheet open={showMobileCart} onOpenChange={setShowMobileCart}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex-1 relative">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart
                  {cart.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {cart.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <MobilePOSCart
                  cart={cart}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={removeFromCart}
                  onClearCart={clearCart}
                  subtotal={subtotal}
                  tax={tax}
                  total={total}
                  selectedCustomer={selectedCustomer}
                  onCheckout={() => {
                    setShowMobileCart(false)
                    setShowPayment(true)
                  }}
                />
              </SheetContent>
            </Sheet>
            <Button disabled={cart.length === 0} onClick={() => setShowPayment(true)} className="flex-1">
              <CreditCard className="h-4 w-4 mr-2" />
              Pay ₹{total.toFixed(2)}
            </Button>
          </div>
        </div>

        {/* Payment Dialog */}
        {showPayment && <PaymentDialog />}
      </div>
    )
  }

  // Desktop Layout
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel */}
      <div className="flex-1 flex flex-col p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="h-6 w-6" />
            <h1 className="text-2xl font-bold">POS System</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            {session && <Badge variant="secondary">Session: {new Date(session.startTime).toLocaleTimeString()}</Badge>}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-sm text-red-600">{error}</span>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">
              ×
            </Button>
          </div>
        )}

        {/* Product Search */}
        <Card>
          <CardHeader>
            <CardTitle>Product Search</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductSearch />
          </CardContent>
        </Card>

        {/* Shopping Cart */}
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Shopping Cart ({cart.length} items)
            </CardTitle>
            {cart.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearCart}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-2 h-full overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Your cart is empty</p>
                  <p className="text-sm text-gray-400">Search and add products to get started</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.name}</h4>
                      <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} each</p>
                      {item.category && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-right ml-4 min-w-0">
                      <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Checkout */}
      <div className="w-96 p-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Checkout Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Selection */}
            <div className="space-y-2">
              <h4 className="font-medium">Customer</h4>
              {selectedCustomer ? (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{selectedCustomer.name}</p>
                    <p className="text-xs text-gray-600">{selectedCustomer.loyaltyPoints} loyalty points</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Select Customer
                </Button>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-3">
              <h4 className="font-medium">Order Summary</h4>
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({cart.length} items):</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (18% GST):</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                className="w-full h-12 text-base font-medium"
                size="lg"
                disabled={cart.length === 0}
                onClick={() => setShowPayment(true)}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Process Payment
              </Button>

              {lastTransaction && (
                <Button variant="outline" className="w-full" onClick={() => setShowReceipt(true)}>
                  <Printer className="h-4 w-4 mr-2" />
                  Reprint Last Receipt
                </Button>
              )}
            </div>

            {/* Quick Stats */}
            {session && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Session Stats</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="font-medium">{session.totalTransactions}</p>
                    <p className="text-gray-600">Transactions</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="font-medium">₹{session.totalSales.toFixed(2)}</p>
                    <p className="text-gray-600">Sales</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      {showPayment && <PaymentDialog />}
    </div>
  )
}
