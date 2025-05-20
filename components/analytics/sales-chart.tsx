"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface SalesChartProps {
  data: any[]
}

export function SalesChart({ data }: SalesChartProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (data.length > 0) {
      // Group data by date
      const groupedData = data.reduce((acc: any, order: any) => {
        const date = new Date(order.created_at).toLocaleDateString()
        if (!acc[date]) {
          acc[date] = {
            date,
            total: 0,
            count: 0,
          }
        }
        acc[date].total += order.total_amount || 0
        acc[date].count += 1
        return acc
      }, {})

      // Convert to array and sort by date
      const chartData = Object.values(groupedData).sort((a: any, b: any) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })

      setChartData(chartData)
    }
  }, [data])

  if (!mounted) {
    return <div className="h-[300px] w-full bg-muted/20 animate-pulse rounded-md" />
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#444" : "#eee"} />
        <XAxis
          dataKey="date"
          stroke={theme === "dark" ? "#888" : "#333"}
          tick={{ fill: theme === "dark" ? "#888" : "#333" }}
        />
        <YAxis stroke={theme === "dark" ? "#888" : "#333"} tick={{ fill: theme === "dark" ? "#888" : "#333" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: theme === "dark" ? "#333" : "#fff",
            color: theme === "dark" ? "#fff" : "#333",
            border: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`,
          }}
        />
        <Legend />
        <Bar dataKey="total" name="Revenue (₹)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="count" name="Orders" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
