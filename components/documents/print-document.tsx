"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer, Download, Loader2 } from "lucide-react"

interface PrintDocumentProps {
  documentId: string
  documentType: "invoice" | "dispatch"
  buttonText?: string
  className?: string
}

export function PrintDocument({ documentId, documentType, buttonText, className = "" }: PrintDocumentProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePrint = async () => {
    setIsLoading(true)
    try {
      // Open the document in a new window
      const url = `/api/documents/${documentType}/${documentId}`
      const printWindow = window.open(url, "_blank")

      if (printWindow) {
        // Add event listener to detect when content is loaded
        printWindow.addEventListener("load", () => {
          // Slight delay to ensure styles are applied
          setTimeout(() => {
            printWindow.print()
            setIsLoading(false)
          }, 500)
        })
      } else {
        // If popup is blocked
        setIsLoading(false)
        alert("Please allow popups to print documents")
      }
    } catch (error) {
      console.error("Error printing document:", error)
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      // Fetch the document HTML
      const response = await fetch(`/api/documents/${documentType}/${documentId}?download=true`)
      if (!response.ok) throw new Error("Failed to generate document")

      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `${documentType}-${documentId}.pdf`
      document.body.appendChild(a)
      a.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      setIsLoading(false)
    } catch (error) {
      console.error("Error downloading document:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button onClick={handlePrint} disabled={isLoading} variant="outline" size="sm">
        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Printer className="h-4 w-4 mr-2" />}
        {buttonText || `Print ${documentType === "invoice" ? "Invoice" : "Dispatch Receipt"}`}
      </Button>
      <Button onClick={handleDownload} disabled={isLoading} variant="outline" size="sm">
        <Download className="h-4 w-4" />
        <span className="sr-only">Download</span>
      </Button>
    </div>
  )
}
