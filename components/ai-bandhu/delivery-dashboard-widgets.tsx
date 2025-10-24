"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts"
import { MapPin, TrendingUp, Clock } from "lucide-react"

interface DeliveryData {
  hour: string
  completed: number
  pending: number
  earnings: number
}

export function DeliveryDashboardWidgets() {
  const [dailyDeliveries] = useState<DeliveryData[]>([
    { hour: "6 AM", completed: 0, pending: 0, earnings: 0 },
    { hour: "8 AM", completed: 2, pending: 3, earnings: 400 },
    { hour: "10 AM", completed: 5, pending: 4, earnings: 1200 },
    { hour: "12 PM", completed: 8, pending: 2, earnings: 1800 },
    { hour: "2 PM", completed: 12, pending: 3, earnings: 2800 },
    { hour: "4 PM", completed: 15, pending: 5, earnings: 3500 },
    { hour: "6 PM", completed: 18, pending: 2, earnings: 4200 },
    { hour: "8 PM", completed: 21, pending: 0, earnings: 5000 },
  ])

  const [routeOptimization] = useState([
    { x: 12.9716, y: 77.5946, deliveries: 5, avgTime: 8 },
    { x: 12.9352, y: 77.6245, deliveries: 8, avgTime: 10 },
    { x: 13.0827, y: 77.5979, deliveries: 6, avgTime: 9 },
    { x: 12.9698, y: 77.7499, deliveries: 4, avgTime: 7 },
  ])

  const [topEarningHours] = useState([
    { hour: "4-5 PM", earnings: 1200, deliveries: 6, rating: 4.8 },
    { hour: "5-6 PM", earnings: 1100, deliveries: 5, rating: 4.9 },
    { hour: "6-7 PM", earnings: 1050, deliveries: 5, rating: 4.7 },
  ])

  return (
    <div className="space-y-6">
      {/* Daily Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            आज का प्रदर्शन | Today's Performance
          </CardTitle>
          <CardDescription>घंटे-दर-घंटे डिलीवरी और कमाई | Hourly deliveries and earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyDeliveries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="completed"
                fill="#0072F5"
                stroke="#0072F5"
                fillOpacity={0.3}
                name="पूर्ण | Completed"
              />
              <Area
                type="monotone"
                dataKey="pending"
                fill="#FF9B42"
                stroke="#FF9B42"
                fillOpacity={0.3}
                name="लंबित | Pending"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Route Clusters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            रूट क्लस्टर्स | Route Clusters
          </CardTitle>
          <CardDescription>सर्वश्रेष्ठ डिलीवरी जोन | Your best delivery zones</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis type="number" dataKey="x" name="Latitude" />
              <YAxis type="number" dataKey="y" name="Longitude" />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              />
              <Scatter name="डिलीवरी | Deliveries" data={routeOptimization} fill="#0072F5" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Peak Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            शीर्ष कमाई घंटे | Top Earning Hours
          </CardTitle>
          <CardDescription>सर्वोच्च कमाई वाली अवधि | Highest earning periods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topEarningHours.map((slot, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg hover:shadow-md transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{slot.hour}</p>
                  <div className="flex gap-4 text-sm text-gray-600 mt-1">
                    <span>💰 ₹{slot.earnings}</span>
                    <span>📦 {slot.deliveries} deliveries</span>
                    <span>⭐ {slot.rating} rating</span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  अधिक लें | Grab More
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">आज की कमाई | Today's Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹5,000</div>
            <p className="text-xs text-green-600 mt-1">↑ 15% से कल | vs yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">पूर्ण डिलीवरी | Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">21</div>
            <p className="text-xs text-blue-600 mt-1">लक्ष्य: 25 | Target: 25</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">कुल दूरी | Total Distance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">45.2 km</div>
            <p className="text-xs text-purple-600 mt-1">औसत: 2.1 km | Avg: 2.1 km</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">रेटिंग | Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">4.8 ⭐</div>
            <p className="text-xs text-orange-600 mt-1">23 समीक्षा | 23 reviews</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
