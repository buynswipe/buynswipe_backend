"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ChevronDown, Search, Filter, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface EarningsTableProps {
  deliveryPartnerId: string
}

interface EarningRecord {
  id: string
  order_id: string
  amount: number
  status: "pending" | "paid" | "cancelled"
  created_at: string
  order: {
    id: string
    retailer_id: string
    wholesaler_id: string
    retailer: {
      business_name: string
    }
    wholesaler: {
      business_name: string
    }
  }
}

export function EarningsTable({ deliveryPartnerId }: EarningsTableProps) {
  const [earnings, setEarnings] = useState<EarningRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchEarnings() {
      try {
        setLoading(true)
        setError(null)

        let query = supabase
          .from("delivery_partner_earnings")
          .select(`
            id,
            order_id,
            amount,
            status,
            created_at,
            order:orders(
              id,
              retailer_id,
              wholesaler_id,
              retailer:profiles!retailer_id(business_name),
              wholesaler:profiles!wholesaler_id(business_name)
            )
          `)
          .eq("delivery_partner_id", deliveryPartnerId)
          .order("created_at", { ascending: false })

        if (statusFilter) {
          query = query.eq("status", statusFilter)
        }

        const { data, error } = await query

        if (error) {
          console.error("Error fetching earnings:", error)

          // Check if the error is because the table doesn't exist
          if (error.message.includes("does not exist")) {
            setTableExists(false)
            return
          }

          setError("Could not load earnings data")
          return
        }

        setEarnings(data as EarningRecord[])
      } catch (error) {
        console.error("Error fetching earnings:", error)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchEarnings()
  }, [deliveryPartnerId, statusFilter, supabase])

  // Filter earnings based on search term
  const filteredEarnings = earnings.filter((earning) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      earning.order_id.toLowerCase().includes(searchLower) ||
      earning.order?.retailer?.business_name?.toLowerCase().includes(searchLower) ||
      earning.order?.wholesaler?.business_name?.toLowerCase().includes(searchLower)
    )
  })

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!tableExists) {
    return null // Don't show anything if the table doesn't exist
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
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              {statusFilter ? `Status: ${statusFilter}` : "Filter by Status"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter(null)}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("paid")}>Paid</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>Cancelled</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Retailer</TableHead>
              <TableHead>Wholesaler</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    {Array(6)
                      .fill(0)
                      .map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                        </TableCell>
                      ))}
                  </TableRow>
                ))
            ) : filteredEarnings.length > 0 ? (
              filteredEarnings.map((earning) => (
                <TableRow key={earning.id}>
                  <TableCell>{formatDate(earning.created_at)}</TableCell>
                  <TableCell className="font-medium">{earning.order_id}</TableCell>
                  <TableCell>{earning.order?.retailer?.business_name || "N/A"}</TableCell>
                  <TableCell>{earning.order?.wholesaler?.business_name || "N/A"}</TableCell>
                  <TableCell>{formatCurrency(earning.amount)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(earning.status)}>
                      {earning.status.charAt(0).toUpperCase() + earning.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No earnings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
