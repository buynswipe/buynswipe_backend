// Real barcode detection service using @zxing/library
import { BrowserMultiFormatReader, type Result, NotFoundException } from "@zxing/library"

export class BarcodeDetectionService {
  private reader: BrowserMultiFormatReader
  private isInitialized = false

  constructor() {
    this.reader = new BrowserMultiFormatReader()
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Initialize the reader with specific formats for better performance
      this.reader = new BrowserMultiFormatReader()
      this.isInitialized = true
    } catch (error) {
      console.error("Failed to initialize barcode reader:", error)
      throw new Error("Barcode detection not supported")
    }
  }

  async detectFromCanvas(canvas: HTMLCanvasElement): Promise<string | null> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const result: Result = await this.reader.decodeFromCanvas(canvas)
      return result.getText()
    } catch (error) {
      if (error instanceof NotFoundException) {
        // No barcode found - this is normal
        return null
      }
      console.error("Barcode detection error:", error)
      return null
    }
  }

  async detectFromImageData(imageData: ImageData): Promise<string | null> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // Create a temporary canvas for the image data
      const canvas = document.createElement("canvas")
      canvas.width = imageData.width
      canvas.height = imageData.height
      const ctx = canvas.getContext("2d")

      if (!ctx) return null

      ctx.putImageData(imageData, 0, 0)
      return await this.detectFromCanvas(canvas)
    } catch (error) {
      console.error("Barcode detection from image data error:", error)
      return null
    }
  }

  async detectFromVideo(video: HTMLVideoElement): Promise<string | null> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const result: Result = await this.reader.decodeFromVideoElement(video)
      return result.getText()
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null
      }
      console.error("Video barcode detection error:", error)
      return null
    }
  }

  validateBarcode(barcode: string): { isValid: boolean; format: string; checkDigit?: boolean } {
    // Basic barcode validation
    const formats = {
      EAN13: /^\d{13}$/,
      EAN8: /^\d{8}$/,
      UPC: /^\d{12}$/,
      CODE128: /^[\x00-\x7F]+$/,
      CODE39: /^[A-Z0-9\-.$/+%*\s]+$/,
    }

    for (const [format, regex] of Object.entries(formats)) {
      if (regex.test(barcode)) {
        const checkDigit = this.validateCheckDigit(barcode, format)
        return { isValid: true, format, checkDigit }
      }
    }

    return { isValid: false, format: "UNKNOWN" }
  }

  private validateCheckDigit(barcode: string, format: string): boolean {
    switch (format) {
      case "EAN13":
        return this.validateEAN13CheckDigit(barcode)
      case "EAN8":
        return this.validateEAN8CheckDigit(barcode)
      case "UPC":
        return this.validateUPCCheckDigit(barcode)
      default:
        return true // No check digit validation for other formats
    }
  }

  private validateEAN13CheckDigit(barcode: string): boolean {
    if (barcode.length !== 13) return false

    const digits = barcode.split("").map(Number)
    const checkDigit = digits.pop()!

    let sum = 0
    for (let i = 0; i < digits.length; i++) {
      sum += digits[i] * (i % 2 === 0 ? 1 : 3)
    }

    const calculatedCheckDigit = (10 - (sum % 10)) % 10
    return calculatedCheckDigit === checkDigit
  }

  private validateEAN8CheckDigit(barcode: string): boolean {
    if (barcode.length !== 8) return false

    const digits = barcode.split("").map(Number)
    const checkDigit = digits.pop()!

    let sum = 0
    for (let i = 0; i < digits.length; i++) {
      sum += digits[i] * (i % 2 === 0 ? 3 : 1)
    }

    const calculatedCheckDigit = (10 - (sum % 10)) % 10
    return calculatedCheckDigit === checkDigit
  }

  private validateUPCCheckDigit(barcode: string): boolean {
    if (barcode.length !== 12) return false

    const digits = barcode.split("").map(Number)
    const checkDigit = digits.pop()!

    let sum = 0
    for (let i = 0; i < digits.length; i++) {
      sum += digits[i] * (i % 2 === 0 ? 3 : 1)
    }

    const calculatedCheckDigit = (10 - (sum % 10)) % 10
    return calculatedCheckDigit === checkDigit
  }

  generateBarcode(data: string, format: "EAN13" | "EAN8" | "UPC" | "CODE128" = "EAN13"): string {
    switch (format) {
      case "EAN13":
        return this.generateEAN13(data)
      case "EAN8":
        return this.generateEAN8(data)
      case "UPC":
        return this.generateUPC(data)
      case "CODE128":
        return data // CODE128 doesn't need special generation
      default:
        return data
    }
  }

  private generateEAN13(data: string): string {
    // Ensure 12 digits, pad with zeros if needed
    const digits = data.padStart(12, "0").slice(0, 12)
    const checkDigit = this.calculateEAN13CheckDigit(digits)
    return digits + checkDigit
  }

  private generateEAN8(data: string): string {
    const digits = data.padStart(7, "0").slice(0, 7)
    const checkDigit = this.calculateEAN8CheckDigit(digits)
    return digits + checkDigit
  }

  private generateUPC(data: string): string {
    const digits = data.padStart(11, "0").slice(0, 11)
    const checkDigit = this.calculateUPCCheckDigit(digits)
    return digits + checkDigit
  }

  private calculateEAN13CheckDigit(digits: string): string {
    const digitArray = digits.split("").map(Number)
    let sum = 0

    for (let i = 0; i < digitArray.length; i++) {
      sum += digitArray[i] * (i % 2 === 0 ? 1 : 3)
    }

    return ((10 - (sum % 10)) % 10).toString()
  }

  private calculateEAN8CheckDigit(digits: string): string {
    const digitArray = digits.split("").map(Number)
    let sum = 0

    for (let i = 0; i < digitArray.length; i++) {
      sum += digitArray[i] * (i % 2 === 0 ? 3 : 1)
    }

    return ((10 - (sum % 10)) % 10).toString()
  }

  private calculateUPCCheckDigit(digits: string): string {
    const digitArray = digits.split("").map(Number)
    let sum = 0

    for (let i = 0; i < digitArray.length; i++) {
      sum += digitArray[i] * (i % 2 === 0 ? 3 : 1)
    }

    return ((10 - (sum % 10)) % 10).toString()
  }

  dispose(): void {
    if (this.reader) {
      this.reader.reset()
    }
    this.isInitialized = false
  }
}

// Singleton instance
export const barcodeDetectionService = new BarcodeDetectionService()
