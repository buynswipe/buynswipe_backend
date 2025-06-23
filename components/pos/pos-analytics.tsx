"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, Calendar, Download, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface POSAnalyticsProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface AnalyticsData {
  totalSales: number
  totalTransactions: number
  averageTransaction: number
  topProducts: Array<{
    id: string
    name: string
    quantity: number
    revenue: number
  }>
  salesByHour: Array<{
    hour: number
    sales: number
    transactions: number
  }>
  paymentMethods: Array<{
    method: string
    count: number
    amount: number
  }>
  customerMetrics: {
    totalCustomers: number
    returningCustomers: number
    loyaltyPointsRedeemed: number
  }
  inventoryAlerts: Array<{
    productId: string
    productName: string
    currentStock: number
    reorderLevel: number
  }>
}

export function POSAnalytics({ open, onOpenChange }: POSAnalyticsProps) {
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  })
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (open) {
      loadAnalytics()
    }
  }, [open, dateRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        from: dateRange.from,
        to: dateRange.to,
      })

      const response = await fetch(`/api/pos/analytics?${params.toString()}`)

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        toast.error("Failed to load analytics")
      }
    } catch (error) {
      toast.error("Error loading analytics")
    } finally {
      setLoading(false)
    }
  }

  const exportAnalytics = () => {
    if (!analytics) return

    const csvData = [
      ["Metric", "Value"],
      ["Total Sales", `₹${analytics.totalSales.toFixed(2)}`],
      ["Total Transactions", analytics.totalTransactions.toString()],
      ["Average Transaction", `₹${analytics.averageTransaction.toFixed(2)}`],
      [""],
      ["Top Products", ""],
      ...analytics.topProducts.map((product) => [
        product.name,
        `${product.quantity} units, ₹${product.revenue.toFixed(2)}`,
      ]),
    ]

    const csv = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pos-analytics-${dateRange.from}-to-${dateRange.to}.csv`
    a.click()

    toast.success("Analytics exported successfully")
  }

  const isDialog = open !== undefined && onOpenChange !== undefined

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">POS Analytics</h2>
          <p className="text-gray-500">Comprehensive sales and performance insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={exportAnalytics} disabled={!analytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Date Range */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Date Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div>
              <Label htmlFor="from-date">From</Label>
              <Input
                id="from-date"
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="to-date">To</Label>
              <Input
                id="to-date"
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading analytics...</p>
        </div>
      ) : analytics ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{analytics.totalSales.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalTransactions}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{analytics.averageTransaction.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.customerMetrics.totalCustomers}</div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.paymentMethods.map((method, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium capitalize">{method.method}</span>
                        <Badge variant="secondary">{method.count} transactions</Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{method.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">
                          {((method.amount / analytics.totalSales) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-500">{product.quantity} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{product.revenue.toFixed(2)}</p>
                        <Progress
                          value={(product.revenue / analytics.topProducts[0]?.revenue) * 100}
                          className="w-20 h-2 mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.customerMetrics.totalCustomers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Returning Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.customerMetrics.returningCustomers}</div>
                  <p className="text-sm text-gray-500">
                    {(
                      (analytics.customerMetrics.returningCustomers / analytics.customerMetrics.totalCustomers) *
                      100
                    ).toFixed(1)}
                    % retention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Loyalty Points Redeemed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.customerMetrics.loyaltyPointsRedeemed}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Inventory Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.inventoryAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.inventoryAlerts.map((alert) => (
                      <div
                        key={alert.productId}
                        className="flex items-center justify-between p-3 border rounded-lg bg-orange-50"
                      >
                        <div>
                          <h4 className="font-medium">{alert.productName}</h4>
                          <p className="text-sm text-gray-500">
                            Current stock: {alert.currentStock} | Reorder level: {alert.reorderLevel}
                          </p>
                        </div>
                        <Badge variant="destructive">Low Stock</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No inventory alerts</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No data available for the selected date range</p>
        </div>
      )}
    </div>
  )

  if (isDialog) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>POS Analytics Dashboard</DialogTitle>
          </DialogHeader>
          <div className="mt-4">{content}</div>
        </DialogContent>
      </Dialog>
    )
  }

  return <div className="p-4">{content}</div>
}
