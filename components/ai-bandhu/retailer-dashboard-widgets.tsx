"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, AlertTriangle } from "lucide-react"

interface SalesData {
  date: string
  sales: number
  orders: number
}

interface InventoryItem {
  name: string
  stock: number
  reorderLevel: number
  lastRestocked: string
}

export function RetailerDashboardWidgets() {
  const [salesData, setSalesData] = useState<SalesData[]>([
    { date: "Mon", sales: 4500, orders: 24 },
    { date: "Tue", sales: 5200, orders: 28 },
    { date: "Wed", sales: 4800, orders: 22 },
    { date: "Thu", sales: 6100, orders: 35 },
    { date: "Fri", sales: 7200, orders: 42 },
    { date: "Sat", sales: 8100, orders: 48 },
    { date: "Sun", sales: 6500, orders: 38 },
  ])

  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryItem[]>([
    { name: "Tata Salt", stock: 5, reorderLevel: 20, lastRestocked: "5 days ago" },
    { name: "Parle-G", stock: 12, reorderLevel: 30, lastRestocked: "3 days ago" },
    { name: "Amul Butter", stock: 8, reorderLevel: 15, lastRestocked: "7 days ago" },
  ])

  const [topProducts] = useState([
    { name: "Biscuits", value: 35, fill: "#0072F5" },
    { name: "Dairy", value: 28, fill: "#FF9B42" },
    { name: "Oils", value: 20, fill: "#00D084" },
    { name: "Snacks", value: 17, fill: "#FF5733" },
  ])

  return (
    <div className="space-y-6">
      {/* Sales Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            साप्ताहिक बिक्री ट्रेंड | Weekly Sales Trend
          </CardTitle>
          <CardDescription>पिछले 7 दिनों की बिक्री | Last 7 days sales</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              />
              <Line type="monotone" dataKey="sales" stroke="#0072F5" strokeWidth={2} dot={{ fill: "#0072F5", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Product Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>उत्पाद मिश्रण | Product Mix</CardTitle>
            <CardDescription>आपकी बिक्री का वितरण | Sales distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>मुख्य मेट्रिक्स | Key Metrics</CardTitle>
            <CardDescription>आपके व्यापार का प्रदर्शन | Business performance today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">आज की बिक्री | Today's Sales</span>
                <span className="text-lg font-bold text-blue-600">₹6,500</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">आज के ऑर्डर | Today's Orders</span>
                <span className="text-lg font-bold text-green-600">28</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">औसत ऑर्डर | Avg Order Value</span>
                <span className="text-lg font-bold text-orange-600">₹232</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">ग्रोथ | Week Growth</span>
                <span className="text-lg font-bold text-purple-600">+18%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Alerts */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            इनवेंटरी अलर्ट्स | Inventory Alerts
          </CardTitle>
          <CardDescription>कम स्टॉक वाले उत्पाद | Low stock items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {inventoryAlerts.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Stock: {item.stock}/{item.reorderLevel} • {item.lastRestocked}
                  </p>
                </div>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  ऑर्डर करें | Order
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
