"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, Camera, Upload } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface DeliveryProofFormProps {
  orderId: string
  isCod: boolean
}

export function DeliveryProofForm({ orderId, isCod }: DeliveryProofFormProps) {
  const [receiverName, setReceiverName] = useState("")
  const [notes, setNotes] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [signature, setSignature] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0])
    }
  }

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSignature(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!receiverName) {
      toast({
        title: "Error",
        description: "Please enter the receiver's name",
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

      let photoUrl = null
      let signatureUrl = null

      // Upload photo if provided
      if (photo) {
        const photoPath = `delivery_proofs/${orderId}/photo.${photo.name.split(".").pop()}`
        const { error: photoError } = await supabase.storage.from("delivery_proofs").upload(photoPath, photo)

        if (photoError) {
          throw new Error(`Failed to upload photo: ${photoError.message}`)
        }

        const { data: photoData } = supabase.storage.from("delivery_proofs").getPublicUrl(photoPath)

        photoUrl = photoData.publicUrl
      }

      // Upload signature if provided
      if (signature) {
        const signaturePath = `delivery_proofs/${orderId}/signature.${signature.name.split(".").pop()}`
        const { error: signatureError } = await supabase.storage
          .from("delivery_proofs")
          .upload(signaturePath, signature)

        if (signatureError) {
          throw new Error(`Failed to upload signature: ${signatureError.message}`)
        }

        const { data: signatureData } = supabase.storage.from("delivery_proofs").getPublicUrl(signaturePath)

        signatureUrl = signatureData.publicUrl
      }

      // Create delivery proof
      await supabase.from("delivery_proofs").insert({
        order_id: orderId,
        delivery_partner_id: partner.id,
        receiver_name: receiverName,
        photo_url: photoUrl,
        signature_url: signatureUrl,
        notes: notes || null,
      })

      // Update order status to delivered
      await supabase.from("orders").update({ status: "delivered" }).eq("id", orderId)

      // Create status update
      await supabase.from("delivery_status_updates").insert({
        order_id: orderId,
        delivery_partner_id: partner.id,
        status: "delivered",
        notes: "Delivery completed. Proof of delivery collected.",
      })

      toast({
        title: "Delivery completed",
        description: "Proof of delivery has been recorded successfully",
      })

      // Refresh the page
      router.refresh()
    } catch (error: any) {
      console.error("Error submitting delivery proof:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit delivery proof",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card id="delivery-proof">
      <CardHeader>
        <CardTitle>Proof of Delivery</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Receiver's Name *</label>
            <Input
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              placeholder="Enter the name of the person receiving the package"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Photo (optional)</label>
            <div className="flex items-center gap-2">
              <Input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-upload" />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("photo-upload")?.click()}
                className="w-full"
              >
                <Camera className="mr-2 h-4 w-4" />
                {photo ? "Change Photo" : "Take Photo"}
              </Button>
              {photo && (
                <span className="text-sm text-green-600">
                  {photo.name.length > 20 ? `${photo.name.substring(0, 20)}...` : photo.name}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Signature (optional)</label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleSignatureChange}
                className="hidden"
                id="signature-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("signature-upload")?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {signature ? "Change Signature" : "Upload Signature"}
              </Button>
              {signature && (
                <span className="text-sm text-green-600">
                  {signature.name.length > 20 ? `${signature.name.substring(0, 20)}...` : signature.name}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about the delivery"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Mark as Delivered"
            )}
          </Button>

          {isCod && (
            <p className="text-sm text-amber-600 mt-2">
              Note: This is a Cash on Delivery order. After marking as delivered, you'll need to collect payment.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
