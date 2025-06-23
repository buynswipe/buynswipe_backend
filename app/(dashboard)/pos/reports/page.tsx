"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, Download, TrendingUp, ShoppingCart, CreditCard, Package } from "lucide-react"
import { toast } from "sonner"

interface SalesReport {
  totalSales: number
  totalTransactions: number
  averageTransaction: number
  topProducts: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  paymentMethods: Array<{
    method: string
    count: number
    amount: number
  }>
  hourlySales: Array<{
    hour: number
    sales: number
    transactions: number
  }>
}

export default function POSReportsPage() {
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  })
  const [report, setReport] = useState<SalesReport | null>(null)
  const [loading, setLoading] = useState(false)

  const generateReport = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/pos/reports?from=${dateRange.from}&to=${dateRange.to}`)

      if (response.ok) {
        const data = await response.json()
        setReport(data)
      } else {
        toast.error("Failed to generate report")
      }
    } catch (error) {
      toast.error("Error generating report")
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    if (!report) return

    const csvData = [
      ["Metric", "Value"],
      ["Total Sales", `₹${report.totalSales.toFixed(2)}`],
      ["Total Transactions", report.totalTransactions.toString()],
      ["Average Transaction", `₹${report.averageTransaction.toFixed(2)}`],
      [""],
      ["Top Products", ""],
      ...report.topProducts.map((product) => [
        product.name,
        `${product.quantity} units, ₹${product.revenue.toFixed(2)}`,
      ]),
      [""],
      ["Payment Methods", ""],
      ...report.paymentMethods.map((method) => [
        method.method,
        `${method.count} transactions, ₹${method.amount.toFixed(2)}`,
      ]),
    ]

    const csv = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pos-report-${dateRange.from}-to-${dateRange.to}.csv`
    a.click()

    toast.success("Report exported successfully")
  }

  useEffect(() => {
    generateReport()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">POS Reports</h1>
          <p className="text-gray-500">Analyze your sales performance and trends</p>
        </div>
        <Button onClick={exportReport} disabled={!report}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Report Period
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
            <Button onClick={generateReport} disabled={loading}>
              {loading ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {report && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{report.totalSales.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.totalTransactions}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{report.averageTransaction.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.topProducts.length}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-gray-500">{product.quantity} units sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{product.revenue.toFixed(2)}</p>
                        <Badge variant="secondary">#{index + 1}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.paymentMethods.map((method, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium capitalize">{method.method}</h4>
                        <p className="text-sm text-gray-500">{method.count} transactions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{method.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">
                          {((method.amount / report.totalSales) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hourly Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.hourlySales.map((hour, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border-b">
                      <span className="text-sm">
                        {hour.hour}:00 - {hour.hour + 1}:00
                      </span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm">₹{hour.sales.toFixed(2)}</span>
                        <span className="text-sm text-gray-500">{hour.transactions} txns</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
