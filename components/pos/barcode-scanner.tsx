"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, CameraOff } from "lucide-react"
import { toast } from "sonner"

interface BarcodeScannerProps {
  onBarcodeScanned: (product: any) => void
}

export function BarcodeScanner({ onBarcodeScanned }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const startScanning = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      setStream(mediaStream)
      setIsScanning(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      toast.success("Camera started - Point at barcode")
    } catch (error) {
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
      // Simulate product lookup by barcode
      const response = await fetch(`/api/products?barcode=${barcode}`)

      if (response.ok) {
        const product = await response.json()
        onBarcodeScanned(product)
        toast.success(`Product found: ${product.name}`)
      } else {
        toast.error("Product not found")
      }
    } catch (error) {
      toast.error("Failed to lookup product")
    }
  }

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Barcode Scanner</h3>
        <Button
          variant={isScanning ? "destructive" : "default"}
          size="sm"
          onClick={isScanning ? stopScanning : startScanning}
        >
          {isScanning ? (
            <>
              <CameraOff className="h-4 w-4 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 mr-2" />
              Scan
            </>
          )}
        </Button>
      </div>

      {isScanning && (
        <Card>
          <CardContent className="p-4">
            <video ref={videoRef} autoPlay playsInline className="w-full h-48 bg-black rounded-lg" />
            <p className="text-sm text-gray-500 mt-2 text-center">Point camera at barcode to scan</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
