"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Minus, Trash2, ShoppingCart, Percent } from "lucide-react"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  discount?: number
  discountType?: "percentage" | "fixed"
}

interface Customer {
  id: string
  name: string
  loyaltyPoints: number
}

interface Discount {
  id: string
  name: string
  value: number
}

interface MobilePOSCartProps {
  cart: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
  onClearCart: () => void
  onApplyItemDiscount?: (itemId: string, discount: number, type: "percentage" | "fixed") => void
  subtotal: number
  tax: number
  total: number
  globalDiscount?: number
  selectedCustomer?: Customer | null
  appliedDiscount?: Discount | null
  onCheckout: () => void
}

export function MobilePOSCart({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onApplyItemDiscount,
  subtotal,
  tax,
  total,
  globalDiscount = 0,
  selectedCustomer,
  appliedDiscount,
  onCheckout,
}: MobilePOSCartProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Shopping Cart</h2>
          <Badge variant="secondary">{cart.length} items</Badge>
        </div>
        {cart.length > 0 && (
          <Button variant="outline" size="sm" onClick={onClearCart}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Your cart is empty</p>
            <p className="text-sm text-gray-400">Add products to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">₹{item.price.toFixed(2)} each</p>
                      {item.discount && item.discount > 0 && (
                        <div className="flex items-center mt-1">
                          <Percent className="h-3 w-3 text-green-600 mr-1" />
                          <span className="text-xs text-green-600">
                            -
                            {item.discountType === "percentage"
                              ? `${((item.discount / (item.price * item.quantity)) * 100).toFixed(1)}%`
                              : `₹${item.discount.toFixed(2)}`}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          ₹{(item.price * item.quantity - (item.discount || 0)).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(item.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {cart.length > 0 && (
        <div className="border-t p-4 space-y-4">
          {/* Customer Info */}
          {selectedCustomer && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{selectedCustomer.name}</p>
                  <p className="text-xs text-gray-600">{selectedCustomer.loyaltyPoints} loyalty points</p>
                </div>
                <Badge variant="secondary">Customer</Badge>
              </div>
            </div>
          )}

          {/* Applied Discount */}
          {appliedDiscount && globalDiscount > 0 && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{appliedDiscount.name}</p>
                  <p className="text-xs text-green-600">-₹{globalDiscount.toFixed(2)} discount applied</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Discount
                </Badge>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {globalDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount:</span>
                <span>-₹{globalDiscount.toFixed(2)}</span>
              </div>
            )}
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

          <Button onClick={onCheckout} className="w-full h-12 text-base font-medium">
            Proceed to Payment
          </Button>
        </div>
      )}
    </div>
  )
}
