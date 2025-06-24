"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { QrCode, Download, Printer, Copy, RefreshCw, Package, Hash } from "lucide-react"
import { toast } from "sonner"

interface BarcodeGeneratorProps {
  productId?: string
  productName?: string
  onBarcodeGenerated?: (barcode: string) => void
}

export function BarcodeGenerator({ productId, productName, onBarcodeGenerated }: BarcodeGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customBarcode, setCustomBarcode] = useState("")
  const [generatedBarcode, setGeneratedBarcode] = useState("")
  const [barcodeType, setBarcodeType] = useState<"EAN13" | "CODE128" | "UPC">("EAN13")
  const [generating, setGenerating] = useState(false)

  const generateRandomBarcode = (type: string) => {
    switch (type) {
      case "EAN13":
        // Generate 13-digit EAN barcode
        let ean13 = ""
        for (let i = 0; i < 12; i++) {
          ean13 += Math.floor(Math.random() * 10)
        }
        // Calculate check digit
        const checkDigit = calculateEAN13CheckDigit(ean13)
        return ean13 + checkDigit

      case "UPC":
        // Generate 12-digit UPC barcode
        let upc = ""
        for (let i = 0; i < 11; i++) {
          upc += Math.floor(Math.random() * 10)
        }
        const upcCheck = calculateUPCCheckDigit(upc)
        return upc + upcCheck

      case "CODE128":
        // Generate alphanumeric CODE128
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        let code128 = ""
        for (let i = 0; i < 10; i++) {
          code128 += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return code128

      default:
        return Date.now().toString()
    }
  }

  const calculateEAN13CheckDigit = (barcode: string) => {
    let sum = 0
    for (let i = 0; i < 12; i++) {
      const digit = Number.parseInt(barcode[i])
      sum += i % 2 === 0 ? digit : digit * 3
    }
    return ((10 - (sum % 10)) % 10).toString()
  }

  const calculateUPCCheckDigit = (barcode: string) => {
    let sum = 0
    for (let i = 0; i < 11; i++) {
      const digit = Number.parseInt(barcode[i])
      sum += i % 2 === 0 ? digit * 3 : digit
    }
    return ((10 - (sum % 10)) % 10).toString()
  }

  const handleGenerate = async () => {
    setGenerating(true)

    try {
      const barcode = customBarcode || generateRandomBarcode(barcodeType)

      // Validate barcode format
      if (!validateBarcode(barcode, barcodeType)) {
        toast.error("Invalid barcode format")
        return
      }

      setGeneratedBarcode(barcode)
      onBarcodeGenerated?.(barcode)

      // In a real implementation, you might want to:
      // 1. Check if barcode already exists
      // 2. Save to database
      // 3. Generate barcode image

      toast.success("Barcode generated successfully")
    } catch (error) {
      console.error("Barcode generation error:", error)
      toast.error("Failed to generate barcode")
    } finally {
      setGenerating(false)
    }
  }

  const validateBarcode = (barcode: string, type: string) => {
    switch (type) {
      case "EAN13":
        return /^\d{13}$/.test(barcode)
      case "UPC":
        return /^\d{12}$/.test(barcode)
      case "CODE128":
        return /^[A-Z0-9]{6,20}$/.test(barcode)
      default:
        return true
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Barcode copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy barcode")
    }
  }

  const downloadBarcode = () => {
    // In a real implementation, generate and download barcode image
    toast.success("Barcode download started")
  }

  const printBarcode = () => {
    // In a real implementation, send to printer
    toast.success("Barcode sent to printer")
  }

  // Simple barcode visualization (replace with actual barcode library)
  const BarcodeVisualization = ({ code }: { code: string }) => (
    <div className="bg-white p-4 border rounded-lg">
      <div className="flex justify-center mb-2">
        <div className="flex">
          {code.split("").map((digit, index) => (
            <div
              key={index}
              className={`w-1 h-16 ${Number.parseInt(digit) % 2 === 0 ? "bg-black" : "bg-white border-x border-gray-300"}`}
            />
          ))}
        </div>
      </div>
      <div className="text-center font-mono text-sm">{code}</div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode className="h-4 w-4 mr-2" />
          Generate Barcode
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <QrCode className="h-5 w-5 mr-2" />
            Barcode Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Info */}
          {productName && (
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm">{productName}</p>
                    {productId && <p className="text-xs text-gray-500">ID: {productId}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Barcode Type Selection */}
          <div className="space-y-2">
            <Label>Barcode Type</Label>
            <div className="flex space-x-2">
              {["EAN13", "UPC", "CODE128"].map((type) => (
                <Button
                  key={type}
                  variant={barcodeType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBarcodeType(type as any)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Barcode Input */}
          <div className="space-y-2">
            <Label>Custom Barcode (Optional)</Label>
            <Input
              value={customBarcode}
              onChange={(e) => setCustomBarcode(e.target.value)}
              placeholder={`Enter ${barcodeType} barcode or leave empty for auto-generation`}
            />
            <p className="text-xs text-gray-500">
              {barcodeType === "EAN13" && "13 digits required"}
              {barcodeType === "UPC" && "12 digits required"}
              {barcodeType === "CODE128" && "6-20 alphanumeric characters"}
            </p>
          </div>

          {/* Generate Button */}
          <Button onClick={handleGenerate} className="w-full" disabled={generating}>
            {generating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Hash className="h-4 w-4 mr-2" />
                Generate Barcode
              </>
            )}
          </Button>

          {/* Generated Barcode Display */}
          {generatedBarcode && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="text-center">
                  <Badge variant="secondary" className="mb-2">
                    {barcodeType}
                  </Badge>
                  <BarcodeVisualization code={generatedBarcode} />
                </div>

                <Separator />

                {/* Barcode Actions */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedBarcode)}
                    className="flex-1"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadBarcode} className="flex-1">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={printBarcode} className="flex-1">
                    <Printer className="h-3 w-3 mr-1" />
                    Print
                  </Button>
                </div>

                {/* Barcode Info */}
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span>{barcodeType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Length:</span>
                    <span>{generatedBarcode.length} characters</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Generated:</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
