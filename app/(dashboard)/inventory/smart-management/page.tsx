"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  BarChart3,
  Zap,
  Clock,
  CheckCircle,
} from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface Product {
  id: string
  name: string
  sku: string
  current_stock: number
  min_stock_level: number
  max_stock_level: number
  unit_price: number
  category: string
  supplier: string
  last_restocked: string
  demand_trend: "up" | "down" | "stable"
  predicted_stockout: string | null
  auto_reorder: boolean
}

interface StockAlert {
  id: string
  product_id: string
  product_name: string
  alert_type: "low_stock" | "out_of_stock" | "overstock" | "predicted_stockout"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  created_at: string
  resolved: boolean
}

export default function SmartInventoryManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadInventoryData()
  }, [])

  const loadInventoryData = async () => {
    try {
      setLoading(true)

      // Mock data for demonstration
      const mockProducts: Product[] = [
        {
          id: "1",
          name: "Premium Basmati Rice 25kg",
          sku: "RICE-001",
          current_stock: 45,
          min_stock_level: 50,
          max_stock_level: 200,
          unit_price: 2500,
          category: "Grains",
          supplier: "Agro Foods Ltd",
          last_restocked: "2024-01-15",
          demand_trend: "up",
          predicted_stockout: "2024-01-25",
          auto_reorder: true,
        },
        {
          id: "2",
          name: "Cooking Oil 5L",
          sku: "OIL-001",
          current_stock: 12,
          min_stock_level: 25,
          max_stock_level: 100,
          unit_price: 650,
          category: "Oils",
          supplier: "Golden Oil Co",
          last_restocked: "2024-01-10",
          demand_trend: "up",
          predicted_stockout: "2024-01-22",
          auto_reorder: false,
        },
        {
          id: "3",
          name: "Wheat Flour 10kg",
          sku: "FLOUR-001",
          current_stock: 0,
          min_stock_level: 30,
          max_stock_level: 150,
          unit_price: 450,
          category: "Grains",
          supplier: "Mill Direct",
          last_restocked: "2024-01-05",
          demand_trend: "stable",
          predicted_stockout: null,
          auto_reorder: true,
        },
        {
          id: "4",
          name: "Sugar 1kg",
          sku: "SUGAR-001",
          current_stock: 89,
          min_stock_level: 40,
          max_stock_level: 120,
          unit_price: 45,
          category: "Sweeteners",
          supplier: "Sweet Supply Co",
          last_restocked: "2024-01-18",
          demand_trend: "down",
          predicted_stockout: null,
          auto_reorder: true,
        },
      ]

      const mockAlerts: StockAlert[] = [
        {
          id: "1",
          product_id: "2",
          product_name: "Cooking Oil 5L",
          alert_type: "low_stock",
          severity: "high",
          message: "Stock level below minimum threshold (12/25)",
          created_at: "2024-01-20T10:30:00Z",
          resolved: false,
        },
        {
          id: "2",
          product_id: "3",
          product_name: "Wheat Flour 10kg",
          alert_type: "out_of_stock",
          severity: "critical",
          message: "Product is completely out of stock",
          created_at: "2024-01-20T08:15:00Z",
          resolved: false,
        },
        {
          id: "3",
          product_id: "1",
          product_name: "Premium Basmati Rice 25kg",
          alert_type: "predicted_stockout",
          severity: "medium",
          message: "Predicted to run out of stock by Jan 25, 2024",
          created_at: "2024-01-20T09:00:00Z",
          resolved: false,
        },
      ]

      setProducts(mockProducts)
      setAlerts(mockAlerts)
    } catch (error) {
      console.error("Error loading inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (product: Product) => {
    if (product.current_stock === 0) return { status: "out_of_stock", color: "bg-red-100 text-red-800" }
    if (product.current_stock <= product.min_stock_level)
      return { status: "low_stock", color: "bg-yellow-100 text-yellow-800" }
    if (product.current_stock >= product.max_stock_level)
      return { status: "overstock", color: "bg-purple-100 text-purple-800" }
    return { status: "normal", color: "bg-green-100 text-green-800" }
  }

  const getAlertSeverityColor = (severity: string) => {
    const colors = {
      low: "border-blue-200 bg-blue-50",
      medium: "border-yellow-200 bg-yellow-50",
      high: "border-orange-200 bg-orange-50",
      critical: "border-red-200 bg-red-50",
    }
    return colors[severity as keyof typeof colors] || colors.low
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(products.map((p) => p.category))]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Smart Inventory Management</h1>
          <p className="text-gray-600">AI-powered inventory optimization and alerts</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Critical Alerts */}
      {alerts.filter((alert) => !alert.resolved && alert.severity === "critical").length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical Alert:</strong>{" "}
            {alerts.filter((alert) => !alert.resolved && alert.severity === "critical").length} products require
            immediate attention
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({alerts.filter((a) => !a.resolved).length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">Across {categories.length} categories</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {products.filter((p) => p.current_stock <= p.min_stock_level && p.current_stock > 0).length}
                </div>
                <p className="text-xs text-muted-foreground">Need restocking soon</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {products.filter((p) => p.current_stock === 0).length}
                </div>
                <p className="text-xs text-muted-foreground">Immediate action required</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Auto-Reorder Active</CardTitle>
                <Zap className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{products.filter((p) => p.auto_reorder).length}</div>
                <p className="text-xs text-muted-foreground">Smart restocking enabled</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts
                  .filter((alert) => !alert.resolved)
                  .slice(0, 5)
                  .map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-lg border ${getAlertSeverityColor(alert.severity)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{alert.product_name}</p>
                            <p className="text-sm text-gray-600">{alert.message}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {alert.severity}
                          </Badge>
                          <Button size="sm" variant="outline">
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Products Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product)
              return (
                <Card key={product.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      {getTrendIcon(product.demand_trend)}
                    </div>
                    <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Stock:</span>
                      <Badge className={stockStatus.color}>{product.current_stock} units</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Min Level:</span>
                      <span className="text-sm">{product.min_stock_level}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Auto-Reorder:</span>
                      <div className="flex items-center gap-1">
                        {product.auto_reorder ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-sm">{product.auto_reorder ? "Enabled" : "Disabled"}</span>
                      </div>
                    </div>

                    {product.predicted_stockout && (
                      <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs text-yellow-800">
                          Predicted stockout: {new Date(product.predicted_stockout).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Restock
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            {alerts
              .filter((alert) => !alert.resolved)
              .map((alert) => (
                <Card key={alert.id} className={getAlertSeverityColor(alert.severity)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5" />
                        <div>
                          <h4 className="font-medium">{alert.product_name}</h4>
                          <p className="text-sm text-gray-600">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(alert.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {alert.severity}
                        </Badge>
                        <Badge variant="secondary" className="capitalize">
                          {alert.alert_type.replace("_", " ")}
                        </Badge>
                        <Button size="sm">Resolve</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Advanced Analytics Coming Soon</h3>
            <p className="text-gray-600">Detailed inventory analytics and forecasting will be available here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
