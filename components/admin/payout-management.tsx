"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { Search } from "lucide-react"

interface DeliveryPartner {
  id: string
  name: string
  phone: string
  email: string | null
  pending_payout: number | null
}

interface EarningRecord {
  id: string
  order_id: string
  amount: number
  created_at: string
  status: string
  checked?: boolean
}

export function PayoutManagement() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([])
  const [selectedPartner, setSelectedPartner] = useState<DeliveryPartner | null>(null)
  const [pendingEarnings, setPendingEarnings] = useState<EarningRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState(0)
  const [payoutNotes, setPayoutNotes] = useState("")
  const [payoutId, setPayoutId] = useState("")
  const [loading, setLoading] = useState(true)
  const [processingPayout, setProcessingPayout] = useState(false)

  const supabase = createClientComponentClient()

  // Fetch delivery partners with pending payouts
  useEffect(() => {
    async function fetchDeliveryPartners() {
      try {
        setLoading(true)

        const { data, error } = await supabase
          .from("delivery_partners")
          .select("id, name, phone, email, pending_payout")
          .order("name")

        if (error) throw error

        setPartners(data || [])
      } catch (error) {
        console.error("Error fetching delivery partners:", error)
        toast({
          title: "Error",
          description: "Failed to load delivery partners",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDeliveryPartners()
  }, [supabase])

  // Fetch pending earnings for selected partner
  useEffect(() => {
    if (!selectedPartner) return

    async function fetchPendingEarnings() {
      try {
        setLoading(true)

        const { data, error } = await supabase
          .from("delivery_partner_earnings")
          .select("id, order_id, amount, created_at, status")
          .eq("delivery_partner_id", selectedPartner.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false })

        if (error) throw error

        // Add checked property to each record
        const earningsWithCheckbox = data.map((earning) => ({
          ...earning,
          checked: true,
        }))

        setPendingEarnings(earningsWithCheckbox)

        // Calculate total amount
        const total = earningsWithCheckbox.reduce((sum, item) => sum + item.amount, 0)
        setPayoutAmount(total)
      } catch (error) {
        console.error("Error fetching pending earnings:", error)
        toast({
          title: "Error",
          description: "Failed to load pending earnings",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPendingEarnings()
  }, [selectedPartner, supabase])

  // Filter partners based on search term
  const filteredPartners = partners.filter((partner) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      partner.name.toLowerCase().includes(searchLower) ||
      partner.phone.includes(searchTerm) ||
      (partner.email && partner.email.toLowerCase().includes(searchLower))
    )
  })

  // Handle checkbox change
  const handleCheckboxChange = (id: string, checked: boolean) => {
    setPendingEarnings((prev) => prev.map((earning) => (earning.id === id ? { ...earning, checked } : earning)))

    // Recalculate total amount
    const total = pendingEarnings
      .map((earning) => (earning.id === id ? { ...earning, checked } : earning))
      .filter((earning) => earning.checked)
      .reduce((sum, item) => sum + item.amount, 0)

    setPayoutAmount(total)
  }

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    setPendingEarnings((prev) => prev.map((earning) => ({ ...earning, checked })))

    // Recalculate total amount
    const total = checked ? pendingEarnings.reduce((sum, item) => sum + item.amount, 0) : 0

    setPayoutAmount(total)
  }

  // Process payout
  const processPayout = async () => {
    if (!selectedPartner) return

    try {
      setProcessingPayout(true)

      // Get selected earnings IDs
      const selectedEarningIds = pendingEarnings.filter((earning) => earning.checked).map((earning) => earning.id)

      if (selectedEarningIds.length === 0) {
        toast({
          title: "No earnings selected",
          description: "Please select at least one earning record to process",
          variant: "destructive",
        })
        return
      }

      // Update earnings status to paid
      const { error } = await supabase
        .from("delivery_partner_earnings")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          payout_id: payoutId,
          notes: payoutNotes,
        })
        .in("id", selectedEarningIds)

      if (error) throw error

      // Update delivery partner's pending payout
      const newPendingPayout = (selectedPartner.pending_payout || 0) - payoutAmount

      await supabase
        .from("delivery_partners")
        .update({
          pending_payout: newPendingPayout >= 0 ? newPendingPayout : 0,
          last_payout_date: new Date().toISOString(),
        })
        .eq("id", selectedPartner.id)

      toast({
        title: "Payout processed",
        description: `Successfully processed payout of ${formatCurrency(payoutAmount)} to ${selectedPartner.name}`,
      })

      // Reset state
      setIsPayoutDialogOpen(false)
      setPayoutNotes("")
      setPayoutId("")

      // Refresh pending earnings
      const { data: updatedEarnings } = await supabase
        .from("delivery_partner_earnings")
        .select("id, order_id, amount, created_at, status")
        .eq("delivery_partner_id", selectedPartner.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      // Add checked property to each record
      const earningsWithCheckbox = (updatedEarnings || []).map((earning) => ({
        ...earning,
        checked: true,
      }))

      setPendingEarnings(earningsWithCheckbox)

      // Update partners list
      const { data: updatedPartners } = await supabase
        .from("delivery_partners")
        .select("id, name, phone, email, pending_payout")
        .order("name")

      setPartners(updatedPartners || [])

      // Update selected partner
      if (updatedPartners) {
        const updated = updatedPartners.find((p) => p.id === selectedPartner.id)
        if (updated) {
          setSelectedPartner(updated)
        }
      }
    } catch (error) {
      console.error("Error processing payout:", error)
      toast({
        title: "Error",
        description: "Failed to process payout",
        variant: "destructive",
      })
    } finally {
      setProcessingPayout(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="partners">
        <TabsList>
          <TabsTrigger value="partners">Delivery Partners</TabsTrigger>
          <TabsTrigger value="history">Payout History</TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Partners</CardTitle>
              <CardDescription>Select a delivery partner to process payouts</CardDescription>
              <div className="relative w-full sm:w-64 mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search partners..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Pending Payout</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <TableRow key={i}>
                            {Array(4)
                              .fill(0)
                              .map((_, j) => (
                                <TableCell key={j}>
                                  <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                                </TableCell>
                              ))}
                          </TableRow>
                        ))
                    ) : filteredPartners.length > 0 ? (
                      filteredPartners.map((partner) => (
                        <TableRow key={partner.id} className={selectedPartner?.id === partner.id ? "bg-muted/50" : ""}>
                          <TableCell className="font-medium">{partner.name}</TableCell>
                          <TableCell>
                            <div>{partner.phone}</div>
                            {partner.email && <div className="text-sm text-muted-foreground">{partner.email}</div>}
                          </TableCell>
                          <TableCell>
                            {partner.pending_payout ? (
                              <Badge variant={partner.pending_payout > 0 ? "default" : "outline"}>
                                {formatCurrency(partner.pending_payout)}
                              </Badge>
                            ) : (
                              <Badge variant="outline">₹0</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPartner(partner)}
                              disabled={!partner.pending_payout || partner.pending_payout <= 0}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No delivery partners found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {selectedPartner && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Earnings for {selectedPartner.name}</CardTitle>
                <CardDescription>Select earnings to include in the payout</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingEarnings.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <Checkbox
                              checked={pendingEarnings.every((e) => e.checked)}
                              onCheckedChange={(checked) => handleSelectAll(!!checked)}
                            />
                          </TableHead>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingEarnings.map((earning) => (
                          <TableRow key={earning.id}>
                            <TableCell>
                              <Checkbox
                                checked={earning.checked}
                                onCheckedChange={(checked) => handleCheckboxChange(earning.id, !!checked)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{earning.order_id.substring(0, 8)}...</TableCell>
                            <TableCell>{new Date(earning.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>{formatCurrency(earning.amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No pending earnings found</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">Total Selected: {formatCurrency(payoutAmount)}</p>
                </div>
                <Button
                  onClick={() => setIsPayoutDialogOpen(true)}
                  disabled={pendingEarnings.length === 0 || !pendingEarnings.some((e) => e.checked)}
                >
                  Process Payout
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <PayoutHistory />
        </TabsContent>
      </Tabs>

      <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payout</DialogTitle>
            <DialogDescription>Enter the payout details to complete the transaction.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="partner">Delivery Partner</Label>
              <Input id="partner" value={selectedPartner?.name || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Payout Amount</Label>
              <Input id="amount" value={formatCurrency(payoutAmount)} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payoutId">Transaction ID / Reference</Label>
              <Input
                id="payoutId"
                placeholder="Enter transaction reference"
                value={payoutId}
                onChange={(e) => setPayoutId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this payout"
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPayoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={processPayout} disabled={processingPayout || !payoutId}>
              {processingPayout ? "Processing..." : "Confirm Payout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Payout History Component
function PayoutHistory() {
  const [payouts, setPayouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchPayoutHistory() {
      try {
        setLoading(true)

        const { data, error } = await supabase
          .from("delivery_partner_earnings")
          .select(`
            id, 
            amount, 
            paid_at, 
            payout_id, 
            notes,
            delivery_partner:delivery_partners(id, name, phone)
          `)
          .eq("status", "paid")
          .order("paid_at", { ascending: false })

        if (error) throw error

        setPayouts(data || [])
      } catch (error) {
        console.error("Error fetching payout history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayoutHistory()
  }, [supabase])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout History</CardTitle>
        <CardDescription>View all processed payouts to delivery partners</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Delivery Partner</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Notes</TableHead>
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
                    <TableCell>{new Date(payout.paid_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">
                      {payout.delivery_partner?.name || "Unknown"}
                      <div className="text-sm text-muted-foreground">{payout.delivery_partner?.phone || ""}</div>
                    </TableCell>
                    <TableCell>{formatCurrency(payout.amount)}</TableCell>
                    <TableCell>{payout.payout_id || "N/A"}</TableCell>
                    <TableCell>{payout.notes || "N/A"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No payout history found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
