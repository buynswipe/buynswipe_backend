"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { UserProfile, Product } from "@/types/database.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Store, Phone, MapPin, ShoppingCart, Plus, Minus, Package, ArrowLeft } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import Image from "next/image"

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export default function WholesalerDetailPage({ params }: { params: { id: string } }) {
  const [wholesaler, setWholesaler] = useState<UserProfile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("all")
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi">("cod")
  const [orderNotes, setOrderNotes] = useState("")
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  // Categories for filtering
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "Groceries", label: "Groceries" },
    { value: "Electronics", label: "Electronics" },
    { value: "Clothing", label: "Clothing" },
    { value: "Stationery", label: "Stationery" },
    { value: "Personal Care", label: "Personal Care" },
  ]

  // Fetch wholesaler details and products
  useEffect(() => {
    const fetchWholesalerAndProducts = async () => {
      try {
        setIsLoading(true)

        // Fetch wholesaler details
        const { data: wholesalerData, error: wholesalerError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", params.id)
          .eq("role", "wholesaler")
          .eq("is_approved", true)
          .single()

        if (wholesalerError) throw wholesalerError
        setWholesaler(wholesalerData)

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("wholesaler_id", params.id)

        if (productsError) throw productsError
        setProducts(productsData)
        setFilteredProducts(productsData)
      } catch (error: any) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWholesalerAndProducts()
  }, [supabase, params.id])

  // Filter products based on search term and category
  useEffect(() => {
    let filtered = [...products]

    // Filter by search term (product name)
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by category
    if (category && category !== "all") {
      filtered = filtered.filter((p) => p.category === category)
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, category])

  // Add item to cart
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === product.id)

      if (existingItem) {
        // Update quantity if item already in cart
        return prevCart.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        // Add new item to cart
        return [
          ...prevCart,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
          },
        ]
      }
    })
  }

  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === productId)

      if (existingItem && existingItem.quantity > 1) {
        // Decrease quantity if more than 1
        return prevCart.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item))
      } else {
        // Remove item from cart if quantity is 1
        return prevCart.filter((item) => item.productId !== productId)
      }
    })
  }

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  // Place order
  const placeOrder = async () => {
    try {
      setIsPlacingOrder(true)
      setOrderError(null)

      // Prepare order items
      const items = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }))

      // Create order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wholesalerId: params.id,
          items,
          paymentMethod,
          notes: orderNotes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order")
      }

      // Clear cart and show success message
      setCart([])
      setOrderNotes("")
      setOrderSuccess(true)

      // Redirect to orders page after a delay
      setTimeout(() => {
        router.push("/orders")
      }, 3000)
    } catch (error: any) {
      setOrderError(error.message)
    } finally {
      setIsPlacingOrder(false)
    }
  }

  // Get item quantity in cart
  const getItemQuantity = (productId: string) => {
    const item = cart.find((item) => item.productId === productId)
    return item ? item.quantity : 0
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !wholesaler) {
    return <div className="p-4 bg-red-50 text-red-500 rounded-md">Error: {error || "Wholesaler not found"}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href="/wholesalers">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">{wholesaler.business_name}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wholesaler Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="flex items-center text-sm mb-2">
              <Store className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{wholesaler.address}</span>
            </div>
            <div className="flex items-center text-sm mb-2">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                {wholesaler.city}, {wholesaler.pincode}
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center text-sm mb-2">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{wholesaler.phone}</span>
            </div>
            {wholesaler.gst_number && (
              <div className="flex items-center text-sm">
                <span className="mr-2 text-muted-foreground">GST:</span>
                <span>{wholesaler.gst_number}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-auto">
          <Input
            placeholder="Search products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-[300px]"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Your Cart</SheetTitle>
                <SheetDescription>Review your items before placing an order.</SheetDescription>
              </SheetHeader>

              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() =>
                            addToCart({
                              id: item.productId,
                              name: item.name,
                              price: item.price,
                            } as Product)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Separator className="my-4" />

                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>

                  <div className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={(value) => setPaymentMethod(value as "cod" | "upi")}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cod" id="cod" />
                          <Label htmlFor="cod">Cash on Delivery</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="upi" id="upi" />
                          <Label htmlFor="upi">UPI Payment</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any special instructions or notes for this order"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                      />
                    </div>

                    {orderError && (
                      <Alert variant="destructive">
                        <AlertDescription>{orderError}</AlertDescription>
                      </Alert>
                    )}

                    {orderSuccess && (
                      <Alert className="bg-green-50 text-green-800 border-green-200">
                        <AlertDescription>Order placed successfully! Redirecting to orders page...</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              )}

              <SheetFooter className="mt-6">
                <SheetClose asChild>
                  <Button variant="outline">Cancel</Button>
                </SheetClose>
                <Button onClick={placeOrder} disabled={cart.length === 0 || isPlacingOrder || orderSuccess}>
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-video relative bg-muted">
              {product.image_url ? (
                <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </div>
                <Badge>{product.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex justify-between items-center">
                <div className="text-lg font-bold">₹{product.price.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">{product.stock_quantity} in stock</div>
              </div>
            </CardContent>
            <CardFooter>
              {getItemQuantity(product.id) > 0 ? (
                <div className="flex items-center justify-between w-full">
                  <Button variant="outline" size="icon" onClick={() => removeFromCart(product.id)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-medium">{getItemQuantity(product.id)}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => addToCart(product)}
                    disabled={getItemQuantity(product.id) >= product.stock_quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button className="w-full" onClick={() => addToCart(product)} disabled={product.stock_quantity === 0}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No products found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search criteria or browse all products.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchTerm("")
              setCategory("all")
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  )
}
