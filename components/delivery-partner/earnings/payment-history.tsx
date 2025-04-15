"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface PaymentHistoryProps {
  deliveryPartnerId: string
}

interface PayoutRecord {
  id: string
  amount: number
  created_at: string
  status: string
  payment_method: string
  transaction_id: string
  notes: string
}

export function PaymentHistory({ deliveryPartnerId }: PaymentHistoryProps) {
  const [payouts, setPayouts] = useState<PayoutRecord[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchPayoutHistory() {
      try {
        setLoading(true)

        // This is a placeholder - in a real app, you would have a payouts table
        // For now, we'll use the delivery_partner_earnings table with status="paid"
        const { data, error } = await supabase
          .from("delivery_partner_earnings")
          .select("id, amount, created_at, status, paid_at, payout_id")
          .eq("delivery_partner_id", deliveryPartnerId)
          .eq("status", "paid")
          .order("paid_at", { ascending: false })

        if (error) throw error

        // Transform the data to match the PayoutRecord interface
        const transformedData = data.map((item) => ({
          id: item.id,
          amount: item.amount,
          created_at: item.paid_at || item.created_at,
          status: "completed",
          payment_method: "bank_transfer", // Placeholder
          transaction_id: item.payout_id || "N/A",
          notes: "",
        }))

        setPayouts(transformedData)
      } catch (error) {
        console.error("Error fetching payout history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayoutHistory()
  }, [deliveryPartnerId, supabase])

  // Calculate monthly and yearly totals
  const calculateTotals = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    let monthlyTotal = 0
    let yearlyTotal = 0

    payouts.forEach((payout) => {
      const payoutDate = new Date(payout.created_at)

      if (payoutDate.getFullYear() === currentYear) {
        yearlyTotal += payout.amount

        if (payoutDate.getMonth() === currentMonth) {
          monthlyTotal += payout.amount
        }
      }
    })

    return { monthlyTotal, yearlyTotal }
  }

  const { monthlyTotal, yearlyTotal } = calculateTotals()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">This Month</div>
            <div className="text-2xl font-bold mt-2">{formatCurrency(monthlyTotal)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">This Year</div>
            <div className="text-2xl font-bold mt-2">{formatCurrency(yearlyTotal)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    {Array(5)
                      .fill(0)
                      .map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                        </TableCell>
                      ))}
                  </TableRow>
                ))
            ) : payouts.length > 0 ? (
              payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell>{formatDate(payout.created_at)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(payout.amount)}</TableCell>
                  <TableCell>{payout.transaction_id}</TableCell>
                  <TableCell>Bank Transfer</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No payment history found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {payouts.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            You haven't received any payments yet. Completed deliveries with paid status will appear here.
          </p>
        </div>
      )}
    </div>
  )
}
