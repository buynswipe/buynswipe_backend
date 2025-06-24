"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { DataTable } from "@/components/ui/data-table"
import {
  Package,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  BarChart3,
  ShoppingCart,
  Truck,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  ScanLine,
  RefreshCw,
  FileText,
  Calendar,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { inventoryService } from "@/lib/inventory-service"
import { ProductionBarcodeScanner } from "@/components/pos/production-barcode-scanner"

interface InventoryStats {
  totalItems: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  categories: { name: string; count: number; value: number }[]
}

interface InventoryItem {
  id: string
  name: string
  barcode: string
  category: string
  price: number
  costPrice: number
  stock: number
  minStock: number
  maxStock: number
  supplier: string
  location: string
  lastRestocked: Date
  isActive: boolean
}

interface LowStockAlert {
  id: string
  itemId: string
  currentStock: number
  minStock: number
  severity: "LOW" | "CRITICAL" | "OUT_OF_STOCK"
  createdAt: Date
  acknowledged: boolean
  item: {
    name: string
    barcode: string
    category: string
  }
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    categories: [],
  })
  const [items, setItems] = useState<InventoryItem[]>([])
  const [alerts, setAlerts] = useState<LowStockAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories")
  const [showScanner, setShowScanner] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [statsData, itemsData, alertsData] = await Promise.all([
        inventoryService.getInventoryStats(),
        inventoryService.searchInventory(""),
        inventoryService.getLowStockAlerts(),
      ])

      setStats(statsData)
      setItems(itemsData)
      setAlerts(alertsData)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast.error("Failed to load inventory data")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const results = await inventoryService.searchInventory(searchTerm, {
        category: selectedCategory === "All Categories" ? undefined : selectedCategory,
      })
      setItems(results)
    } catch (error) {
      console.error("Error searching inventory:", error)
      toast.error("Search failed")
    } finally {
      setLoading(false)
    }
  }

  const handleProductFound = (product: any) => {
    // Navigate to product details or add to quick actions
    toast.success(`Product found: ${product.name}`)
    setActiveTab("items")
  }

  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold">{stats.totalItems.toLocaleString()}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              Active inventory
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold">₹{stats.totalValue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              At cost price
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
          <div className="mt-2">
            <Badge variant="destructive" className="text-xs">
              Needs attention
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</p>
            </div>
            <Package className="h-8 w-8 text-red-600" />
          </div>
          <div className="mt-2">
            <Badge variant="destructive" className="text-xs">
              Critical
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const CategoryBreakdown = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Category Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.categories.map((category, index) => (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: `hsl(${(index * 360) / stats.categories.length}, 70%, 50%)`,
                    }}
                  />
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{category.count} items</p>
                  <p className="text-xs text-gray-600">₹{category.value.toLocaleString()}</p>
                </div>
              </div>
              <Progress
                value={(category.count / stats.totalItems) * 100}
                className="h-2"
                style={{
                  backgroundColor: `hsl(${(index * 360) / stats.categories.length}, 70%, 90%)`,
                }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const LowStockAlerts = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
            Low Stock Alerts
          </div>
          <Badge variant="destructive">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {alerts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No low stock alerts</p>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${
                  alert.severity === "OUT_OF_STOCK"
                    ? "bg-red-50 border-red-200"
                    : alert.severity === "CRITICAL"
                      ? "bg-orange-50 border-orange-200"
                      : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{alert.item.name}</h4>
                    <p className="text-xs text-gray-600 font-mono">{alert.item.barcode}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge
                        variant={
                          alert.severity === "OUT_OF_STOCK"
                            ? "destructive"
                            : alert.severity === "CRITICAL"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {alert.severity.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-gray-600">
                        {alert.currentStock}/{alert.minStock} min
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{new Date(alert.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )

  const InventoryTable = () => {
    const columns = [
      {
        accessorKey: "name",
        header: "Product Name",
        cell: ({ row }: any) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-gray-500 font-mono">{row.original.barcode}</p>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }: any) => <Badge variant="outline">{row.original.category}</Badge>,
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }: any) => {
          const item = row.original
          const stockLevel = item.stock <= item.minStock ? "low" : "normal"
          return (
            <div className="text-center">
              <p
                className={`font-medium ${
                  stockLevel === "low" ? "text-red-600" : item.stock === 0 ? "text-red-800" : "text-green-600"
                }`}
              >
                {item.stock}
              </p>
              <p className="text-xs text-gray-500">Min: {item.minStock}</p>
            </div>
          )
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: any) => (
          <div className="text-right">
            <p className="font-medium">₹{row.original.price.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Cost: ₹{row.original.costPrice.toFixed(2)}</p>
          </div>
        ),
      },
      {
        accessorKey: "supplier",
        header: "Supplier",
        cell: ({ row }: any) => (
          <div>
            <p className="text-sm">{row.original.supplier}</p>
            <p className="text-xs text-gray-500">{row.original.location}</p>
          </div>
        ),
      },
      {
        accessorKey: "lastRestocked",
        header: "Last Restocked",
        cell: ({ row }: any) => (
          <div className="text-sm">
            {row.original.lastRestocked ? new Date(row.original.lastRestocked).toLocaleDateString() : "Never"}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: any) => (
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ]

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Inventory Items ({items.length})
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowScanner(true)}>
                <ScanLine className="h-4 w-4 mr-2" />
                Scan Item
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAddItem(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
              <Button variant="outline" size="sm" onClick={loadDashboardData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, barcode, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Categories">All Categories</SelectItem>
                {stats.categories.map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    {category.name} ({category.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={loading}>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Data Table */}
          <DataTable columns={columns} data={items} />
        </CardContent>
      </Card>
    )
  }

  const ReportsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stock Valuation Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Items:</span>
                <span className="font-medium">{stats.totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Value:</span>
                <span className="font-medium">₹{stats.totalValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg. Value/Item:</span>
                <span className="font-medium">
                  ₹{stats.totalItems > 0 ? (stats.totalValue / stats.totalItems).toFixed(2) : "0.00"}
                </span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Low Stock Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Low Stock Items:</span>
                <span className="font-medium text-orange-600">{stats.lowStockItems}</span>
              </div>
              <div className="flex justify-between">
                <span>Out of Stock:</span>
                <span className="font-medium text-red-600">{stats.outOfStockItems}</span>
              </div>
              <div className="flex justify-between">
                <span>Reorder Required:</span>
                <span className="font-medium">{stats.lowStockItems + stats.outOfStockItems}</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Generate Reorder List
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col">
                <Upload className="h-6 w-6 mb-2" />
                <span className="text-sm">Bulk Import</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <Download className="h-6 w-6 mb-2" />
                <span className="text-sm">Export Data</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <Truck className="h-6 w-6 mb-2" />
                <span className="text-sm">Purchase Orders</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <Users className="h-6 w-6 mb-2" />
                <span className="text-sm">Suppliers</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col">
              <Upload className="h-6 w-6 mb-2" />
              <span className="text-sm">Bulk Import</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Download className="h-6 w-6 mb-2" />
              <span className="text-sm">Export Data</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Truck className="h-6 w-6 mb-2" />
              <span className="text-sm">Purchase Orders</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">Suppliers</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading inventory data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-gray-600">Manage your inventory, track stock levels, and generate reports</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowScanner(true)}>
            <ScanLine className="h-4 w-4 mr-2" />
            Quick Scan
          </Button>
          <Button onClick={() => setShowAddItem(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryBreakdown />
            <LowStockAlerts />
          </div>
        </TabsContent>

        <TabsContent value="items">
          <InventoryTable />
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                Stock Alerts Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${
                      alert.severity === "OUT_OF_STOCK"
                        ? "bg-red-50 border-red-200"
                        : alert.severity === "CRITICAL"
                          ? "bg-orange-50 border-orange-200"
                          : "bg-yellow-50 border-yellow-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{alert.item.name}</h4>
                          <Badge
                            variant={
                              alert.severity === "OUT_OF_STOCK"
                                ? "destructive"
                                : alert.severity === "CRITICAL"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {alert.severity.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 font-mono mb-1">{alert.item.barcode}</p>
                        <p className="text-sm text-gray-600">
                          Current Stock: {alert.currentStock} | Minimum: {alert.minStock}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Item
                        </Button>
                        <Button variant="outline" size="sm">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Reorder
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>
      </Tabs>

      {/* Barcode Scanner */}
      <ProductionBarcodeScanner open={showScanner} onOpenChange={setShowScanner} onProductFound={handleProductFound} />
    </div>
  )
}
