"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, CreditCard } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface CodCollectionFormProps {
  orderId: string
  amount: number
}

export function CodCollectionForm({ orderId, amount }: CodCollectionFormProps) {
  const [collectedAmount, setCollectedAmount] = useState(amount.toString())
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!collectedAmount || Number.parseFloat(collectedAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Get user session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("Not authenticated")
      }

      // Get delivery partner info
      const { data: partner } = await supabase
        .from("delivery_partners")
        .select("id")
        .eq("user_id", session.user.id)
        .single()

      if (!partner) {
        throw new Error("Delivery partner not found")
      }

      // Update order payment status
      await supabase.from("orders").update({ payment_status: "paid" }).eq("id", orderId)

      // Create transaction record
      await supabase.from("transactions").insert({
        order_id: orderId,
        amount: Number.parseFloat(collectedAmount),
        payment_method: "cod",
        status: "completed",
        transaction_fee: 0,
        notes: `COD payment collected by delivery partner ${partner.id}. ${notes}`,
      })

      toast({
        title: "Payment collected",
        description: "Cash on delivery payment has been recorded successfully",
      })

      // Refresh the page
      router.refresh()
    } catch (error: any) {
      console.error("Error recording COD payment:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to record payment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card id="cod-collection">
      <CardHeader>
        <CardTitle>Collect Cash on Delivery</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount Collected (₹) *</label>
            <Input
              type="number"
              value={collectedAmount}
              onChange={(e) => setCollectedAmount(e.target.value)}
              placeholder="Enter the amount collected"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about the payment"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Confirm Payment Collection
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
