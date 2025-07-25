"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Package, AlertTriangle, TrendingUp, TrendingDown, Search, Download, Plus, BarChart3 } from "lucide-react"
import { InventoryAnalytics } from "@/components/inventory/inventory-analytics"
import { useToast } from "@/hooks/use-toast"

interface InventoryItem {
  id: string
  name: string
  category: string
  current_stock: number
  min_stock: number
  max_stock: number
  unit_price: number
  total_value: number
  last_updated: string
  status: "in_stock" | "low_stock" | "out_of_stock"
  barcode?: string
}

interface InventoryStats {
  total_items: number
  total_value: number
  low_stock_items: number
  out_of_stock_items: number
  categories: Array<{
    name: string
    count: number
    value: number
    percentage: number
  }>
}

export default function InventoryPage() {
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([])
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const fetchInventoryData = async () => {
    try {
      setIsLoading(true)

      // Mock data for demonstration
      const mockInventoryData: InventoryItem[] = [
        {
          id: "1",
          name: "Rice 1kg",
          category: "Groceries",
          current_stock: 150,
          min_stock: 50,
          max_stock: 500,
          unit_price: 45.0,
          total_value: 6750,
          last_updated: "2024-01-15T10:30:00Z",
          status: "in_stock",
          barcode: "8901030895016",
        },
        {
          id: "2",
          name: "Wheat Flour 1kg",
          category: "Groceries",
          current_stock: 25,
          min_stock: 30,
          max_stock: 200,
          unit_price: 35.0,
          total_value: 875,
          last_updated: "2024-01-15T09:15:00Z",
          status: "low_stock",
          barcode: "8901030895017",
        },
        {
          id: "3",
          name: "Sugar 1kg",
          category: "Groceries",
          current_stock: 0,
          min_stock: 20,
          max_stock: 150,
          unit_price: 42.0,
          total_value: 0,
          last_updated: "2024-01-14T16:45:00Z",
          status: "out_of_stock",
          barcode: "8901030895018",
        },
        {
          id: "4",
          name: "Tea 250g",
          category: "Beverages",
          current_stock: 80,
          min_stock: 25,
          max_stock: 100,
          unit_price: 120.0,
          total_value: 9600,
          last_updated: "2024-01-15T11:20:00Z",
          status: "in_stock",
          barcode: "8901030895019",
        },
        {
          id: "5",
          name: "Cooking Oil 1L",
          category: "Groceries",
          current_stock: 15,
          min_stock: 20,
          max_stock: 100,
          unit_price: 150.0,
          total_value: 2250,
          last_updated: "2024-01-15T08:30:00Z",
          status: "low_stock",
          barcode: "8901030895020",
        },
      ]

      const mockStats: InventoryStats = {
        total_items: mockInventoryData.length,
        total_value: mockInventoryData.reduce((sum, item) => sum + item.total_value, 0),
        low_stock_items: mockInventoryData.filter((item) => item.status === "low_stock").length,
        out_of_stock_items: mockInventoryData.filter((item) => item.status === "out_of_stock").length,
        categories: [
          { name: "Groceries", count: 4, value: 9875, percentage: 80 },
          { name: "Beverages", count: 1, value: 9600, percentage: 20 },
        ],
      }

      setInventoryData(mockInventoryData)
      setStats(mockStats)
    } catch (error) {
      console.error("Error fetching inventory data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch inventory data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredData = inventoryData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.barcode?.includes(searchTerm)
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-800"
      case "low_stock":
        return "bg-yellow-100 text-yellow-800"
      case "out_of_stock":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_stock":
        return <TrendingUp className="h-4 w-4" />
      case "low_stock":
        return <AlertTriangle className="h-4 w-4" />
      case "out_of_stock":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Monitor and manage your inventory levels, stock alerts, and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_items || 0}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.total_value.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.low_stock_items || 0}</div>
            <p className="text-xs text-muted-foreground">Items below minimum level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.out_of_stock_items || 0}</div>
            <p className="text-xs text-muted-foreground">Items requiring restock</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="all">All Categories</option>
              <option value="Groceries">Groceries</option>
              <option value="Beverages">Beverages</option>
            </select>
          </div>

          {/* Category Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats?.categories.map((category) => (
              <Card key={category.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription>
                    {category.count} items • ₹{category.value.toLocaleString()} value
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Stock Level</span>
                      <span>{category.percentage}%</span>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>
                Showing {filteredData.length} of {inventoryData.length} items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Item</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-left p-2">Stock</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Value</th>
                      <th className="text-left p-2">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">{item.barcode}</div>
                          </div>
                        </td>
                        <td className="p-2">{item.category}</td>
                        <td className="p-2">
                          <div className="text-sm">
                            <div>{item.current_stock} units</div>
                            <div className="text-muted-foreground">
                              Min: {item.min_stock} | Max: {item.max_stock}
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge className={getStatusColor(item.status)}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1 capitalize">{item.status.replace("_", " ")}</span>
                          </Badge>
                        </td>
                        <td className="p-2">₹{item.total_value.toLocaleString()}</td>
                        <td className="p-2 text-sm text-muted-foreground">
                          {new Date(item.last_updated).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <InventoryAnalytics />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Stock Alerts
              </CardTitle>
              <CardDescription>Items requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventoryData
                  .filter((item) => item.status !== "in_stock")
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Current: {item.current_stock} | Minimum: {item.min_stock}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status === "low_stock" ? "Low Stock" : "Out of Stock"}
                        </Badge>
                        <Button size="sm">Reorder</Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
