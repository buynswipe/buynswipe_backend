"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Camera,
  ScanLine,
  X,
  Flashlight,
  FlashlightOff,
  RotateCcw,
  Keyboard,
  CheckCircle,
  AlertCircle,
  Package,
} from "lucide-react"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"

interface Product {
  id: string
  name: string
  price: number
  barcode: string
  category?: string
  stock: number
  image?: string
}

interface AdvancedBarcodeScannerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductFound: (product: Product) => void
  onBarcodeScanned?: (barcode: string) => void
}

export function AdvancedBarcodeScanner({
  open,
  onOpenChange,
  onProductFound,
  onBarcodeScanned,
}: AdvancedBarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [manualBarcode, setManualBarcode] = useState("")
  const [flashlightOn, setFlashlightOn] = useState(false)
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("environment")
  const [scanMode, setScanMode] = useState<"camera" | "manual">("camera")
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null)
  const [scanHistory, setScanHistory] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "prompt">("prompt")

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMobile = useIsMobile()

  // Check camera permission
  useEffect(() => {
    if (open && scanMode === "camera") {
      checkCameraPermission()
    }
  }, [open, scanMode])

  const checkCameraPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: "camera" as PermissionName })
      setCameraPermission(permission.state)

      permission.onchange = () => {
        setCameraPermission(permission.state)
      }
    } catch (error) {
      console.error("Error checking camera permission:", error)
    }
  }

  const startCamera = async () => {
    try {
      setError(null)

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsScanning(true)
        startBarcodeDetection()
      }

      setCameraPermission("granted")
    } catch (error: any) {
      console.error("Error starting camera:", error)
      setError("Failed to access camera. Please check permissions.")
      setCameraPermission("denied")
      setScanMode("manual")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    setIsScanning(false)
    setFlashlightOn(false)
  }

  const toggleFlashlight = async () => {
    if (!streamRef.current) return

    try {
      const track = streamRef.current.getVideoTracks()[0]
      const capabilities = track.getCapabilities()

      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !flashlightOn } as any],
        })
        setFlashlightOn(!flashlightOn)
      } else {
        toast.error("Flashlight not supported on this device")
      }
    } catch (error) {
      console.error("Error toggling flashlight:", error)
      toast.error("Failed to toggle flashlight")
    }
  }

  const switchCamera = () => {
    stopCamera()
    setCameraFacing(cameraFacing === "user" ? "environment" : "user")
    setTimeout(startCamera, 100)
  }

  const startBarcodeDetection = () => {
    if (!videoRef.current || !canvasRef.current) return

    scanIntervalRef.current = setInterval(() => {
      detectBarcode()
    }, 500) // Scan every 500ms
  }

  const detectBarcode = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    try {
      // In a real implementation, you would use a barcode detection library
      // like @zxing/library or quagga2
      // For now, we'll simulate barcode detection
      const simulatedBarcode = await simulateBarcodeDetection(canvas)

      if (simulatedBarcode && simulatedBarcode !== lastScannedCode) {
        handleBarcodeDetected(simulatedBarcode)
      }
    } catch (error) {
      console.error("Barcode detection error:", error)
    }
  }

  // Simulate barcode detection (replace with actual library)
  const simulateBarcodeDetection = async (canvas: HTMLCanvasElement): Promise<string | null> => {
    // This is a mock implementation
    // In production, integrate with libraries like:
    // - @zxing/library
    // - quagga2
    // - @zxing/browser

    const context = canvas.getContext("2d")
    if (!context) return null

    // Simulate finding a barcode occasionally
    if (Math.random() < 0.1) {
      // 10% chance per scan
      const mockBarcodes = ["1234567890123", "9876543210987", "5555555555555", "1111111111111", "7777777777777"]
      return mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)]
    }

    return null
  }

  const handleBarcodeDetected = (barcode: string) => {
    setLastScannedCode(barcode)
    setScanHistory((prev) => [barcode, ...prev.slice(0, 9)]) // Keep last 10 scans
    onBarcodeScanned?.(barcode)
    lookupProduct(barcode)

    // Provide haptic feedback on mobile
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(100)
    }
  }

  const lookupProduct = async (barcode: string) => {
    try {
      const response = await fetch(`/api/products/barcode/${encodeURIComponent(barcode)}`)

      if (response.ok) {
        const product = await response.json()
        onProductFound(product)
        toast.success(`Product found: ${product.name}`)
        onOpenChange(false)
      } else if (response.status === 404) {
        toast.error("Product not found for this barcode")
      } else {
        throw new Error("Failed to lookup product")
      }
    } catch (error) {
      console.error("Product lookup error:", error)
      toast.error("Failed to lookup product")
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualBarcode.trim()) {
      handleBarcodeDetected(manualBarcode.trim())
      setManualBarcode("")
    }
  }

  const handleClose = () => {
    stopCamera()
    onOpenChange(false)
    setError(null)
    setLastScannedCode(null)
  }

  useEffect(() => {
    if (open && scanMode === "camera" && cameraPermission === "granted") {
      startCamera()
    }

    return () => {
      stopCamera()
    }
  }, [open, scanMode, cameraFacing, cameraPermission])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`${isMobile ? "w-[95vw] h-[90vh] max-w-none" : "max-w-2xl"} p-0`}>
        <div className="flex flex-col h-full">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ScanLine className="h-5 w-5" />
                <span>Barcode Scanner</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={scanMode === "camera" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setScanMode("camera")}
                  disabled={cameraPermission === "denied"}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <Button
                  variant={scanMode === "manual" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setScanMode("manual")}
                >
                  <Keyboard className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 p-4">
            {scanMode === "camera" ? (
              <div className="space-y-4">
                {/* Camera Permission Alert */}
                {cameraPermission === "denied" && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Camera access denied. Please enable camera permissions and refresh the page.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Camera View */}
                <div className="relative">
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

                    {/* Scanning Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <div className="w-64 h-40 border-2 border-white rounded-lg opacity-50"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className={`w-full h-0.5 bg-red-500 ${isScanning ? "animate-pulse" : ""}`}></div>
                        </div>
                      </div>
                    </div>

                    {/* Status Indicators */}
                    <div className="absolute top-4 left-4 flex space-x-2">
                      {isScanning && (
                        <Badge className="bg-green-500">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                          Scanning
                        </Badge>
                      )}
                      {flashlightOn && (
                        <Badge className="bg-yellow-500">
                          <Flashlight className="w-3 h-3 mr-1" />
                          Flash On
                        </Badge>
                      )}
                    </div>

                    {/* Camera Controls */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      <Button variant="secondary" size="sm" onClick={toggleFlashlight} disabled={!isScanning}>
                        {flashlightOn ? <FlashlightOff className="h-4 w-4" /> : <Flashlight className="h-4 w-4" />}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={switchCamera} disabled={!isScanning}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Hidden canvas for barcode detection */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Camera Start Button */}
                {!isScanning && cameraPermission !== "denied" && (
                  <Button onClick={startCamera} className="w-full">
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera
                  </Button>
                )}
              </div>
            ) : (
              /* Manual Entry Mode */
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <form onSubmit={handleManualSubmit} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Enter Barcode Manually</label>
                        <Input
                          value={manualBarcode}
                          onChange={(e) => setManualBarcode(e.target.value)}
                          placeholder="Scan or type barcode here..."
                          className={isMobile ? "text-base h-12" : ""}
                          autoFocus
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={!manualBarcode.trim()}>
                        <Package className="h-4 w-4 mr-2" />
                        Lookup Product
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Last Scanned Code */}
            {lastScannedCode && (
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Last Scanned</p>
                      <p className="text-xs text-gray-600 font-mono">{lastScannedCode}</p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Scan History */}
            {scanHistory.length > 0 && (
              <Card>
                <CardContent className="p-3">
                  <h4 className="text-sm font-medium mb-2">Recent Scans</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {scanHistory.map((code, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs cursor-pointer hover:bg-gray-100"
                        onClick={() => lookupProduct(code)}
                      >
                        <span className="font-mono">{code}</span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Package className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
              {scanMode === "camera" && isScanning && (
                <Button variant="outline" onClick={stopCamera} className="flex-1">
                  Stop Scanning
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
