"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Transaction, Order, UserProfile } from "@/types/database.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Search, Wallet, CreditCard, Calendar, ArrowDownUp, CheckCircle, XCircle } from "lucide-react"

interface TransactionWithDetails extends Transaction {
  order: Order & {
    retailer: UserProfile
    wholesaler: UserProfile
  }
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("all")
  const [status, setStatus] = useState("all")
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalTransactionFees, setTotalTransactionFees] = useState(0)
  const supabase = createClientComponentClient()

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true)

        // Get user session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          throw new Error("Not authenticated")
        }

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()

        if (profileError) throw profileError

        if (profile.role !== "admin") {
          throw new Error("Unauthorized")
        }

        // Fetch transactions with related data
        const { data, error } = await supabase
          .from("transactions")
          .select(`
            *,
            order:orders(
              *,
              retailer:profiles!retailer_id(id, business_name, email),
              wholesaler:profiles!wholesaler_id(id, business_name, email)
            )
          `)
          .order("created_at", { ascending: false })

        if (error) throw error

        if (!data || data.length === 0) {
          console.log("No transactions found, fetching from orders table instead")

          // Fetch from orders table as fallback
          const { data: orders, error: ordersError } = await supabase
            .from("orders")
            .select(`
              *,
              retailer:profiles!retailer_id(id, business_name, email),
              wholesaler:profiles!wholesaler_id(id, business_name, email)
            `)
            .order("created_at", { ascending: false })

          if (ordersError) throw ordersError

          if (orders && orders.length > 0) {
            // Convert orders to transaction format
            const transactionsFromOrders = orders.map((order) => ({
              id: `order-${order.id}`,
              created_at: order.created_at,
              order_id: order.id,
              amount: order.total_amount,
              payment_method: order.payment_method,
              status: order.payment_status === "paid" ? "completed" : "pending",
              transaction_fee: order.total_amount * 0.02,
              order: {
                id: order.id,
                status: order.status,
                payment_status: order.payment_status,
                retailer: order.retailer,
                wholesaler: order.wholesaler,
              },
            }))

            setTransactions(transactionsFromOrders)
            setFilteredTransactions(transactionsFromOrders)

            // Calculate totals
            const totalAmount = transactionsFromOrders.reduce((sum, t) => sum + t.amount, 0)
            const totalFees = transactionsFromOrders.reduce((sum, t) => sum + t.transaction_fee, 0)

            setTotalRevenue(totalAmount)
            setTotalTransactionFees(totalFees)
            return
          }
        }

        const transactionsWithDetails = data as TransactionWithDetails[]

        setTransactions(transactionsWithDetails)
        setFilteredTransactions(transactionsWithDetails)

        // Calculate totals
        const totalAmount = transactionsWithDetails.reduce((sum, t) => sum + t.amount, 0)
        const totalFees = transactionsWithDetails.reduce((sum, t) => sum + t.transaction_fee, 0)

        setTotalRevenue(totalAmount)
        setTotalTransactionFees(totalFees)
      } catch (error: any) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [supabase])

  // Filter transactions based on search term, payment method, and status
  useEffect(() => {
    let filtered = [...transactions]

    // Filter by search term (order ID or business names)
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.order.retailer.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.order.wholesaler.business_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by payment method
    if (paymentMethod && paymentMethod !== "all") {
      filtered = filtered.filter((t) => t.payment_method === paymentMethod)
    }

    // Filter by status
    if (status && status !== "all") {
      filtered = filtered.filter((t) => t.status === status)
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, paymentMethod, status])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get payment method badge
  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "cod":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Cash on Delivery</Badge>
      case "upi":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">UPI Payment</Badge>
      default:
        return <Badge variant="outline">{method}</Badge>
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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
        <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
        <p className="text-muted-foreground">Monitor and manage payment transactions on the platform.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transaction Fees</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalTransactionFees.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fee Percentage</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue > 0 ? ((totalTransactionFees / totalRevenue) * 100).toFixed(1) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-auto">
          <Input
            placeholder="Search transactions"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-[300px]"
            prefix={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">All Methods</TabsTrigger>
              <TabsTrigger value="upi">UPI</TabsTrigger>
              <TabsTrigger value="cod">COD</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs value={status} onValueChange={setStatus} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">All Status</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Transactions Found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search criteria.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchTerm("")
              setPaymentMethod("all")
              setStatus("all")
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      Transaction #{transaction.id.substring(0, 8)}
                      <span className="ml-2">{getStatusBadge(transaction.status)}</span>
                    </CardTitle>
                    <CardDescription>
                      {formatDate(transaction.created_at)} at {formatTime(transaction.created_at)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPaymentMethodBadge(transaction.payment_method)}
                    <Badge variant="outline" className="font-normal">
                      Order #{transaction.order_id.substring(0, 8)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Retailer</h4>
                    <div className="space-y-1">
                      <p className="font-medium">{transaction.order.retailer.business_name}</p>
                      <p className="text-sm text-muted-foreground">{transaction.order.retailer.email}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Wholesaler</h4>
                    <div className="space-y-1">
                      <p className="font-medium">{transaction.order.wholesaler.business_name}</p>
                      <p className="text-sm text-muted-foreground">{transaction.order.wholesaler.email}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Transaction Details</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Amount:</span>
                        <span className="font-medium">₹{transaction.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Transaction Fee:</span>
                        <span className="font-medium">₹{transaction.transaction_fee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Fee Percentage:</span>
                        <span className="font-medium">
                          {((transaction.transaction_fee / transaction.amount) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {transaction.status === "completed" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : transaction.status === "failed" ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Loader2 className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">
                      {transaction.status === "completed"
                        ? "Payment completed successfully"
                        : transaction.status === "failed"
                          ? "Payment failed"
                          : "Payment pending"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = `/orders/${transaction.order_id}`)}
                  >
                    View Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
