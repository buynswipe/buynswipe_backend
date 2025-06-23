"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Scan, Camera, Keyboard } from "lucide-react"

interface BarcodeScannerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScan: (barcode: string) => void
}

export function BarcodeScanner({ open, onOpenChange, onScan }: BarcodeScannerProps) {
  const [manualBarcode, setManualBarcode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [useCamera, setUseCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (open && useCamera) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => stopCamera()
  }, [open, useCamera])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsScanning(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setUseCamera(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim())
      setManualBarcode("")
      onOpenChange(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleManualSubmit()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Barcode Scanner
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Scanner Mode Toggle */}
          <div className="flex gap-2">
            <Button variant={!useCamera ? "default" : "outline"} onClick={() => setUseCamera(false)} className="flex-1">
              <Keyboard className="h-4 w-4 mr-2" />
              Manual Entry
            </Button>
            <Button variant={useCamera ? "default" : "outline"} onClick={() => setUseCamera(true)} className="flex-1">
              <Camera className="h-4 w-4 mr-2" />
              Camera Scan
            </Button>
          </div>

          {useCamera ? (
            <div className="space-y-4">
              <div className="relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-48 bg-black rounded-lg" />
                <canvas ref={canvasRef} className="hidden" />
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-red-500 w-48 h-24 rounded-lg"></div>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 text-center">Position the barcode within the red frame</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="manual-barcode">Enter Barcode</Label>
                <Input
                  id="manual-barcode"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Scan or type barcode here"
                  autoFocus
                />
              </div>
              <Button onClick={handleManualSubmit} className="w-full">
                Search Product
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
