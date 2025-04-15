"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  Search,
  Wallet,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowDownUp,
  ExternalLink,
  Clock,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"

// Simplified interface for transactions with order details
interface TransactionWithDetails {
  id: string
  created_at: string
  order_id: string
  amount: number
  payment_method: "cod" | "upi"
  status: "pending" | "completed" | "failed"
  transaction_fee: number
  order: {
    id: string
    status: string
    payment_status: string
    retailer: {
      id: string
      business_name: string
      email: string
    }
    wholesaler: {
      id: string
      business_name: string
      email: string
    }
  }
}

export default function PaymentsPage() {
  // Basic state
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  // UI state
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("all")
  const [status, setStatus] = useState("all")
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithDetails[]>([])

  // Payment dialog state
  const [currentTransaction, setCurrentTransaction] = useState<TransactionWithDetails | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Stats
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalPending: 0,
    completionPercentage: 100,
  })

  const supabase = createClientComponentClient()

  // Load data on component mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        setError(null)

        // Get user session
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          throw new Error("Not authenticated")
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()

        if (profileError) throw profileError
        setUserRole(profile.role)

        // Fetch orders data first (this is more reliable than transactions)
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select(`
            id,
            created_at,
            status,
            payment_status,
            payment_method,
            total_amount,
            retailer:profiles!retailer_id(id, business_name, email),
            wholesaler:profiles!wholesaler_id(id, business_name, email)
          `)
          .order("created_at", { ascending: false })

        if (ordersError) throw ordersError

        // Filter orders based on user role
        let filteredOrders = orders
        if (profile.role === "retailer") {
          filteredOrders = orders.filter((order) => order.retailer.id === session.user.id)
        } else if (profile.role === "wholesaler") {
          filteredOrders = orders.filter((order) => order.wholesaler.id === session.user.id)
        }

        // Convert orders to transaction format
        const transactionsFromOrders = filteredOrders.map((order) => ({
          id: `order-${order.id}`,
          created_at: order.created_at,
          order_id: order.id,
          amount: order.total_amount,
          payment_method: order.payment_method,
          status: order.payment_status === "paid" ? "completed" : "pending",
          transaction_fee: order.total_amount * 0.01,
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
        calculateStats(transactionsFromOrders)
      } catch (err: any) {
        console.error("Error loading payments data:", err)
        setError(err.message || "Failed to load payments data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [supabase])

  // Filter transactions when filter criteria change
  useEffect(() => {
    let filtered = [...transactions]

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.order_id.toLowerCase().includes(term) ||
          t.order.retailer.business_name.toLowerCase().includes(term) ||
          t.order.wholesaler.business_name.toLowerCase().includes(term),
      )
    }

    // Filter by payment method
    if (paymentMethod !== "all") {
      filtered = filtered.filter((t) => t.payment_method === paymentMethod)
    }

    // Filter by status
    if (status !== "all") {
      filtered = filtered.filter((t) => t.status === status)
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, paymentMethod, status])

  // Calculate statistics
  function calculateStats(transactionsData: TransactionWithDetails[]) {
    const paid = transactionsData.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.amount, 0)

    const pending = transactionsData.filter((t) => t.status === "pending").reduce((sum, t) => sum + t.amount, 0)

    const total = paid + pending
    const percentage = total > 0 ? Math.round((paid / total) * 100) : 100

    setStats({
      totalPaid: paid,
      totalPending: pending,
      completionPercentage: percentage,
    })
  }

  // Mark payment as received
  async function markPaymentReceived() {
    if (!currentTransaction) return

    try {
      setIsProcessing(true)
      setActionMessage(null)

      // Call the API to mark payment as received
      const response = await fetch("/api/payments/cod/mark-received", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: currentTransaction.order_id,
          amount: currentTransaction.amount,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to mark payment as received")
      }

      // Update local state
      setTransactions((prev) =>
        prev.map((t) => (t.order_id === currentTransaction.order_id ? { ...t, status: "completed" } : t)),
      )

      // Update stats
      setStats((prev) => ({
        totalPaid: prev.totalPaid + currentTransaction.amount,
        totalPending: prev.totalPending - currentTransaction.amount,
        completionPercentage: Math.round(
          ((prev.totalPaid + currentTransaction.amount) / (prev.totalPaid + prev.totalPending)) * 100,
        ),
      }))

      setActionMessage({
        type: "success",
        text: "Payment marked as received successfully",
      })

      // Close dialog after delay
      setTimeout(() => {
        setCurrentTransaction(null)
        setActionMessage(null)
      }, 2000)
    } catch (err: any) {
      console.error("Error marking payment as received:", err)
      setActionMessage({
        type: "error",
        text: err.message || "Failed to mark payment as received",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Format currency
  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Format date
  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  // Format time
  function formatTime(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get payment method badge
  function getPaymentMethodBadge(method: string) {
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
  function getStatusBadge(status: string) {
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>Error: {error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Page
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment Tracking</h2>
          <p className="text-muted-foreground">
            {userRole === "retailer"
              ? "Track your payments to wholesalers"
              : userRole === "admin"
                ? "Track all payments in the system"
                : "Track payments from retailers"}
          </p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
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
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalPaid)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.totalPending)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Completion</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="text-2xl font-bold">{stats.completionPercentage}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{ width: `${stats.completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-auto">
          <Input
            placeholder="Search payments"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-[300px]"
            prefix={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full md:w-auto">
            <TabsList className="tabs-list">
              <TabsTrigger value="all" className="tabs-trigger">
                All Methods
              </TabsTrigger>
              <TabsTrigger value="upi" className="tabs-trigger">
                UPI
              </TabsTrigger>
              <TabsTrigger value="cod" className="tabs-trigger">
                COD
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={status} onValueChange={setStatus} className="w-full md:w-auto">
            <TabsList className="tabs-list">
              <TabsTrigger value="all" className="tabs-trigger">
                All Status
              </TabsTrigger>
              <TabsTrigger value="completed" className="tabs-trigger">
                Completed
              </TabsTrigger>
              <TabsTrigger value="pending" className="tabs-trigger">
                Pending
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Payments Found</h3>
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
            <Card key={transaction.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Payment #{transaction.id.substring(0, 8)}
                      <span>{getStatusBadge(transaction.status)}</span>
                    </CardTitle>
                    <CardDescription>
                      {formatDate(transaction.created_at)} at {formatTime(transaction.created_at)}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {getPaymentMethodBadge(transaction.payment_method)}
                    <Badge variant="outline" className="font-normal">
                      Order #{transaction.order_id.substring(0, 8)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pb-3">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      {userRole === "retailer" ? "Paid To" : "Received From"}
                    </h4>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {userRole === "retailer"
                          ? transaction.order.wholesaler.business_name
                          : transaction.order.retailer.business_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {userRole === "retailer"
                          ? transaction.order.wholesaler.email
                          : transaction.order.retailer.email}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Payment Details</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Amount:</span>
                        <span className="font-medium">{formatCurrency(transaction.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Method:</span>
                        <span className="font-medium">
                          {transaction.payment_method === "cod" ? "Cash on Delivery" : "UPI Payment"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <span
                          className={`font-medium ${
                            transaction.status === "completed"
                              ? "text-green-600"
                              : transaction.status === "pending"
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Actions</h4>
                    <div className="space-y-2">
                      {userRole === "wholesaler" &&
                        transaction.payment_method === "cod" &&
                        transaction.status === "pending" && (
                          <Button className="w-full" onClick={() => setCurrentTransaction(transaction)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Paid
                          </Button>
                        )}

                      {userRole === "retailer" &&
                        transaction.payment_method === "upi" &&
                        transaction.status === "pending" && (
                          <Button
                            className="w-full"
                            onClick={() => (window.location.href = `/orders/${transaction.order_id}/pay`)}
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Make Payment
                          </Button>
                        )}

                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/orders/${transaction.order_id}`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Order
                        </Link>
                      </Button>
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
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">
                      {transaction.status === "completed"
                        ? "Payment completed successfully"
                        : transaction.status === "failed"
                          ? "Payment failed"
                          : "Payment pending"}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Order Status: {transaction.order.status.charAt(0).toUpperCase() + transaction.order.status.slice(1)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payment Confirmation Dialog */}
      <Dialog open={!!currentTransaction} onOpenChange={(open) => !open && setCurrentTransaction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Payment as Completed</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this Cash on Delivery payment as completed?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {currentTransaction && (
              <div className="space-y-2">
                <p>
                  <strong>Order ID:</strong> #{currentTransaction.order_id.substring(0, 8)}
                </p>
                <p>
                  <strong>Retailer:</strong> {currentTransaction.order.retailer.business_name}
                </p>
                <p>
                  <strong>Amount:</strong> {formatCurrency(currentTransaction.amount)}
                </p>
              </div>
            )}

            {actionMessage && actionMessage.type === "error" && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{actionMessage.text}</AlertDescription>
              </Alert>
            )}

            {actionMessage && actionMessage.type === "success" && (
              <Alert className="bg-green-50 text-green-800 border-green-200 mt-4">
                <AlertDescription>{actionMessage.text}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCurrentTransaction(null)}>
              Cancel
            </Button>
            <Button onClick={markPaymentReceived} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Mark as Paid"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
