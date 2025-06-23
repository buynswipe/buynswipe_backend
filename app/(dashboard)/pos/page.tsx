"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BarcodeScanner } from "@/components/pos/barcode-scanner"
import { ProductSearch } from "@/components/pos/product-search"
import { PaymentDialog } from "@/components/pos/payment-dialog"
import { ReceiptPreview } from "@/components/pos/receipt-preview"
import { POSSettings } from "@/components/pos/pos-settings"
import { Calculator, ShoppingCart, Trash2, Plus, Minus, Settings, Printer } from "lucide-react"
import { toast } from "sonner"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  barcode?: string
  category?: string
}

interface POSSession {
  id: string
  startTime: Date
  openingCash: number
  totalSales: number
  totalTransactions: number
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [session, setSession] = useState<POSSession | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<any>(null)

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.18 // 18% GST
  const total = subtotal + tax

  useEffect(() => {
    // Initialize POS session
    initializeSession()
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

  const addToCart = (product: any) => {
    const existingItem = cart.find((item) => item.id === product.id)

    if (existingItem) {
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }

    toast.success(`${product.name} added to cart`)
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }

    setCart(cart.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
  }

  const handlePaymentComplete = async (paymentData: any) => {
    try {
      const transactionData = {
        sessionId: session?.id,
        items: cart,
        subtotal,
        tax,
        total,
        paymentMethod: paymentData.method,
        amountPaid: paymentData.amount,
        change: paymentData.change,
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
    // Implement thermal printer integration
    window.print()
    toast.success("Receipt sent to printer")
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Product Search & Cart */}
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
          <CardContent className="space-y-4">
            <ProductSearch onProductSelect={addToCart} />
            <BarcodeScanner onBarcodeScanned={addToCart} />
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
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
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

      {/* Dialogs */}
      <PaymentDialog
        open={showPayment}
        onOpenChange={setShowPayment}
        total={total}
        onPaymentComplete={handlePaymentComplete}
      />

      <ReceiptPreview
        open={showReceipt}
        onOpenChange={setShowReceipt}
        transaction={lastTransaction}
        onPrint={handlePrintReceipt}
      />

      <POSSettings open={showSettings} onOpenChange={setShowSettings} />
    </div>
  )
}
