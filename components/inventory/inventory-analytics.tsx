"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, Target, Package, Activity } from "lucide-react"

interface AnalyticsData {
  stockMovement: Array<{
    date: string
    inbound: number
    outbound: number
    net: number
  }>
  categoryPerformance: Array<{
    name: string
    value: number
    growth: number
    color: string
  }>
  topMovingItems: Array<{
    name: string
    quantity: number
    trend: "up" | "down"
    percentage: number
  }>
  turnoverMetrics: {
    overall: number
    target: number
    categories: Array<{
      name: string
      turnover: number
      target: number
    }>
  }
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function InventoryAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true)

      // Mock analytics data
      const mockData: AnalyticsData = {
        stockMovement: [
          { date: "2024-01-01", inbound: 120, outbound: 80, net: 40 },
          { date: "2024-01-02", inbound: 150, outbound: 95, net: 55 },
          { date: "2024-01-03", inbound: 100, outbound: 110, net: -10 },
          { date: "2024-01-04", inbound: 180, outbound: 120, net: 60 },
          { date: "2024-01-05", inbound: 140, outbound: 100, net: 40 },
          { date: "2024-01-06", inbound: 160, outbound: 130, net: 30 },
          { date: "2024-01-07", inbound: 200, outbound: 150, net: 50 },
        ],
        categoryPerformance: [
          { name: "Groceries", value: 65, growth: 12.5, color: "#0088FE" },
          { name: "Beverages", value: 25, growth: -3.2, color: "#00C49F" },
          { name: "Snacks", value: 10, growth: 8.7, color: "#FFBB28" },
        ],
        topMovingItems: [
          { name: "Rice 1kg", quantity: 450, trend: "up", percentage: 15.2 },
          { name: "Tea 250g", quantity: 320, trend: "up", percentage: 8.7 },
          { name: "Sugar 1kg", quantity: 280, trend: "down", percentage: -5.3 },
          { name: "Cooking Oil 1L", quantity: 190, trend: "up", percentage: 12.1 },
          { name: "Wheat Flour 1kg", quantity: 150, trend: "down", percentage: -2.8 },
        ],
        turnoverMetrics: {
          overall: 4.2,
          target: 5.0,
          categories: [
            { name: "Groceries", turnover: 4.8, target: 5.5 },
            { name: "Beverages", turnover: 3.2, target: 4.0 },
            { name: "Snacks", turnover: 6.1, target: 6.0 },
          ],
        },
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setAnalyticsData(mockData)
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!analyticsData) return null

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Inventory Analytics</h2>
        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded text-sm ${
                timeRange === range ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Turnover</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.turnoverMetrics.overall}x</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Target className="mr-1 h-3 w-3" />
              Target: {analyticsData.turnoverMetrics.target}x
            </div>
            <Progress
              value={(analyticsData.turnoverMetrics.overall / analyticsData.turnoverMetrics.target) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movement Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+12.5%</div>
            <p className="text-xs text-muted-foreground">vs previous period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Days to Sell</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.5</div>
            <p className="text-xs text-muted-foreground">days average</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Movement Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Movement Trends</CardTitle>
            <CardDescription>Inbound vs Outbound inventory over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.stockMovement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="inbound" stackId="1" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} />
                <Area
                  type="monotone"
                  dataKey="outbound"
                  stackId="2"
                  stroke="#FF8042"
                  fill="#FF8042"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Distribution and growth by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.categoryPerformance}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {analyticsData.categoryPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Moving Items */}
        <Card>
          <CardHeader>
            <CardTitle>Top Moving Items</CardTitle>
            <CardDescription>Items with highest movement this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topMovingItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.quantity} units</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${item.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {item.percentage > 0 ? "+" : ""}
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Turnover by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Turnover by Category</CardTitle>
            <CardDescription>Performance vs targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.turnoverMetrics.categories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {category.turnover}x / {category.target}x
                    </span>
                  </div>
                  <Progress value={(category.turnover / category.target) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
