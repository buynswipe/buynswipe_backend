"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface ProductPerformanceProps {
  data: any[]
}

export function ProductPerformance({ data }: ProductPerformanceProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (data.length > 0) {
      // Format data for chart
      const formattedData = data.map((product) => ({
        name: product.name,
        value: product.price * (product.inventory_count || 0),
        inventory: product.inventory_count || 0,
      }))

      setChartData(formattedData)
    }
  }, [data])

  if (!mounted) {
    return <div className="h-[300px] w-full bg-muted/20 animate-pulse rounded-md" />
  }

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#8dd1e1",
    "#a4de6c",
    "#d0ed57",
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Inventory Value by Product</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`₹${value}`, "Inventory Value"]}
              contentStyle={{
                backgroundColor: theme === "dark" ? "#333" : "#fff",
                color: theme === "dark" ? "#fff" : "#333",
                border: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`,
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Inventory Count by Product</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#444" : "#eee"} />
            <XAxis
              type="number"
              stroke={theme === "dark" ? "#888" : "#333"}
              tick={{ fill: theme === "dark" ? "#888" : "#333" }}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke={theme === "dark" ? "#888" : "#333"}
              tick={{ fill: theme === "dark" ? "#888" : "#333" }}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === "dark" ? "#333" : "#fff",
                color: theme === "dark" ? "#fff" : "#333",
                border: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`,
              }}
            />
            <Legend />
            <Bar dataKey="inventory" name="Inventory Count" fill="#8884d8" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
