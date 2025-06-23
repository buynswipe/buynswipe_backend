"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Minus, Trash2, ShoppingCart } from "lucide-react"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  category?: string
}

interface MobilePOSCartProps {
  cart: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
  onClearCart: () => void
  subtotal: number
  tax: number
  total: number
  onCheckout: () => void
}

export function MobilePOSCart({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  subtotal,
  tax,
  total,
  onCheckout,
}: MobilePOSCartProps) {
  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="pb-4">
        <SheetTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Cart ({cart.length} items)</span>
          </div>
          {cart.length > 0 && (
            <Button variant="outline" size="sm" onClick={onClearCart}>
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </SheetTitle>
      </SheetHeader>

      {cart.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Your cart is empty</p>
            <p className="text-sm text-gray-400">Add products to get started</p>
          </div>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm leading-tight">{item.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">₹{item.price.toFixed(2)} each</p>
                      {item.category && <p className="text-xs text-gray-400">{item.category}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-medium min-w-[2rem] text-center">{item.quantity}</span>
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
                      <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Cart Summary */}
          <div className="border-t pt-4 mt-4 space-y-4">
            <div className="space-y-2">
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

            <Button onClick={onCheckout} className="w-full h-12 text-base font-medium">
              Proceed to Payment
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
