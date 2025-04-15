"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, BarChart, LineChart, PieChart, DollarSign, Package, Truck, Clock } from "lucide-react"
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"

export default function AnalyticsDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState("7days")
  const [orderStats, setOrderStats] = useState<any>({})
  const [deliveryStats, setDeliveryStats] = useState<any>({})
  const [paymentStats, setPaymentStats] = useState<any>({})
  const [chartData, setChartData] = useState<any>({})

  const supabase = createClientComponentClient()

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) return

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()

        if (profileError) throw profileError

        setUserRole(profile.role)
      } catch (error: any) {
        console.error("Error fetching user role:", error)
        setError(error.message)
      }
    }

    fetchUserRole()
  }, [supabase])

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!userRole) return

      try {
        setIsLoading(true)
        setError(null)

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) return

        // Calculate date range
        let startDate: Date
        let endDate = new Date()

        switch (timeRange) {
          case "7days":
            startDate = subDays(endDate, 7)
            break
          case "30days":
            startDate = subDays(endDate, 30)
            break
          case "month":
            startDate = startOfMonth(endDate)
            endDate = endOfMonth(endDate)
            break
          default:
            startDate = subDays(endDate, 7)
        }

        const formattedStartDate = format(startDate, "yyyy-MM-dd")
        const formattedEndDate = format(endDate, "yyyy-MM-dd")

        // Fetch order statistics
        let orderQuery = supabase
          .from("orders")
          .select("id, status, payment_status, payment_method, total_amount, created_at")
          .gte("created_at", formattedStartDate)
          .lte("created_at", formattedEndDate)

        // Filter by user role
        if (userRole === "retailer") {
          orderQuery = orderQuery.eq("retailer_id", session.user.id)
        } else if (userRole === "wholesaler") {
          orderQuery = orderQuery.eq("wholesaler_id", session.user.id)
        } else if (userRole === "delivery_partner") {
          // First get the delivery partner id
          const { data: partner } = await supabase
            .from("delivery_partners")
            .select("id")
            .eq("user_id", session.user.id)
            .single()

          if (partner) {
            orderQuery = orderQuery.eq("delivery_partner_id", partner.id)
          }
        }

        const { data: orders, error: ordersError } = await orderQuery

        if (ordersError) throw ordersError

        // Calculate order statistics
        const totalOrders = orders?.length || 0
        const totalAmount = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
        const placedOrders = orders?.filter((order) => order.status === "placed").length || 0
        const confirmedOrders = orders?.filter((order) => order.status === "confirmed").length || 0
        const dispatchedOrders = orders?.filter((order) => order.status === "dispatched").length || 0
        const deliveredOrders = orders?.filter((order) => order.status === "delivered").length || 0
        const rejectedOrders = orders?.filter((order) => order.status === "rejected").length || 0

        setOrderStats({
          totalOrders,
          totalAmount,
          placedOrders,
          confirmedOrders,
          dispatchedOrders,
          deliveredOrders,
          rejectedOrders,
        })

        // Calculate payment statistics
        const paidOrders = orders?.filter((order) => order.payment_status === "paid").length || 0
        const pendingPayments = orders?.filter((order) => order.payment_status === "pending").length || 0
        const codOrders = orders?.filter((order) => order.payment_method === "cod").length || 0
        const upiOrders = orders?.filter((order) => order.payment_method === "upi").length || 0
        const paidAmount =
          orders
            ?.filter((order) => order.payment_status === "paid")
            .reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
        const pendingAmount =
          orders
            ?.filter((order) => order.payment_status === "pending")
            .reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

        setPaymentStats({
          paidOrders,
          pendingPayments,
          codOrders,
          upiOrders,
          paidAmount,
          pendingAmount,
        })

        // Calculate delivery statistics
        if (userRole === "delivery_partner" || userRole === "wholesaler" || userRole === "admin") {
          const deliveredOnTime =
            orders?.filter(
              (order) =>
                order.status === "delivered" &&
                order.estimated_delivery &&
                new Date(order.created_at) <= new Date(order.estimated_delivery),
            ).length || 0

          const deliveredLate =
            orders?.filter(
              (order) =>
                order.status === "delivered" &&
                order.estimated_delivery &&
                new Date(order.created_at) > new Date(order.estimated_delivery),
            ).length || 0

          const avgDeliveryTime =
            deliveredOrders > 0
              ? orders
                  ?.filter((order) => order.status === "delivered")
                  .reduce((sum, order) => {
                    const createdDate = new Date(order.created_at)
                    const updatedDate = new Date(order.updated_at || order.created_at)
                    return sum + (updatedDate.getTime() - createdDate.getTime())
                  }, 0) /
                deliveredOrders /
                (1000 * 60 * 60) // Convert to hours
              : 0

          setDeliveryStats({
            deliveredOnTime,
            deliveredLate,
            avgDeliveryTime: avgDeliveryTime.toFixed(1),
            onTimeRate: deliveredOrders > 0 ? ((deliveredOnTime / deliveredOrders) * 100).toFixed(0) : 0,
          })
        }

        // Prepare chart data
        const dateRange = eachDayOfInterval({ start: startDate, end: endDate })

        const ordersByDate = dateRange.map((date) => {
          const formattedDate = format(date, "yyyy-MM-dd")
          const dayOrders = orders?.filter((order) => order.created_at.startsWith(formattedDate)) || []

          return {
            date: format(date, "MMM dd"),
            orders: dayOrders.length,
            amount: dayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
            delivered: dayOrders.filter((order) => order.status === "delivered").length,
          }
        })

        setChartData({
          ordersByDate,
        })
      } catch (error: any) {
        console.error("Error fetching analytics data:", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    if (userRole) {
      fetchAnalyticsData()
    }
  }, [supabase, userRole, timeRange])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-500 rounded-md">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track your performance and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => window.print()}>
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              {orderStats.deliveredOrders || 0} delivered (
              {Math.round(((orderStats.deliveredOrders || 0) / (orderStats.totalOrders || 1)) * 100)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{orderStats.totalAmount?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">
              ₹{paymentStats.paidAmount?.toFixed(2) || "0.00"} received (
              {Math.round(((paymentStats.paidAmount || 0) / (orderStats.totalAmount || 1)) * 100)}%)
            </p>
          </CardContent>
        </Card>

        {(userRole === "delivery_partner" || userRole === "wholesaler" || userRole === "admin") && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveryStats.onTimeRate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Avg. {deliveryStats.avgDeliveryTime || 0} hours delivery time
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentStats.paidOrders || 0} Paid</div>
            <p className="text-xs text-muted-foreground">{paymentStats.pendingPayments || 0} pending payments</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          {(userRole === "delivery_partner" || userRole === "wholesaler" || userRole === "admin") && (
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Trends</CardTitle>
              <CardDescription>Number of orders over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {/* Chart would go here - using a placeholder */}
              <div className="h-full flex items-center justify-center border rounded-md">
                <BarChart className="h-8 w-8 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Order chart visualization</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Placed</span>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{orderStats.placedOrders || 0}</span>
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${Math.round(((orderStats.placedOrders || 0) / (orderStats.totalOrders || 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Confirmed</span>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{orderStats.confirmedOrders || 0}</span>
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${Math.round(((orderStats.confirmedOrders || 0) / (orderStats.totalOrders || 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Dispatched</span>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{orderStats.dispatchedOrders || 0}</span>
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{
                            width: `${Math.round(((orderStats.dispatchedOrders || 0) / (orderStats.totalOrders || 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Delivered</span>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{orderStats.deliveredOrders || 0}</span>
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${Math.round(((orderStats.deliveredOrders || 0) / (orderStats.totalOrders || 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Rejected</span>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{orderStats.rejectedOrders || 0}</span>
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{
                            width: `${Math.round(((orderStats.rejectedOrders || 0) / (orderStats.totalOrders || 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Cash on Delivery</span>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{paymentStats.codOrders || 0}</span>
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{
                            width: `${Math.round(((paymentStats.codOrders || 0) / (orderStats.totalOrders || 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>UPI Payment</span>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{paymentStats.upiOrders || 0}</span>
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${Math.round(((paymentStats.upiOrders || 0) / (orderStats.totalOrders || 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Paid</span>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{paymentStats.paidOrders || 0}</span>
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${Math.round(((paymentStats.paidOrders || 0) / (orderStats.totalOrders || 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pending</span>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{paymentStats.pendingPayments || 0}</span>
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500 rounded-full"
                          style={{
                            width: `${Math.round(((paymentStats.pendingPayments || 0) / (orderStats.totalOrders || 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Revenue over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {/* Chart would go here - using a placeholder */}
              <div className="h-full flex items-center justify-center border rounded-md">
                <LineChart className="h-8 w-8 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Revenue chart visualization</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Received</span>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">₹{paymentStats.paidAmount?.toFixed(2) || "0.00"}</span>
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${Math.round(((paymentStats.paidAmount || 0) / (orderStats.totalAmount || 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pending</span>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">₹{paymentStats.pendingAmount?.toFixed(2) || "0.00"}</span>
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500 rounded-full"
                          style={{
                            width: `${Math.round(((paymentStats.pendingAmount || 0) / (orderStats.totalAmount || 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Cash on Delivery</span>
                    <span className="font-medium">
                      ₹{(orderStats.totalAmount * (paymentStats.codOrders / orderStats.totalOrders || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>UPI Payment</span>
                    <span className="font-medium">
                      ₹{(orderStats.totalAmount * (paymentStats.upiOrders / orderStats.totalOrders || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {(userRole === "delivery_partner" || userRole === "wholesaler" || userRole === "admin") && (
          <TabsContent value="delivery" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
                <CardDescription>Delivery metrics and statistics</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {/* Chart would go here - using a placeholder */}
                <div className="h-full flex items-center justify-center border rounded-md">
                  <Truck className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Delivery performance visualization</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Timeliness</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>On-Time Deliveries</span>
                      <div className="flex items-center">
                        <span className="font-medium mr-2">{deliveryStats.deliveredOnTime || 0}</span>
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${deliveryStats.onTimeRate || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Late Deliveries</span>
                      <div className="flex items-center">
                        <span className="font-medium mr-2">{deliveryStats.deliveredLate || 0}</span>
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${100 - (deliveryStats.onTimeRate || 0)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delivery Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Average Delivery Time</span>
                      <span className="font-medium">{deliveryStats.avgDeliveryTime || 0} hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Delivered Orders</span>
                      <span className="font-medium">{orderStats.deliveredOrders || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
