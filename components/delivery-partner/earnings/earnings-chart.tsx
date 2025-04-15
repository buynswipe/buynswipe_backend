"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface EarningsChartProps {
  deliveryPartnerId: string
}

interface EarningsData {
  date: string
  amount: number
}

export function EarningsChart({ deliveryPartnerId }: EarningsChartProps) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily")
  const [chartData, setChartData] = useState<EarningsData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchChartData() {
      try {
        setLoading(true)
        setError(null)

        // Get earnings data
        const { data: earningsData, error } = await supabase
          .from("delivery_partner_earnings")
          .select("amount, created_at")
          .eq("delivery_partner_id", deliveryPartnerId)
          .order("created_at", { ascending: true })

        if (error) {
          console.error("Error fetching earnings data:", error)

          // Check if the error is because the table doesn't exist
          if (error.message.includes("does not exist")) {
            setTableExists(false)
            return
          }

          setError("Could not load earnings data")
          return
        }

        // Process data based on selected period
        const processedData = processEarningsData(earningsData || [], period)
        setChartData(processedData)
      } catch (error) {
        console.error("Error fetching earnings chart data:", error)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [deliveryPartnerId, period, supabase])

  // Process earnings data based on selected period
  function processEarningsData(data: any[], period: string) {
    if (!data || data.length === 0) return []

    const groupedData: Record<string, number> = {}

    data.forEach((item) => {
      const date = new Date(item.created_at)
      let key = ""

      if (period === "daily") {
        key = date.toISOString().split("T")[0] // YYYY-MM-DD
      } else if (period === "weekly") {
        // Get the week number
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
        const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
        key = `Week ${weekNumber}, ${date.getFullYear()}`
      } else if (period === "monthly") {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      }

      if (!groupedData[key]) {
        groupedData[key] = 0
      }

      groupedData[key] += item.amount
    })

    // Convert to array format for chart
    return Object.entries(groupedData).map(([date, amount]) => ({
      date,
      amount,
    }))
  }

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded p-2 shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-sm">{`Earnings: ${formatCurrency(payload[0].value)}`}</p>
        </div>
      )
    }

    return null
  }

  if (!tableExists) {
    return null // Don't show anything if the table doesn't exist
  }

  if (loading) {
    return <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded"></div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs value={period} onValueChange={(value) => setPeriod(value as any)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="h-[300px] w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `₹${value}`} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <p className="text-muted-foreground">No earnings data available</p>
          </div>
        )}
      </div>
    </div>
  )
}
