"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
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

interface Discount {
  id: string
  name: string
  type: "percentage" | "fixed_amount"
  value: number
  minAmount?: number
  maxDiscount?: number
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [session, setSession] = useState<POSSession | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Dialog states
  const [showPayment, setShowPayment] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [showMobileCart, setShowMobileCart] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [showDiscounts, setShowDiscounts] = useState(false)
  const [showCustomers, setShowCustomers] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)

  const [lastTransaction, setLastTransaction] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("products")
  const isMobile = useIsMobile()

  const calculateGlobalDiscount = (amount: number, discount: Discount): number => {
    if (!discount || amount < (discount.minAmount || 0)) return 0

    let discountAmount = 0
    if (discount.type === "percentage") {
      discountAmount = (amount * discount.value) / 100
    } else {
      discountAmount = discount.value
    }

    if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
      discountAmount = discount.maxDiscount
    }

    return Math.min(discountAmount, amount)
  }

  // Calculate totals with discounts
  const subtotal = cart.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity
    const itemDiscount = item.discount || 0
    return sum + (itemTotal - itemDiscount)
  }, 0)

  const globalDiscountAmount = appliedDiscount ? calculateGlobalDiscount(subtotal, appliedDiscount) : 0
  const discountedSubtotal = subtotal - globalDiscountAmount
  const tax = discountedSubtotal * 0.18 // 18% GST
  const total = discountedSubtotal + tax

  useEffect(() => {
    initializeSession()
    loadCategories()
  }, [])

  const initializeSession = async () => {
    try {
      const response = await fetch("/api/pos/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openingCash: 1000 }),
      })

      if (response.ok) {
        const sessionData = await response.json()
        setSession(sessionData)
        toast.success("POS session started")
      }
    } catch (error) {
      console.error("Failed to start POS session:", error)
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
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(term)}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error("Failed to search products:", error)
      toast.error("Failed to search products")
    } finally {
      setLoading(false)
    }
  }

  const addToCart = useCallback(
    (product: any) => {
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
    },
    [cart],
  )

  const clearCart = useCallback(() => {
    setCart([])
    setSelectedCustomer(null)
    setAppliedDiscount(null)
  }, [])

  const handlePaymentComplete = async (paymentData: any) => {
    try {
      const transactionData = {
        sessionId: session?.id,
        customerId: selectedCustomer?.id,
        discountId: appliedDiscount?.id,
        items: cart,
        subtotal,
        tax,
        total,
        discountAmount: globalDiscountAmount,
        paymentData,
        loyaltyPointsEarned: Math.floor(total / 10), // 1 point per ₹10
      }

      const response = await fetch("/api/pos/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      })

      if (response.ok) {
        const transaction = await response.json()
        setLastTransaction(transaction)
        setShowPayment(false)
        setShowReceipt(true)
        clearCart()
        toast.success("Transaction completed successfully")
      }
    } catch (error) {
      console.error("Transaction failed:", error)
      toast.error("Transaction failed")
    }
  }

  const handlePrintReceipt = () => {
    window.print()
    toast.success("Receipt sent to printer")
  }

  // Simple Product Search Component
  const ProductSearch = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            searchProducts(e.target.value)
          }}
          className={`pl-10 ${isMobile ? "text-base h-12" : ""}`}
        />
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </div>
      )}

      {products.length > 0 && (
        <Card>
          <CardContent className="p-2">
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-gray-500">₹{product.price?.toFixed(2) || "0.00"}</p>
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
    </div>
  )

  // Simple Payment Dialog
  const PaymentDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-2xl font-bold">₹{total.toFixed(2)}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => {
                handlePaymentComplete({ method: "cash", amount: total })
              }}
              className="h-16 flex flex-col"
            >
              <Banknote className="h-6 w-6 mb-1" />
              Cash
            </Button>
            <Button
              onClick={() => {
                handlePaymentComplete({ method: "card", amount: total })
              }}
              className="h-16 flex flex-col"
            >
              <CreditCard className="h-6 w-6 mb-1" />
              Card
            </Button>
          </div>
          <Button variant="outline" onClick={() => setShowPayment(false)} className="w-full">
            Cancel
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

        {/* Mobile Content */}
        <div className="flex-1 p-4">
          <ProductSearch />
        </div>

        {/* Mobile Cart Summary */}
        {cart.length > 0 && (
          <div className="bg-white border-t px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{cart.length} items</p>
                <p className="font-bold">₹{total.toFixed(2)}</p>
              </div>
              <Button onClick={() => setShowPayment(true)} className="px-6">
                Checkout
              </Button>
            </div>
          </div>
        )}

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
              Cart ({cart.length} items)
            </CardTitle>
            {cart.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearCart}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-2 h-full overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Cart is empty</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-right ml-4">
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
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18%):</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <Button className="w-full" size="lg" disabled={cart.length === 0} onClick={() => setShowPayment(true)}>
              Process Payment
            </Button>

            {lastTransaction && (
              <Button variant="outline" className="w-full" onClick={() => setShowReceipt(true)}>
                <Printer className="h-4 w-4 mr-2" />
                Reprint Last Receipt
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      {showPayment && <PaymentDialog />}
    </div>
  )
}
