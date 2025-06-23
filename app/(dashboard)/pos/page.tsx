"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  ShoppingCart,
  Scan,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  Settings,
  Search,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { BarcodeScanner } from "@/components/pos/barcode-scanner"
import { ProductSearch } from "@/components/pos/product-search"
import { PaymentDialog } from "@/components/pos/payment-dialog"
import { ReceiptPreview } from "@/components/pos/receipt-preview"
import { POSSettings } from "@/components/pos/pos-settings"

interface CartItem {
  id: string
  product_id: string
  product_name: string
  product_sku?: string
  barcode?: string
  unit_price: number
  quantity: number
  discount_percent: number
  discount_amount: number
  line_total: number
}

interface POSSession {
  id: string
  opening_cash: number
  total_sales: number
  total_transactions: number
  status: string
}

export default function POSPage() {
  const [session, setSession] = useState<POSSession | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [currentTransaction, setCurrentTransaction] = useState(null)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [taxRate, setTaxRate] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    initializePOS()
    // Focus search input on component mount
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  const initializePOS = async () => {
    try {
      setIsLoading(true)

      // Check for active session
      const response = await fetch("/api/pos/sessions")
      const data = await response.json()

      if (data.success && data.session) {
        setSession(data.session)
      }

      // Load POS settings
      const settingsResponse = await fetch("/api/pos/settings")
      const settingsData = await settingsResponse.json()

      if (settingsData.success && settingsData.settings) {
        setTaxRate(settingsData.settings.tax_rate || 0)
      }
    } catch (error) {
      console.error("Error initializing POS:", error)
      toast({
        title: "Error",
        description: "Failed to initialize POS system",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startSession = async (openingCash: number) => {
    try {
      const response = await fetch("/api/pos/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opening_cash: openingCash }),
      })

      const data = await response.json()

      if (data.success) {
        setSession(data.session)
        toast({
          title: "Success",
          description: "POS session started successfully",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start session",
        variant: "destructive",
      })
    }
  }

  const addToCart = (product: any, quantity = 1) => {
    const existingItem = cart.find((item) => item.product_id === product.id)

    if (existingItem) {
      updateCartItemQuantity(existingItem.id, existingItem.quantity + quantity)
    } else {
      const newItem: CartItem = {
        id: `cart_${Date.now()}_${Math.random()}`,
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        barcode: product.barcode,
        unit_price: product.price,
        quantity,
        discount_percent: 0,
        discount_amount: 0,
        line_total: product.price * quantity,
      }
      setCart([...cart, newItem])
    }

    // Play sound if enabled
    playBeepSound()
  }

  const updateCartItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setCart(
      cart.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
              line_total: item.unit_price * newQuantity - item.discount_amount,
            }
          : item,
      ),
    )
  }

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item.id !== itemId))
  }

  const clearCart = () => {
    setCart([])
    setCustomerName("")
    setCustomerPhone("")
    setNotes("")
  }

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.line_total, 0)
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    return { subtotal, taxAmount, total }
  }

  const handleBarcodeScan = async (barcode: string) => {
    try {
      const response = await fetch(`/api/pos/products/search?barcode=${barcode}`)
      const data = await response.json()

      if (data.success && data.products.length > 0) {
        addToCart(data.products[0])
        setIsScannerOpen(false)
      } else {
        toast({
          title: "Product Not Found",
          description: `No product found with barcode: ${barcode}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search product by barcode",
        variant: "destructive",
      })
    }
  }

  const handleProductSelect = (product: any) => {
    addToCart(product)
    setIsSearchOpen(false)
    setSearchQuery("")
  }

  const processPayment = async (paymentData: any) => {
    try {
      const { subtotal, taxAmount } = calculateTotals()

      const transactionData = {
        session_id: session?.id,
        items: cart,
        customer_name: customerName,
        customer_phone: customerPhone,
        payment_method: paymentData.method,
        cash_received: paymentData.cashReceived,
        discount_amount: 0,
        tax_amount: taxAmount,
        notes,
      }

      const response = await fetch("/api/pos/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      })

      const data = await response.json()

      if (data.success) {
        setCurrentTransaction(data.transaction)
        setIsPaymentOpen(false)
        setIsReceiptOpen(true)
        clearCart()

        toast({
          title: "Success",
          description: "Transaction completed successfully",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      })
    }
  }

  const playBeepSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = "square"

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
  }

  const { subtotal, taxAmount, total } = calculateTotals()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Loading POS System...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Start POS Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="opening-cash">Opening Cash Amount</Label>
                <Input
                  id="opening-cash"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      const value = Number.parseFloat((e.target as HTMLInputElement).value) || 0
                      startSession(value)
                    }
                  }}
                />
              </div>
              <Button
                onClick={() => {
                  const input = document.getElementById("opening-cash") as HTMLInputElement
                  const value = Number.parseFloat(input.value) || 0
                  startSession(value)
                }}
                className="w-full"
              >
                Start Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Point of Sale</h1>
          <Badge variant="secondary">Session: {session.total_transactions} transactions</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Panel - Product Search & Cart */}
        <div className="flex-1 flex flex-col">
          {/* Search Bar */}
          <div className="bg-white border-b p-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search products by name, SKU, or scan barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      setIsSearchOpen(true)
                    }
                  }}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setIsSearchOpen(true)} disabled={!searchQuery.trim()}>
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setIsScannerOpen(true)}>
                <Scan className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Cart */}
          <div className="flex-1 p-4">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Cart ({cart.length} items)
                  </CardTitle>
                  {cart.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearCart}>
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                {cart.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Cart is empty</p>
                    <p className="text-sm">Search for products or scan barcodes to add items</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product_name}</h4>
                          {item.product_sku && <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>}
                          <p className="text-sm font-medium">₹{item.unit_price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{item.line_total.toFixed(2)}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Panel - Customer Info & Checkout */}
        <div className="w-96 bg-white border-l flex flex-col">
          {/* Customer Info */}
          <div className="p-4 border-b">
            <h3 className="font-medium mb-3">Customer Information</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="customer-name">Name (Optional)</Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <Label htmlFor="customer-phone">Phone (Optional)</Label>
                <Input
                  id="customer-phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Order notes"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-4 border-b">
            <h3 className="font-medium mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between">
                  <span>Tax ({taxRate}%):</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Buttons */}
          <div className="flex-1 p-4">
            <div className="space-y-3">
              <Button className="w-full h-12" onClick={() => setIsPaymentOpen(true)} disabled={cart.length === 0}>
                <CreditCard className="h-4 w-4 mr-2" />
                Process Payment
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setIsPaymentOpen(true)} disabled={cart.length === 0}>
                  <Banknote className="h-4 w-4 mr-1" />
                  Cash
                </Button>
                <Button variant="outline" onClick={() => setIsPaymentOpen(true)} disabled={cart.length === 0}>
                  <Smartphone className="h-4 w-4 mr-1" />
                  UPI
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ProductSearch
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        searchQuery={searchQuery}
        onProductSelect={handleProductSelect}
      />

      <BarcodeScanner open={isScannerOpen} onOpenChange={setIsScannerOpen} onScan={handleBarcodeScan} />

      <PaymentDialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen} total={total} onPayment={processPayment} />

      <ReceiptPreview open={isReceiptOpen} onOpenChange={setIsReceiptOpen} transaction={currentTransaction} />

      <POSSettings
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        onSettingsUpdate={(settings) => {
          setTaxRate(settings.tax_rate || 0)
        }}
      />
    </div>
  )
}
