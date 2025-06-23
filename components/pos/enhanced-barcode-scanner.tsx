"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, CameraOff, Keyboard, X, Zap, Settings } from "lucide-react"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"

interface EnhancedBarcodeScannerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBarcodeScanned: (product: any) => void
}

export function EnhancedBarcodeScanner({ open, onOpenChange, onBarcodeScanned }: EnhancedBarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [manualEntry, setManualEntry] = useState(false)
  const [barcodeInput, setBarcodeInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [scanHistory, setScanHistory] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [cameraSettings, setCameraSettings] = useState({
    facingMode: "environment",
    resolution: "high",
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMobile = useIsMobile()

  const startScanning = async () => {
    try {
      setError(null)
      setIsProcessing(false)

      const constraints = {
        video: {
          facingMode: cameraSettings.facingMode,
          width: { ideal: cameraSettings.resolution === "high" ? 1920 : 1280 },
          height: { ideal: cameraSettings.resolution === "high" ? 1080 : 720 },
          frameRate: { ideal: 30 },
        },
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      setIsScanning(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()

        // Start continuous scanning
        startContinuousScanning()
      }

      toast.success("Camera started - Scanning for barcodes")
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
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    setIsScanning(false)
  }

  const startContinuousScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }

    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && !isProcessing) {
        captureAndAnalyze()
      }
    }, 500) // Scan every 500ms
  }

  const captureAndAnalyze = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas || video.videoWidth === 0) return

    const context = canvas.getContext("2d")
    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    // Get image data for barcode detection
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    // Simulate barcode detection (in production, use a proper barcode library like ZXing)
    // For now, we'll use a mock detection
    await simulateBarcodeDetection(imageData)
  }

  const simulateBarcodeDetection = async (imageData: ImageData) => {
    // This is a placeholder for actual barcode detection
    // In production, integrate with libraries like @zxing/library or quagga2

    // Mock detection for demonstration
    if (Math.random() < 0.1) {
      // 10% chance of "detecting" a barcode
      const mockBarcode = "8901030895016" // Sample barcode
      await handleBarcodeDetected(mockBarcode)
    }
  }

  const handleBarcodeDetected = async (barcode: string) => {
    if (isProcessing || scanHistory.includes(barcode)) return

    setIsProcessing(true)
    setScanHistory((prev) => [...prev, barcode])

    try {
      const response = await fetch(`/api/products?barcode=${barcode}`)

      if (response.ok) {
        const product = await response.json()
        onBarcodeScanned(product)
        toast.success(`Product found: ${product.name}`)

        // Auto-close after successful scan
        setTimeout(() => {
          onOpenChange(false)
        }, 1000)
      } else {
        toast.error("Product not found")
      }
    } catch (error) {
      toast.error("Failed to lookup product")
    } finally {
      setIsProcessing(false)
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
    setScanHistory([])
    setIsProcessing(false)
    onOpenChange(false)
  }

  const toggleCameraFacing = () => {
    setCameraSettings((prev) => ({
      ...prev,
      facingMode: prev.facingMode === "environment" ? "user" : "environment",
    }))
    if (isScanning) {
      stopScanning()
      setTimeout(startScanning, 100)
    }
  }

  const toggleResolution = () => {
    setCameraSettings((prev) => ({
      ...prev,
      resolution: prev.resolution === "high" ? "standard" : "high",
    }))
    if (isScanning) {
      stopScanning()
      setTimeout(startScanning, 100)
    }
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
      <DialogContent className={`${isMobile ? "w-[95vw] h-[90vh] max-w-none" : "max-w-3xl"} p-0`}>
        <div className="flex flex-col h-full">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <span>Enhanced Barcode Scanner</span>
                {isProcessing && <Badge variant="secondary">Processing...</Badge>}
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 p-4 space-y-4">
            {/* Mode Toggle */}
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
                Camera Scan
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
                Manual Entry
              </Button>
            </div>

            {/* Camera Controls */}
            {!manualEntry && (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={toggleCameraFacing}>
                  <Camera className="h-4 w-4 mr-2" />
                  {cameraSettings.facingMode === "environment" ? "Back" : "Front"} Camera
                </Button>
                <Button variant="outline" size="sm" onClick={toggleResolution}>
                  <Settings className="h-4 w-4 mr-2" />
                  {cameraSettings.resolution === "high" ? "High" : "Standard"} Quality
                </Button>
              </div>
            )}

            {/* Camera View */}
            {!manualEntry && (
              <Card className="flex-1">
                <CardContent className="p-0 relative">
                  {error ? (
                    <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <CameraOff className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">{error}</p>
                        <Button variant="outline" size="sm" onClick={startScanning}>
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
                        className={`w-full ${isMobile ? "h-64" : "h-96"} bg-black rounded-lg object-cover`}
                      />
                      <canvas ref={canvasRef} className="hidden" />

                      {/* Enhanced Scanning Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          {/* Scanning Frame */}
                          <div className="border-2 border-red-500 w-72 h-40 rounded-lg relative">
                            {/* Corner indicators */}
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-500"></div>
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-500"></div>
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-500"></div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-500"></div>

                            {/* Scanning line animation */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-0.5 bg-red-500 animate-pulse"></div>
                            </div>
                          </div>

                          {/* Instructions */}
                          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
                            <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
                              <p className="text-sm font-medium">Position barcode within frame</p>
                              <p className="text-xs opacity-75">Scanning automatically...</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Scan History */}
                      {scanHistory.length > 0 && (
                        <div className="absolute top-4 right-4">
                          <Badge variant="secondary">Scanned: {scanHistory.length}</Badge>
                        </div>
                      )}

                      {/* Performance Indicator */}
                      <div className="absolute top-4 left-4">
                        <Badge variant={isScanning ? "default" : "secondary"}>
                          <Zap className="h-3 w-3 mr-1" />
                          {isScanning ? "Active" : "Inactive"}
                        </Badge>
                      </div>
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
                        className={isMobile ? "text-base h-12" : ""}
                        autoFocus
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={!barcodeInput.trim() || isProcessing}>
                      {isProcessing ? "Searching..." : "Search Product"}
                    </Button>
                  </form>

                  {/* Recent Scans */}
                  {scanHistory.length > 0 && (
                    <div className="mt-4">
                      <Label className="text-sm">Recent Scans</Label>
                      <div className="mt-2 space-y-1">
                        {scanHistory.slice(-3).map((barcode, index) => (
                          <div key={index} className="text-xs bg-gray-100 p-2 rounded">
                            {barcode}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                  disabled={isProcessing}
                >
                  {isScanning ? (
                    <>
                      <CameraOff className="h-4 w-4 mr-2" />
                      Stop Scanning
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Start Scanning
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
