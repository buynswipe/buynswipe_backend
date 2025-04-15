"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Upload, CheckCircle, X, Loader2 } from "lucide-react"
import Image from "next/image"

interface ProofOfDeliveryProps {
  orderId: string
  onComplete: (data: {
    signature?: string
    photo?: string
    notes: string
    receiverName: string
  }) => void
  onCancel: () => void
}

export function ProofOfDelivery({ orderId, onComplete, onCancel }: ProofOfDeliveryProps) {
  const [step, setStep] = useState<"photo" | "signature" | "details">("photo")
  const [photo, setPhoto] = useState<string | null>(null)
  const [signature, setSignature] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [receiverName, setReceiverName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // In a real implementation, you would upload this to a server
    // For now, we'll just create a data URL
    const reader = new FileReader()
    reader.onload = () => {
      setPhoto(reader.result as string)
      setStep("signature")
    }
    reader.readAsDataURL(file)
  }

  const handleSignatureCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // In a real implementation, you would upload this to a server
    // For now, we'll just create a data URL
    const reader = new FileReader()
    reader.onload = () => {
      setSignature(reader.result as string)
      setStep("details")
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // In a real implementation, you would submit this data to your API
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onComplete({
        photo,
        signature,
        notes,
        receiverName,
      })
    } catch (err) {
      setError("Failed to submit delivery proof. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Proof of Delivery</CardTitle>
        <CardDescription>Order #{orderId.substring(0, 8)}</CardDescription>
      </CardHeader>
      <CardContent>
        {step === "photo" && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="mb-4">
                {photo ? (
                  <div className="relative w-full h-48 mb-2">
                    <Image
                      src={photo || "/placeholder.svg"}
                      alt="Delivery photo"
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-12 flex flex-col items-center justify-center">
                    <Camera className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Take a photo of the delivered items</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
                ref={fileInputRef}
              />
              <Button type="button" onClick={() => fileInputRef.current?.click()} className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                {photo ? "Retake Photo" : "Take Photo"}
              </Button>
              {photo && (
                <Button type="button" onClick={() => setStep("signature")} className="w-full mt-2">
                  Continue
                </Button>
              )}
            </div>
          </div>
        )}

        {step === "signature" && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="mb-4">
                {signature ? (
                  <div className="relative w-full h-48 mb-2">
                    <Image
                      src={signature || "/placeholder.svg"}
                      alt="Signature"
                      fill
                      className="object-contain rounded-md"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-12 flex flex-col items-center justify-center">
                    <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Capture receiver's signature</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleSignatureCapture}
                className="hidden"
                ref={fileInputRef}
              />
              <Button type="button" onClick={() => fileInputRef.current?.click()} className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                {signature ? "Recapture Signature" : "Capture Signature"}
              </Button>
              {signature && (
                <Button type="button" onClick={() => setStep("details")} className="w-full mt-2">
                  Continue
                </Button>
              )}
              <Button type="button" variant="ghost" onClick={() => setStep("photo")} className="w-full mt-2">
                Back
              </Button>
            </div>
          </div>
        )}

        {step === "details" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receiver-name">Receiver's Name</Label>
              <Input
                id="receiver-name"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Delivery Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special notes about the delivery"
                rows={3}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button type="button" variant="ghost" onClick={() => setStep("signature")}>
                Back
              </Button>
              <Button type="submit" disabled={isLoading || !receiverName}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Delivery
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </CardFooter>
    </Card>
  )
}
