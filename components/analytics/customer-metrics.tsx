"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface CustomerMetricsProps {
  data: any[]
}

export function CustomerMetrics({ data }: CustomerMetricsProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (data.length > 0) {
      // Group data by month
      const groupedData = data.reduce((acc: any, customer: any) => {
        const date = new Date(customer.created_at)
        const month = date.toLocaleString("default", { month: "short", year: "numeric" })

        if (!acc[month]) {
          acc[month] = {
            month,
            count: 0,
            timestamp: date.getTime(),
          }
        }
        acc[month].count += 1
        return acc
      }, {})

      // Convert to array and sort by date
      const chartData = Object.values(groupedData).sort((a: any, b: any) => {
        return a.timestamp - b.timestamp
      })

      // Calculate cumulative count
      let cumulativeCount = 0
      const finalChartData = chartData.map((item: any) => {
        cumulativeCount += item.count
        return {
          ...item,
          cumulative: cumulativeCount,
        }
      })

      setChartData(finalChartData)
    }
  }, [data])

  if (!mounted) {
    return <div className="h-[300px] w-full bg-muted/20 animate-pulse rounded-md" />
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#444" : "#eee"} />
        <XAxis
          dataKey="month"
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
        <Area type="monotone" dataKey="count" name="New Customers" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
        <Area
          type="monotone"
          dataKey="cumulative"
          name="Total Customers"
          stroke="#82ca9d"
          fill="#82ca9d"
          fillOpacity={0.3}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
