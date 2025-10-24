"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, Users } from "lucide-react"

interface OrderData {
  retailer: string
  orders: number
  revenue: number
  lastOrder: string
}

export function WholesalerDashboardWidgets() {
  const [demandForecast] = useState([
    { week: "Week 1", forecast: 2400, actual: 2210 },
    { week: "Week 2", forecast: 2210, actual: 2290 },
    { week: "Week 3", forecast: 2290, actual: 2000 },
    { week: "Week 4", forecast: 2000, actual: 2181 },
    { week: "Week 5", forecast: 2181, actual: 2500 },
  ])

  const [topRetailers] = useState<OrderData[]>([
    { retailer: "Sharma Store", orders: 24, revenue: 125000, lastOrder: "Today" },
    { retailer: "Patel Mart", orders: 19, revenue: 98500, lastOrder: "Yesterday" },
    { retailer: "Local Kirana", orders: 18, revenue: 92000, lastOrder: "2 days ago" },
  ])

  const [categoryPerformance] = useState([
    { category: "Biscuits", revenue: 250000, margin: 18 },
    { category: "Dairy", revenue: 180000, margin: 15 },
    { category: "Oils", revenue: 145000, margin: 12 },
    { category: "Snacks", revenue: 120000, margin: 20 },
  ])

  return (
    <div className="space-y-6">
      {/* Demand Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            मांग पूर्वानुमान | Demand Forecast
          </CardTitle>
          <CardDescription>5 सप्ताह का पूर्वानुमान | 5-week forecast analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={demandForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="forecast" stroke="#0072F5" strokeWidth={2} name="पूर्वानुमान | Forecast" />
              <Line type="monotone" dataKey="actual" stroke="#FF9B42" strokeWidth={2} name="वास्तविक | Actual" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>श्रेणी प्रदर्शन | Category Performance</CardTitle>
          <CardDescription>राजस्व और मार्जिन | Revenue and margin by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="category" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#0072F5" name="राजस्व ₹ | Revenue" />
              <Bar yAxisId="right" dataKey="margin" fill="#FF9B42" name="मार्जिन % | Margin" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Retailers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            शीर्ष खुदरा विक्रेता | Top Retailers
          </CardTitle>
          <CardDescription>इस महीने के शीर्ष प्रदर्शक | Top performers this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topRetailers.map((retailer, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{retailer.retailer}</p>
                  <div className="flex gap-4 text-sm text-gray-600 mt-1">
                    <span>📦 {retailer.orders} orders</span>
                    <span>💰 ₹{(retailer.revenue / 1000).toFixed(0)}k</span>
                    <span>🕐 {retailer.lastOrder}</span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  विवरण | Details
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">मासिक राजस्व | Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹15.2L</div>
            <p className="text-xs text-green-600 mt-1">↑ 12% से पिछले माह | vs last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">सक्रिय खुदरा विक्रेता | Active Retailers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">234</div>
            <p className="text-xs text-green-600 mt-1">↑ 8 नए इस माह | New this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">औसत मार्जिन | Avg Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">16.2%</div>
            <p className="text-xs text-orange-600 mt-1">↓ 0.5% से पिछले माह | vs last month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
