"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedBarcodeScanner } from "@/components/pos/enhanced-barcode-scanner"
import { EnhancedProductSearch } from "@/components/pos/enhanced-product-search"
import { EnhancedPaymentDialog } from "@/components/pos/enhanced-payment-dialog"
import { EnhancedReceiptPreview } from "@/components/pos/enhanced-receipt-preview"
import { POSSettings } from "@/components/pos/pos-settings"
import { MobilePOSCart } from "@/components/pos/mobile-pos-cart"
import { CategoryManager } from "@/components/pos/category-manager"
import { DiscountManager } from "@/components/pos/discount-manager"
import { CustomerManager } from "@/components/pos/customer-manager"
import { POSAnalytics } from "@/components/pos/pos-analytics"
import { QuickActions } from "@/components/pos/quick-actions"
import {
  Calculator,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Settings,
  Printer,
  Scan,
  CreditCard,
  Users,
  Tag,
  Percent,
  BarChart3,
  Package,
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

export default function EnhancedPOSPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [session, setSession] = useState<POSSession | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

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

  const applyItemDiscount = useCallback(
    (itemId: string, discount: number, type: "percentage" | "fixed") => {
      setCart(
        cart.map((item) => {
          if (item.id === itemId) {
            const itemTotal = item.price * item.quantity
            let discountAmount = 0

            if (type === "percentage") {
              discountAmount = (itemTotal * discount) / 100
            } else {
              discountAmount = Math.min(discount, itemTotal)
            }

            return { ...item, discount: discountAmount, discountType: type }
          }
          return item
        }),
      )
    },
    [cart],
  )

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
      toast.error("Transaction failed")
    }
  }

  const handlePrintReceipt = () => {
    window.print()
    toast.success("Receipt sent to printer")
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <h1 className="text-lg font-bold">Enhanced POS</h1>
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
          <TabsList className="grid w-full grid-cols-4 bg-white border-b">
            <TabsTrigger value="products" className="text-xs">
              <Package className="h-4 w-4 mr-1" />
              Products
            </TabsTrigger>
            <TabsTrigger value="customers" className="text-xs">
              <Users className="h-4 w-4 mr-1" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="discounts" className="text-xs">
              <Percent className="h-4 w-4 mr-1" />
              Discounts
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">
              <BarChart3 className="h-4 w-4 mr-1" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="flex-1 p-4">
            <EnhancedProductSearch
              onProductSelect={addToCart}
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </TabsContent>

          <TabsContent value="customers" className="flex-1 p-4">
            <CustomerManager selectedCustomer={selectedCustomer} onCustomerSelect={setSelectedCustomer} />
          </TabsContent>

          <TabsContent value="discounts" className="flex-1 p-4">
            <DiscountManager
              appliedDiscount={appliedDiscount}
              onDiscountApply={setAppliedDiscount}
              cartTotal={subtotal}
            />
          </TabsContent>

          <TabsContent value="analytics" className="flex-1 p-4">
            <POSAnalytics />
          </TabsContent>
        </Tabs>

        {/* Mobile Action Bar */}
        <div className="bg-white border-t px-4 py-2">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowScanner(true)}
              className="flex items-center justify-center"
            >
              <Scan className="h-4 w-4 mr-1" />
              Scan
            </Button>
            <Sheet open={showMobileCart} onOpenChange={setShowMobileCart}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center justify-center relative">
                  <ShoppingCart className="h-4 w-4 mr-1" />
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
                  onApplyItemDiscount={applyItemDiscount}
                  subtotal={subtotal}
                  tax={tax}
                  total={total}
                  globalDiscount={globalDiscountAmount}
                  selectedCustomer={selectedCustomer}
                  appliedDiscount={appliedDiscount}
                  onCheckout={() => {
                    setShowMobileCart(false)
                    setShowPayment(true)
                  }}
                />
              </SheetContent>
            </Sheet>
            <Button
              size="sm"
              disabled={cart.length === 0}
              onClick={() => setShowPayment(true)}
              className="flex items-center justify-center"
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Pay
            </Button>
          </div>
        </div>

        {/* Mobile Cart Summary (Fixed Bottom) */}
        {cart.length > 0 && (
          <div className="bg-white border-t px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{cart.length} items</p>
                <p className="font-bold">₹{total.toFixed(2)}</p>
                {globalDiscountAmount > 0 && (
                  <p className="text-sm text-green-600">-₹{globalDiscountAmount.toFixed(2)} discount</p>
                )}
              </div>
              <Button onClick={() => setShowPayment(true)} className="px-6">
                Checkout
              </Button>
            </div>
          </div>
        )}

        {/* Mobile Dialogs */}
        <EnhancedBarcodeScanner open={showScanner} onOpenChange={setShowScanner} onBarcodeScanned={addToCart} />

        <EnhancedPaymentDialog
          open={showPayment}
          onOpenChange={setShowPayment}
          total={total}
          customer={selectedCustomer}
          discount={appliedDiscount}
          onPaymentComplete={handlePaymentComplete}
        />

        <EnhancedReceiptPreview
          open={showReceipt}
          onOpenChange={setShowReceipt}
          transaction={lastTransaction}
          onPrint={handlePrintReceipt}
        />

        <POSSettings open={showSettings} onOpenChange={setShowSettings} />
      </div>
    )
  }

  // Desktop Layout (Enhanced)
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Enhanced Product Search & Management */}
      <div className="flex-1 flex flex-col p-4 space-y-4 min-w-0">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Enhanced POS System</h1>
          </div>
          <div className="flex items-center space-x-2">
            <QuickActions
              onOpenCategories={() => setShowCategories(true)}
              onOpenDiscounts={() => setShowDiscounts(true)}
              onOpenCustomers={() => setShowCustomers(true)}
              onOpenAnalytics={() => setShowAnalytics(true)}
            />
            <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            {session && <Badge variant="secondary">Session: {new Date(session.startTime).toLocaleTimeString()}</Badge>}
          </div>
        </div>

        {/* Customer & Discount Selection */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCustomer ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedCustomer.name}</p>
                    <p className="text-sm text-gray-500">{selectedCustomer.loyaltyPoints} points</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowCustomers(true)} className="w-full">
                  Select Customer
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Percent className="h-4 w-4 mr-2" />
                Discount
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appliedDiscount ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{appliedDiscount.name}</p>
                    <p className="text-sm text-green-600">-₹{globalDiscountAmount.toFixed(2)}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setAppliedDiscount(null)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowDiscounts(true)} className="w-full">
                  Apply Discount
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Product Search */}
        <Card>
          <CardHeader>
            <CardTitle>Product Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <EnhancedProductSearch
              onProductSelect={addToCart}
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowScanner(true)} className="flex-1">
                <Scan className="h-4 w-4 mr-2" />
                Barcode Scanner
              </Button>
              <Button variant="outline" onClick={() => setShowCategories(true)}>
                <Tag className="h-4 w-4 mr-2" />
                Categories
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Shopping Cart */}
        <Card className="flex-1 min-h-0">
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
          <CardContent className="flex-1 min-h-0">
            <div className="space-y-2 h-full overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Cart is empty</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.name}</h4>
                      <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} each</p>
                      {item.discount && (
                        <p className="text-sm text-green-600">
                          -
                          {item.discountType === "percentage"
                            ? `${((item.discount / (item.price * item.quantity)) * 100).toFixed(1)}%`
                            : `₹${item.discount.toFixed(2)}`}{" "}
                          discount
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
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
                    <div className="text-right ml-4 min-w-0">
                      <p className="font-medium">₹{(item.price * item.quantity - (item.discount || 0)).toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Enhanced Checkout */}
      <div className="w-96 p-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Enhanced Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {globalDiscountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-₹{globalDiscountAmount.toFixed(2)}</span>
                </div>
              )}
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

            {selectedCustomer && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium">Customer: {selectedCustomer.name}</p>
                <p className="text-sm text-gray-600">Points to earn: {Math.floor(total / 10)}</p>
              </div>
            )}

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

      {/* Enhanced Dialogs */}
      <EnhancedBarcodeScanner open={showScanner} onOpenChange={setShowScanner} onBarcodeScanned={addToCart} />

      <EnhancedPaymentDialog
        open={showPayment}
        onOpenChange={setShowPayment}
        total={total}
        customer={selectedCustomer}
        discount={appliedDiscount}
        onPaymentComplete={handlePaymentComplete}
      />

      <EnhancedReceiptPreview
        open={showReceipt}
        onOpenChange={setShowReceipt}
        transaction={lastTransaction}
        onPrint={handlePrintReceipt}
      />

      <CategoryManager open={showCategories} onOpenChange={setShowCategories} onCategoriesUpdate={loadCategories} />

      <DiscountManager
        open={showDiscounts}
        onOpenChange={setShowDiscounts}
        appliedDiscount={appliedDiscount}
        onDiscountApply={setAppliedDiscount}
        cartTotal={subtotal}
      />

      <CustomerManager
        open={showCustomers}
        onOpenChange={setShowCustomers}
        selectedCustomer={selectedCustomer}
        onCustomerSelect={setSelectedCustomer}
      />

      <POSAnalytics open={showAnalytics} onOpenChange={setShowAnalytics} />

      <POSSettings open={showSettings} onOpenChange={setShowSettings} />
    </div>
  )
}
