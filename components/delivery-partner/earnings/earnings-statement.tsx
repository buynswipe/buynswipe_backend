"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Download, Printer } from "lucide-react"

interface EarningsStatementProps {
  deliveryPartnerId: string
  month: number
  year: number
  partnerName: string
}

export function EarningsStatement({ deliveryPartnerId, month, year, partnerName }: EarningsStatementProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [statement, setStatement] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const generateStatement = async () => {
    try {
      setLoading(true)

      // Get start and end date for the month
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0)

      // Fetch earnings for the month
      const { data: earnings, error } = await supabase
        .from("delivery_partner_earnings")
        .select(`
          id,
          amount,
          status,
          created_at,
          paid_at,
          order:orders(
            id,
            total_amount,
            retailer:profiles!retailer_id(business_name)
          )
        `)
        .eq("delivery_partner_id", deliveryPartnerId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: true })

      if (error) throw error

      // Calculate totals
      const totalEarned = earnings.reduce((sum, e) => sum + e.amount, 0)
      const totalPaid = earnings.filter((e) => e.status === "paid").reduce((sum, e) => sum + e.amount, 0)

      const totalPending = earnings.filter((e) => e.status === "pending").reduce((sum, e) => sum + e.amount, 0)

      // Generate statement data
      const statementData = {
        partnerName,
        period: `${new Date(year, month).toLocaleString("default", { month: "long" })} ${year}`,
        generatedDate: new Date().toISOString(),
        totalEarned,
        totalPaid,
        totalPending,
        earnings,
      }

      setStatement(statementData)
      setIsOpen(true)
    } catch (error) {
      console.error("Error generating statement:", error)
    } finally {
      setLoading(false)
    }
  }

  const printStatement = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const monthName = new Date(year, month).toLocaleString("default", { month: "long" })

    printWindow.document.write(`
      <html>
        <head>
          <title>Earnings Statement - ${monthName} ${year}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 20px;
            }
            .summary {
              margin-bottom: 30px;
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 5px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Earnings Statement</h1>
              <p>Delivery Partner: ${statement.partnerName}</p>
              <p>Period: ${statement.period}</p>
              <p>Generated: ${new Date(statement.generatedDate).toLocaleString()}</p>
            </div>
            
            <div class="summary">
              <h2>Summary</h2>
              <div class="summary-row">
                <span>Total Earned:</span>
                <span>${formatCurrency(statement.totalEarned)}</span>
              </div>
              <div class="summary-row">
                <span>Total Paid:</span>
                <span>${formatCurrency(statement.totalPaid)}</span>
              </div>
              <div class="summary-row">
                <span>Pending Payment:</span>
                <span>${formatCurrency(statement.totalPending)}</span>
              </div>
            </div>
            
            <h2>Earnings Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Order ID</th>
                  <th>Retailer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${statement.earnings
                  .map(
                    (earning) => `
                  <tr>
                    <td>${formatDate(earning.created_at)}</td>
                    <td>${earning.order.id.substring(0, 8)}...</td>
                    <td>${earning.order.retailer.business_name}</td>
                    <td>${formatCurrency(earning.amount)}</td>
                    <td>${earning.status.charAt(0).toUpperCase() + earning.status.slice(1)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
            
            <div class="footer">
              <p>This is an automatically generated statement. For any queries, please contact support.</p>
            </div>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  return (
    <>
      <Button variant="outline" onClick={generateStatement} disabled={loading}>
        {loading ? "Generating..." : "Generate Statement"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Earnings Statement</DialogTitle>
            <DialogDescription>
              {statement?.period} - Generated on {statement && formatDate(statement.generatedDate)}
            </DialogDescription>
          </DialogHeader>

          {statement && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Earned:</span>
                      <span className="font-medium">{formatCurrency(statement.totalEarned)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Paid:</span>
                      <span className="font-medium">{formatCurrency(statement.totalPaid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Payment:</span>
                      <span className="font-medium">{formatCurrency(statement.totalPending)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Earnings Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Retailer
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {statement.earnings.map((earning: any) => (
                          <tr key={earning.id}>
                            <td className="px-4 py-2 text-sm">{formatDate(earning.created_at)}</td>
                            <td className="px-4 py-2 text-sm">{earning.order.id.substring(0, 8)}...</td>
                            <td className="px-4 py-2 text-sm">{earning.order.retailer.business_name}</td>
                            <td className="px-4 py-2 text-sm">{formatCurrency(earning.amount)}</td>
                            <td className="px-4 py-2 text-sm">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  earning.status === "paid"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {earning.status.charAt(0).toUpperCase() + earning.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={printStatement}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
