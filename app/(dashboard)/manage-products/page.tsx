"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  description: string
  category: string
  subcategory: string
  brand: string
  sku: string
  barcode: string
  price: number
  cost_price: number
  margin_percentage: number
  stock_quantity: number
  min_stock_level: number
  max_stock_level: number
  unit: string
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  images: string[]
  tags: string[]
  status: "active" | "inactive" | "discontinued"
  featured: boolean
  created_at: string
  updated_at: string
  supplier: {
    id: string
    name: string
    contact: string
  }
  sales_data: {
    total_sold: number
    revenue: number
    last_sale_date: string
  }
}

interface ProductStats {
  total_products: number
  active_products: number
  low_stock_products: number
  out_of_stock_products: number
  total_value: number
  categories: Array<{
    name: string
    count: number
    percentage: number
  }>
  top_selling: Array<{
    id: string
    name: string
    sales: number
    revenue: number
  }>
}

export default function ManageProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<ProductStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState("products")
  const { toast } = useToast()

  // Form state for adding/editing products
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    brand: "",
    sku: "",
    barcode: "",
    price: "",
    cost_price: "",
    stock_quantity: "",
    min_stock_level: "",
    max_stock_level: "",
    unit: "piece",
    weight: "",
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
    tags: "",
    status: "active" as const,
    featured: false,
  })

  useEffect(() => {
    fetchProducts()
    fetchStats()
  }, [])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)

      // Mock product data
      const mockProducts: Product[] = [
        {
          id: "1",
          name: "Premium Basmati Rice 1kg",
          description: "High-quality aged basmati rice with long grains and aromatic fragrance",
          category: "Groceries",
          subcategory: "Rice & Grains",
          brand: "Royal Brand",
          sku: "RB-RICE-001",
          barcode: "8901030895016",
          price: 85.0,
          cost_price: 65.0,
          margin_percentage: 30.77,
          stock_quantity: 150,
          min_stock_level: 50,
          max_stock_level: 500,
          unit: "kg",
          weight: 1.0,
          dimensions: { length: 25, width: 15, height: 5 },
          images: ["/placeholder.svg?height=200&width=200"],
          tags: ["premium", "organic", "aromatic"],
          status: "active",
          featured: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-15T10:30:00Z",
          supplier: {
            id: "sup1",
            name: "ABC Rice Mills",
            contact: "+91 9876543210",
          },
          sales_data: {
            total_sold: 450,
            revenue: 38250,
            last_sale_date: "2024-01-15T14:30:00Z",
          },
        },
        {
          id: "2",
          name: "Whole Wheat Flour 1kg",
          description: "Fresh ground whole wheat flour, rich in fiber and nutrients",
          category: "Groceries",
          subcategory: "Flour & Grains",
          brand: "Nature's Best",
          sku: "NB-FLOUR-001",
          barcode: "8901030895017",
          price: 45.0,
          cost_price: 35.0,
          margin_percentage: 28.57,
          stock_quantity: 25,
          min_stock_level: 30,
          max_stock_level: 200,
          unit: "kg",
          weight: 1.0,
          dimensions: { length: 20, width: 12, height: 4 },
          images: ["/placeholder.svg?height=200&width=200"],
          tags: ["whole-grain", "healthy", "fresh"],
          status: "active",
          featured: false,
          created_at: "2024-01-02T00:00:00Z",
          updated_at: "2024-01-15T09:15:00Z",
          supplier: {
            id: "sup2",
            name: "XYZ Flour Mills",
            contact: "+91 9876543211",
          },
          sales_data: {
            total_sold: 320,
            revenue: 14400,
            last_sale_date: "2024-01-14T16:45:00Z",
          },
        },
        {
          id: "3",
          name: "Refined Sugar 1kg",
          description: "Pure white refined sugar, perfect for cooking and beverages",
          category: "Groceries",
          subcategory: "Sugar & Sweeteners",
          brand: "Sweet Crystal",
          sku: "SC-SUGAR-001",
          barcode: "8901030895018",
          price: 50.0,
          cost_price: 42.0,
          margin_percentage: 19.05,
          stock_quantity: 0,
          min_stock_level: 20,
          max_stock_level: 150,
          unit: "kg",
          weight: 1.0,
          dimensions: { length: 18, width: 12, height: 6 },
          images: ["/placeholder.svg?height=200&width=200"],
          tags: ["refined", "pure", "crystal"],
          status: "active",
          featured: false,
          created_at: "2024-01-03T00:00:00Z",
          updated_at: "2024-01-14T16:45:00Z",
          supplier: {
            id: "sup3",
            name: "Sweet Suppliers Ltd",
            contact: "+91 9876543212",
          },
          sales_data: {
            total_sold: 280,
            revenue: 14000,
            last_sale_date: "2024-01-14T12:30:00Z",
          },
        },
        {
          id: "4",
          name: "Premium Green Tea 250g",
          description: "Organic green tea leaves with natural antioxidants",
          category: "Beverages",
          subcategory: "Tea & Coffee",
          brand: "Tea Masters",
          sku: "TM-TEA-001",
          barcode: "8901030895019",
          price: 180.0,
          cost_price: 120.0,
          margin_percentage: 50.0,
          stock_quantity: 80,
          min_stock_level: 25,
          max_stock_level: 100,
          unit: "g",
          weight: 0.25,
          dimensions: { length: 15, width: 10, height: 8 },
          images: ["/placeholder.svg?height=200&width=200"],
          tags: ["organic", "antioxidant", "premium"],
          status: "active",
          featured: true,
          created_at: "2024-01-04T00:00:00Z",
          updated_at: "2024-01-15T11:20:00Z",
          supplier: {
            id: "sup4",
            name: "Tea Gardens Co.",
            contact: "+91 9876543213",
          },
          sales_data: {
            total_sold: 150,
            revenue: 27000,
            last_sale_date: "2024-01-15T10:15:00Z",
          },
        },
        {
          id: "5",
          name: "Cold Pressed Coconut Oil 1L",
          description: "Pure cold-pressed coconut oil, ideal for cooking and health",
          category: "Groceries",
          subcategory: "Oils & Ghee",
          brand: "Pure Nature",
          sku: "PN-OIL-001",
          barcode: "8901030895020",
          price: 220.0,
          cost_price: 150.0,
          margin_percentage: 46.67,
          stock_quantity: 15,
          min_stock_level: 20,
          max_stock_level: 100,
          unit: "L",
          weight: 1.0,
          dimensions: { length: 8, width: 8, height: 25 },
          images: ["/placeholder.svg?height=200&width=200"],
          tags: ["cold-pressed", "pure", "healthy"],
          status: "active",
          featured: false,
          created_at: "2024-01-05T00:00:00Z",
          updated_at: "2024-01-15T08:30:00Z",
          supplier: {
            id: "sup5",
            name: "Oil Industries Ltd",
            contact: "+91 9876543214",
          },
          sales_data: {
            total_sold: 95,
            revenue: 20900,
            last_sale_date: "2024-01-14T18:20:00Z",
          },
        },
      ]

      setProducts(mockProducts)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Mock stats data
      const mockStats: ProductStats = {
        total_products: 5,
        active_products: 5,
        low_stock_products: 2,
        out_of_stock_products: 1,
        total_value: 134550,
        categories: [
          { name: "Groceries", count: 4, percentage: 80 },
          { name: "Beverages", count: 1, percentage: 20 },
        ],
        top_selling: [
          { id: "1", name: "Premium Basmati Rice 1kg", sales: 450, revenue: 38250 },
          { id: "2", name: "Whole Wheat Flour 1kg", sales: 320, revenue: 14400 },
          { id: "3", name: "Refined Sugar 1kg", sales: 280, revenue: 14000 },
        ],
      }

      setStats(mockStats)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleAddProduct = async () => {
    try {
      // Validate form data
      if (!formData.name || !formData.category || !formData.price) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        brand: formData.brand,
        sku: formData.sku || `AUTO-${Date.now()}`,
        barcode: formData.barcode || `${Date.now()}`,
        price: Number.parseFloat(formData.price),
        cost_price: Number.parseFloat(formData.cost_price) || 0,
        margin_percentage:
          Number.parseFloat(formData.price) && Number.parseFloat(formData.cost_price)
            ? ((Number.parseFloat(formData.price) - Number.parseFloat(formData.cost_price)) /
                Number.parseFloat(formData.price)) *
              100
            : 0,
        stock_quantity: Number.parseInt(formData.stock_quantity) || 0,
        min_stock_level: Number.parseInt(formData.min_stock_level) || 0,
        max_stock_level: Number.parseInt(formData.max_stock_level) || 1000,
        unit: formData.unit,
        weight: Number.parseFloat(formData.weight) || 0,
        dimensions: {
          length: Number.parseFloat(formData.dimensions.length) || 0,
          width: Number.parseFloat(formData.dimensions.width) || 0,
          height: Number.parseFloat(formData.dimensions.height) || 0,
        },
        images: ["/placeholder.svg?height=200&width=200"],
        tags: formData.tags.split(",").map((tag) => tag.trim()),
        status: formData.status,
        featured: formData.featured,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        supplier: {
          id: "default",
          name: "Default Supplier",
          contact: "",
        },
        sales_data: {
          total_sold: 0,
          revenue: 0,
          last_sale_date: "",
        },
      }

      setProducts([...products, newProduct])
      setShowAddDialog(false)
      resetForm()

      toast({
        title: "Success",
        description: "Product added successfully",
      })
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      sku: product.sku,
      barcode: product.barcode,
      price: product.price.toString(),
      cost_price: product.cost_price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      min_stock_level: product.min_stock_level.toString(),
      max_stock_level: product.max_stock_level.toString(),
      unit: product.unit,
      weight: product.weight.toString(),
      dimensions: {
        length: product.dimensions.length.toString(),
        width: product.dimensions.width.toString(),
        height: product.dimensions.height.toString(),
      },
      tags: product.tags.join(", "),
      status: product.status,
      featured: product.featured,
    })
    setShowAddDialog(true)
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return

    try {
      const updatedProduct: Product = {
        ...editingProduct,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        brand: formData.brand,
        sku: formData.sku,
        barcode: formData.barcode,
        price: Number.parseFloat(formData.price),
        cost_price: Number.parseFloat(formData.cost_price) || 0,
        margin_percentage:
          Number.parseFloat(formData.price) && Number.parseFloat(formData.cost_price)
            ? ((Number.parseFloat(formData.price) - Number.parseFloat(formData.cost_price)) /
                Number.parseFloat(formData.price)) *
              100
            : 0,
        stock_quantity: Number.parseInt(formData.stock_quantity) || 0,
        min_stock_level: Number.parseInt(formData.min_stock_level) || 0,
        max_stock_level: Number.parseInt(formData.max_stock_level) || 1000,
        unit: formData.unit,
        weight: Number.parseFloat(formData.weight) || 0,
        dimensions: {
          length: Number.parseFloat(formData.dimensions.length) || 0,
          width: Number.parseFloat(formData.dimensions.width) || 0,
          height: Number.parseFloat(formData.dimensions.height) || 0,
        },
        tags: formData.tags.split(",").map((tag) => tag.trim()),
        status: formData.status,
        featured: formData.featured,
        updated_at: new Date().toISOString(),
      }

      setProducts(products.map((p) => (p.id === editingProduct.id ? updatedProduct : p)))
      setShowAddDialog(false)
      setEditingProduct(null)
      resetForm()

      toast({
        title: "Success",
        description: "Product updated successfully",
      })
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      setProducts(products.filter((p) => p.id !== productId))
      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      subcategory: "",
      brand: "",
      sku: "",
      barcode: "",
      price: "",
      cost_price: "",
      stock_quantity: "",
      min_stock_level: "",
      max_stock_level: "",
      unit: "piece",
      weight: "",
      dimensions: {
        length: "",
        width: "",
        height: "",
      },
      tags: "",
      status: "active",
      featured: false,
    })
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || product.status === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Product]
    let bValue: any = b[sortBy as keyof Product]

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) {
      return { label: "Out of Stock", color: "bg-red-100 text-red-800", icon: XCircle }
    } else if (product.stock_quantity <= product.min_stock_level) {
      return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle }
    } else {
      return { label: "In Stock", color: "bg-green-100 text-green-800", icon: CheckCircle }
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
          <p className="text-muted-foreground">Manage your product catalog, inventory, and pricing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingProduct(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>
                  {editingProduct ? "Update product information" : "Enter product details to add to your catalog"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter product description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Groceries">Groceries</SelectItem>
                          <SelectItem value="Beverages">Beverages</SelectItem>
                          <SelectItem value="Snacks">Snacks</SelectItem>
                          <SelectItem value="Personal Care">Personal Care</SelectItem>
                          <SelectItem value="Household">Household</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="subcategory">Subcategory</Label>
                      <Input
                        id="subcategory"
                        value={formData.subcategory}
                        onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                        placeholder="Enter subcategory"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="Enter brand name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="Enter SKU"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      placeholder="Enter barcode"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="price">Selling Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cost_price">Cost Price</Label>
                      <Input
                        id="cost_price"
                        type="number"
                        step="0.01"
                        value={formData.cost_price}
                        onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="stock_quantity">Stock Qty</Label>
                      <Input
                        id="stock_quantity"
                        type="number"
                        value={formData.stock_quantity}
                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="min_stock_level">Min Stock</Label>
                      <Input
                        id="min_stock_level"
                        type="number"
                        value={formData.min_stock_level}
                        onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_stock_level">Max Stock</Label>
                      <Input
                        id="max_stock_level"
                        type="number"
                        value={formData.max_stock_level}
                        onChange={(e) => setFormData({ ...formData, max_stock_level: e.target.value })}
                        placeholder="1000"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value) => setFormData({ ...formData, unit: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="piece">Piece</SelectItem>
                          <SelectItem value="kg">Kilogram</SelectItem>
                          <SelectItem value="g">Gram</SelectItem>
                          <SelectItem value="L">Liter</SelectItem>
                          <SelectItem value="ml">Milliliter</SelectItem>
                          <SelectItem value="pack">Pack</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Dimensions (L × W × H)</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.dimensions.length}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dimensions: { ...formData.dimensions, length: e.target.value },
                          })
                        }
                        placeholder="Length"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.dimensions.width}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dimensions: { ...formData.dimensions, width: e.target.value },
                          })
                        }
                        placeholder="Width"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.dimensions.height}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dimensions: { ...formData.dimensions, height: e.target.value },
                          })
                        }
                        placeholder="Height"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="premium, organic, healthy"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                      />
                      <Label htmlFor="featured">Featured Product</Label>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="discontinued">Discontinued</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={editingProduct ? handleUpdateProduct : handleAddProduct}>
                  {editingProduct ? "Update Product" : "Add Product"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_products || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.active_products || 0} active products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.total_value.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Inventory value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.low_stock_products || 0}</div>
            <p className="text-xs text-muted-foreground">Items need restock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.out_of_stock_products || 0}</div>
            <p className="text-xs text-muted-foreground">Items unavailable</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, SKU, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Groceries">Groceries</SelectItem>
                <SelectItem value="Beverages">Beverages</SelectItem>
                <SelectItem value="Snacks">Snacks</SelectItem>
                <SelectItem value="Personal Care">Personal Care</SelectItem>
                <SelectItem value="Household">Household</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="stock_quantity">Stock</SelectItem>
                <SelectItem value="created_at">Date Added</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
              {sortOrder === "asc" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => {
              const stockStatus = getStockStatus(product)
              const StatusIcon = stockStatus.icon

              return (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-square bg-gray-100 relative">
                    <img
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.featured && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Badge className={`absolute top-2 right-2 ${stockStatus.color}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {stockStatus.label}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold">₹{product.price.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            Margin: {product.margin_percentage.toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {product.stock_quantity} {product.unit}
                          </p>
                          <p className="text-xs text-muted-foreground">in stock</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>SKU: {product.sku}</span>
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1 pt-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {sortedProducts.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                    ? "Try adjusting your search or filters"
                    : "Get started by adding your first product"}
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Products with highest sales volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.top_selling.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.sales} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{item.revenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Products by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.categories.map((category, index) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {category.count} products ({category.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${category.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Categories</CardTitle>
              <CardDescription>Manage your product categories and subcategories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats?.categories.map((category) => (
                  <Card key={category.name}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.count} products</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{category.percentage}%</p>
                          <p className="text-xs text-muted-foreground">of catalog</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
