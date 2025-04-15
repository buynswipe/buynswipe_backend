"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EarningsStatement } from "./earnings-statement"
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface MonthlyReportProps {
  deliveryPartnerId: string
  partnerName: string
}

interface MonthlyData {
  month: string
  earned: number
  paid: number
  pending: number
}

export function MonthlyReport({ deliveryPartnerId, partnerName }: MonthlyReportProps) {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const supabase = createClientComponentClient()

  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i)

  const months = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ]

  useEffect(() => {
    async function fetchMonthlyData() {
      try {
        setLoading(true)

        // Get start and end date for the year
        const startDate = new Date(selectedYear, 0, 1)
        const endDate = new Date(selectedYear, 11, 31)

        // Fetch earnings for the year
        const { data: earnings, error } = await supabase
          .from("delivery_partner_earnings")
          .select("amount, status, created_at")
          .eq("delivery_partner_id", deliveryPartnerId)
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString())

        if (error) throw error

        // Group by month
        const monthlyStats: Record<number, { earned: number; paid: number; pending: number }> = {}

        // Initialize all months
        for (let i = 0; i < 12; i++) {
          monthlyStats[i] = { earned: 0, paid: 0, pending: 0 }
        }

        // Aggregate data
        earnings.forEach((earning) => {
          const date = new Date(earning.created_at)
          const month = date.getMonth()

          monthlyStats[month].earned += earning.amount

          if (earning.status === "paid") {
            monthlyStats[month].paid += earning.amount
          } else if (earning.status === "pending") {
            monthlyStats[month].pending += earning.amount
          }
        })

        // Convert to array format for chart
        const formattedData = Object.entries(monthlyStats).map(([month, data]) => ({
          month: months[Number.parseInt(month)].label,
          earned: data.earned,
          paid: data.paid,
          pending: data.pending,
        }))

        setMonthlyData(formattedData)
      } catch (error) {
        console.error("Error fetching monthly data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMonthlyData()
  }, [deliveryPartnerId, selectedYear, supabase])

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded p-2 shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-blue-600">{`Earned: ${formatCurrency(payload[0].value)}`}</p>
          <p className="text-sm text-green-600">{`Paid: ${formatCurrency(payload[1].value)}`}</p>
          <p className="text-sm text-yellow-600">{`Pending: ${formatCurrency(payload[2].value)}`}</p>
        </div>
      )
    }

    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Earnings Report</CardTitle>
        <CardDescription>View your earnings breakdown by month</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/2">
            <label className="text-sm font-medium mb-1 block">Year</label>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number.parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-1/2">
            <label className="text-sm font-medium mb-1 block">Month</label>
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="h-[300px] w-full">
          {loading ? (
            <div className="h-full w-full bg-gray-100 animate-pulse rounded"></div>
          ) : monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${value}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="earned" name="Earned" fill="#3b82f6" />
                <Bar dataKey="paid" name="Paid" fill="#22c55e" />
                <Bar dataKey="pending" name="Pending" fill="#eab308" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <p className="text-muted-foreground">No earnings data available</p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <EarningsStatement
            deliveryPartnerId={deliveryPartnerId}
            month={selectedMonth}
            year={selectedYear}
            partnerName={partnerName}
          />
        </div>
      </CardContent>
    </Card>
  )
}
