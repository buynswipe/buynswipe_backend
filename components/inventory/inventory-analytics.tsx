"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, TrendingDown, Package, AlertTriangle, Calendar, Target, Activity } from "lucide-react"

interface AnalyticsData {
  stockMovements: Array<{
    date: string
    inbound: number
    outbound: number
    adjustments: number
  }>
  categoryPerformance: Array<{
    category: string
    value: number
    count: number
    growth: number
  }>
  topMovingItems: Array<{
    name: string
    barcode: string
    movement: number
    trend: "up" | "down" | "stable"
  }>
  stockTurnover: Array<{
    month: string
    turnover: number
    target: number
  }>
  alerts: {
    critical: number
    warning: number
    info: number
  }
}

export function InventoryAnalytics() {
  const [data, setData] = useState<AnalyticsData>({
    stockMovements: [],
    categoryPerformance: [],
    topMovingItems: [],
    stockTurnover: [],
    alerts: { critical: 0, warning: 0, info: 0 },
  })
  const [timeRange, setTimeRange] = useState("30d")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      // Mock data - replace with actual API calls
      const mockData: AnalyticsData = {
        stockMovements: [
          { date: "2024-01-01", inbound: 120, outbound: 80, adjustments: 5 },
          { date: "2024-01-02", inbound: 95, outbound: 110, adjustments: 2 },
          { date: "2024-01-03", inbound: 140, outbound: 95, adjustments: 8 },
          { date: "2024-01-04", inbound: 110, outbound: 125, adjustments: 3 },
          { date: "2024-01-05", inbound: 85, outbound: 90, adjustments: 1 },
          { date: "2024-01-06", inbound: 160, outbound: 140, adjustments: 6 },
          { date: "2024-01-07", inbound: 130, outbound: 115, adjustments: 4 },
        ],
        categoryPerformance: [
          { category: "Beverages", value: 45000, count: 25, growth: 12.5 },
          { category: "Snacks", value: 32000, count: 18, growth: 8.3 },
          { category: "Groceries", value: 28000, count: 22, growth: -2.1 },
          { category: "Personal Care", value: 15000, count: 12, growth: 15.7 },
          { category: "Household", value: 12000, count: 8, growth: 5.2 },
        ],
        topMovingItems: [
          { name: "Coca Cola 500ml", barcode: "1234567890123", movement: 150, trend: "up" },
          { name: "Lays Classic 50g", barcode: "9876543210987", movement: 120, trend: "up" },
          { name: "Maggi Noodles", barcode: "5555555555555", movement: 95, trend: "stable" },
          { name: "Colgate Total", barcode: "1111111111111", movement: 75, trend: "down" },
          { name: "Surf Excel 1kg", barcode: "7777777777777", movement: 60, trend: "up" },
        ],
        stockTurnover: [
          { month: "Jan", turnover: 4.2, target: 4.0 },
          { month: "Feb", turnover: 3.8, target: 4.0 },
          { month: "Mar", turnover: 4.5, target: 4.0 },
          { month: "Apr", turnover: 4.1, target: 4.0 },
          { month: "May", turnover: 4.7, target: 4.0 },
          { month: "Jun", turnover: 4.3, target: 4.0 },
        ],
        alerts: { critical: 5, warning: 12, info: 8 },
      }

      setData(mockData)
    } catch (error) {
      console.error("Error loading analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Turnover</p>
                <p className="text-2xl font-bold">4.3x</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +7.5% vs target
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Days to Sell</p>
                <p className="text-2xl font-bold">85</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -12 days improved
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dead Stock Value</p>
                <p className="text-2xl font-bold">₹8,500</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />3 items affected
                </p>
              </div>
              <Package className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reorder Point Hit</p>
                <p className="text-2xl font-bold">92%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <Target className="h-3 w-3 mr-1" />
                  Optimal level
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="movements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="categories">Category Performance</TabsTrigger>
          <TabsTrigger value="turnover">Turnover Analysis</TabsTrigger>
          <TabsTrigger value="items">Top Items</TabsTrigger>
        </TabsList>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>Stock Movement Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.stockMovements}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="inbound" stackId="1" stroke="#10B981" fill="#10B981" />
                  <Area type="monotone" dataKey="outbound" stackId="1" stroke="#EF4444" fill="#EF4444" />
                  <Area type="monotone" dataKey="adjustments" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Value Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.categoryPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, value }) => `${category}: ₹${value.toLocaleString()}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.categoryPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.categoryPerformance.map((category, index) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{category.category}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              category.growth > 0 ? "default" : category.growth < 0 ? "destructive" : "secondary"
                            }
                          >
                            {category.growth > 0 ? "+" : ""}
                            {category.growth.toFixed(1)}%
                          </Badge>
                          {category.growth > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : category.growth < 0 ? (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          ) : (
                            <div className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                      <Progress
                        value={Math.abs(category.growth) * 5} // Scale for visualization
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="turnover">
          <Card>
            <CardHeader>
              <CardTitle>Stock Turnover vs Target</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.stockTurnover}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="turnover" stroke="#3B82F6" strokeWidth={3} />
                  <Line type="monotone" dataKey="target" stroke="#EF4444" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Top Moving Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topMovingItems.map((item, index) => (
                  <div key={item.barcode} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600 font-mono">{item.barcode}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="font-medium">{item.movement} units</p>
                        <p className="text-sm text-gray-600">this period</p>
                      </div>
                      {item.trend === "up" ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : item.trend === "down" ? (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      ) : (
                        <div className="h-5 w-5 bg-gray-400 rounded-full" />
                      )}
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
