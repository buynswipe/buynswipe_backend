"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, CameraOff, Keyboard, X } from "lucide-react"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"

interface BarcodeScannerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBarcodeScanned: (product: any) => void
}

export function BarcodeScanner({ open, onOpenChange, onBarcodeScanned }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [manualEntry, setManualEntry] = useState(false)
  const [barcodeInput, setBarcodeInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isMobile = useIsMobile()

  const startScanning = async () => {
    try {
      setError(null)
      const constraints = {
        video: {
          facingMode: isMobile ? "environment" : "user", // Use back camera on mobile
          width: { ideal: isMobile ? 1280 : 640 },
          height: { ideal: isMobile ? 720 : 480 },
        },
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      setIsScanning(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }

      toast.success("Camera started - Point at barcode")
    } catch (error: any) {
      console.error("Camera error:", error)
      setError("Failed to access camera. Please check permissions.")
      toast.error("Failed to access camera")
    }
  }

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsScanning(false)
  }

  const handleBarcodeDetected = async (barcode: string) => {
    try {
      const response = await fetch(`/api/products?barcode=${barcode}`)

      if (response.ok) {
        const product = await response.json()
        onBarcodeScanned(product)
        toast.success(`Product found: ${product.name}`)
        onOpenChange(false)
      } else {
        toast.error("Product not found")
      }
    } catch (error) {
      toast.error("Failed to lookup product")
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (barcodeInput.trim()) {
      handleBarcodeDetected(barcodeInput.trim())
      setBarcodeInput("")
    }
  }

  const handleClose = () => {
    stopScanning()
    setManualEntry(false)
    setBarcodeInput("")
    setError(null)
    onOpenChange(false)
  }

  useEffect(() => {
    if (open && !manualEntry) {
      startScanning()
    }

    return () => {
      stopScanning()
    }
  }, [open, manualEntry])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`${isMobile ? "w-[95vw] h-[90vh] max-w-none" : "max-w-2xl"} p-0`}>
        <div className="flex flex-col h-full">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <span>Barcode Scanner</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 p-4 space-y-4">
            {/* Toggle Buttons */}
            <div className="flex space-x-2">
              <Button
                variant={!manualEntry ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setManualEntry(false)
                  if (!isScanning) startScanning()
                }}
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
              <Button
                variant={manualEntry ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setManualEntry(true)
                  stopScanning()
                }}
                className="flex-1"
              >
                <Keyboard className="h-4 w-4 mr-2" />
                Manual
              </Button>
            </div>

            {/* Camera View */}
            {!manualEntry && (
              <Card className="flex-1">
                <CardContent className="p-0 relative">
                  {error ? (
                    <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <CameraOff className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-sm text-gray-600">{error}</p>
                        <Button variant="outline" size="sm" onClick={startScanning} className="mt-2">
                          Try Again
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full ${isMobile ? "h-64" : "h-80"} bg-black rounded-lg object-cover`}
                      />

                      {/* Scanning Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="border-2 border-red-500 w-64 h-32 rounded-lg">
                          <div className="w-full h-full border-2 border-dashed border-red-300 rounded-lg flex items-center justify-center">
                            <span className="text-white bg-black bg-opacity-50 px-3 py-1 rounded text-sm font-medium">
                              Position barcode here
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mobile-specific scanning guide */}
                      {isMobile && (
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-black bg-opacity-70 text-white p-3 rounded-lg text-center">
                            <p className="text-sm">Hold steady and ensure good lighting</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Manual Entry */}
            {manualEntry && (
              <Card>
                <CardContent className="p-4">
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="barcode-input">Enter Barcode</Label>
                      <Input
                        id="barcode-input"
                        value={barcodeInput}
                        onChange={(e) => setBarcodeInput(e.target.value)}
                        placeholder="Type or paste barcode here"
                        className={isMobile ? "text-base" : ""}
                        autoFocus
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={!barcodeInput.trim()}>
                      Search Product
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {!manualEntry && (
                <Button
                  variant={isScanning ? "destructive" : "default"}
                  onClick={isScanning ? stopScanning : startScanning}
                  className="flex-1"
                >
                  {isScanning ? (
                    <>
                      <CameraOff className="h-4 w-4 mr-2" />
                      Stop Camera
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Start Camera
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={handleClose} className={manualEntry ? "w-full" : "flex-1"}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
