"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
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
  Zap,
  Target,
  Clock,
} from "lucide-react"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import { barcodeDetectionService } from "@/lib/barcode-detection"
import { inventoryService } from "@/lib/inventory-service"

interface ProductionBarcodeScannerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductFound: (product: any) => void
  onBarcodeScanned?: (barcode: string) => void
}

export function ProductionBarcodeScanner({
  open,
  onOpenChange,
  onProductFound,
  onBarcodeScanned,
}: ProductionBarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [manualBarcode, setManualBarcode] = useState("")
  const [flashlightOn, setFlashlightOn] = useState(false)
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("environment")
  const [scanMode, setScanMode] = useState<"camera" | "manual">("camera")
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null)
  const [scanHistory, setScanHistory] = useState<
    Array<{
      barcode: string
      timestamp: Date
      product?: any
      valid: boolean
    }>
  >([])
  const [error, setError] = useState<string | null>(null)
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "prompt">("prompt")
  const [scanStats, setScanStats] = useState({
    totalScans: 0,
    successfulScans: 0,
    failedScans: 0,
    averageTime: 0,
  })
  const [scanStartTime, setScanStartTime] = useState<Date | null>(null)
  const [detectionConfidence, setDetectionConfidence] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMobile = useIsMobile()

  // Initialize barcode detection service
  useEffect(() => {
    if (open) {
      barcodeDetectionService.initialize().catch(console.error)
    }

    return () => {
      if (!open) {
        barcodeDetectionService.dispose()
      }
    }
  }, [open])

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
      setScanStartTime(new Date())

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          frameRate: { ideal: 30, min: 15 },
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsScanning(true)
        startBarcodeDetection()
      }

      setCameraPermission("granted")
      toast.success("Camera started successfully")
    } catch (error: any) {
      console.error("Error starting camera:", error)
      setError("Failed to access camera. Please check permissions.")
      setCameraPermission("denied")
      setScanMode("manual")
      toast.error("Camera access failed")
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
    setDetectionConfidence(0)
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
        toast.success(`Flashlight ${!flashlightOn ? "on" : "off"}`)
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
    }, 200) // Scan every 200ms for better performance
  }

  const detectBarcode = async () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    try {
      // Use real barcode detection
      const barcode = await barcodeDetectionService.detectFromCanvas(canvas)

      if (barcode && barcode !== lastScannedCode) {
        // Validate barcode format
        const validation = barcodeDetectionService.validateBarcode(barcode)

        if (validation.isValid) {
          setDetectionConfidence(95) // High confidence for valid barcodes
          handleBarcodeDetected(barcode)
        } else {
          setDetectionConfidence(60) // Lower confidence for invalid format
          console.warn("Invalid barcode format:", barcode)
        }
      } else {
        // Gradually decrease confidence when no barcode is detected
        setDetectionConfidence((prev) => Math.max(0, prev - 5))
      }
    } catch (error) {
      console.error("Barcode detection error:", error)
      setDetectionConfidence(0)
    }
  }

  const handleBarcodeDetected = useCallback(
    async (barcode: string) => {
      const scanTime = scanStartTime ? new Date().getTime() - scanStartTime.getTime() : 0

      setLastScannedCode(barcode)
      onBarcodeScanned?.(barcode)

      // Update scan stats
      setScanStats((prev) => ({
        totalScans: prev.totalScans + 1,
        successfulScans: prev.successfulScans + 1,
        failedScans: prev.failedScans,
        averageTime: (prev.averageTime * prev.totalScans + scanTime) / (prev.totalScans + 1),
      }))

      // Provide haptic feedback
      if (isMobile && navigator.vibrate) {
        navigator.vibrate([100, 50, 100])
      }

      // Look up product
      try {
        const product = await inventoryService.getInventoryItem(barcode)

        if (product) {
          // Add to scan history
          setScanHistory((prev) => [
            {
              barcode,
              timestamp: new Date(),
              product,
              valid: true,
            },
            ...prev.slice(0, 9),
          ])

          onProductFound(product)
          toast.success(`Product found: ${product.name}`)
          onOpenChange(false)
        } else {
          // Add to scan history as failed
          setScanHistory((prev) => [
            {
              barcode,
              timestamp: new Date(),
              valid: false,
            },
            ...prev.slice(0, 9),
          ])

          toast.error("Product not found for this barcode")

          // Update failed scan stats
          setScanStats((prev) => ({
            ...prev,
            failedScans: prev.failedScans + 1,
          }))
        }
      } catch (error) {
        console.error("Product lookup error:", error)
        toast.error("Failed to lookup product")
      }

      setScanStartTime(new Date()) // Reset scan timer
    },
    [scanStartTime, onBarcodeScanned, onProductFound, onOpenChange, isMobile],
  )

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (manualBarcode.trim()) {
      await handleBarcodeDetected(manualBarcode.trim())
      setManualBarcode("")
    }
  }

  const handleClose = () => {
    stopCamera()
    onOpenChange(false)
    setError(null)
    setLastScannedCode(null)
    setDetectionConfidence(0)
  }

  useEffect(() => {
    if (open && scanMode === "camera") {
      checkCameraPermission()
    }
  }, [open, scanMode])

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
      <DialogContent className={`${isMobile ? "w-[95vw] h-[90vh] max-w-none" : "max-w-4xl"} p-0`}>
        <div className="flex flex-col h-full">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ScanLine className="h-5 w-5" />
                <span>Advanced Barcode Scanner</span>
                {detectionConfidence > 0 && (
                  <Badge variant={detectionConfidence > 80 ? "default" : "secondary"}>
                    {detectionConfidence}% confidence
                  </Badge>
                )}
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

          <div className="flex-1 p-4 space-y-4">
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

                {/* Detection Confidence */}
                {isScanning && (
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Detection Quality</span>
                        <span className="text-sm text-gray-600">{detectionConfidence}%</span>
                      </div>
                      <Progress value={detectionConfidence} className="h-2" />
                    </CardContent>
                  </Card>
                )}

                {/* Camera View */}
                <div className="relative">
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

                    {/* Enhanced Scanning Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        {/* Scanning frame */}
                        <div className="w-80 h-48 border-2 border-white rounded-lg opacity-70">
                          {/* Corner indicators */}
                          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-green-400"></div>
                          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-green-400"></div>
                          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-green-400"></div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-green-400"></div>
                        </div>

                        {/* Scanning line */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className={`w-full h-0.5 bg-red-500 ${isScanning ? "animate-pulse" : ""}`}></div>
                        </div>

                        {/* Target indicator */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Target
                            className={`h-8 w-8 text-white ${detectionConfidence > 50 ? "text-green-400" : ""}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status Indicators */}
                    <div className="absolute top-4 left-4 flex flex-col space-y-2">
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
                      {detectionConfidence > 80 && (
                        <Badge className="bg-blue-500">
                          <Zap className="w-3 h-3 mr-1" />
                          High Quality
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
                  <Button onClick={startCamera} className="w-full" size="lg">
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

            {/* Scan Statistics */}
            {scanStats.totalScans > 0 && (
              <Card>
                <CardContent className="p-3">
                  <h4 className="text-sm font-medium mb-2">Scan Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-medium text-green-600">{scanStats.successfulScans}</p>
                      <p className="text-gray-600">Successful</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-red-600">{scanStats.failedScans}</p>
                      <p className="text-gray-600">Failed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                    {scanHistory.map((scan, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                        <div className="flex-1 min-w-0">
                          <p className="font-mono truncate">{scan.barcode}</p>
                          {scan.product && <p className="text-gray-600 truncate">{scan.product.name}</p>}
                          <p className="text-gray-400">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {scan.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="ml-2">
                          {scan.valid ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
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
