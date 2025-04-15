"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function LinkDeliveryPartnersButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<{
    success: boolean
    message: string
    details?: {
      created: number
      updated: number
      orphaned: number
      total: number
    }
  } | null>(null)
  const { toast } = useToast()

  const handleLinkDeliveryPartners = async () => {
    setIsLoading(true)
    setResults(null)

    try {
      // Try the App Router endpoint first
      const response = await fetch("/api/admin/link-delivery-partners-to-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setResults(data)

      toast({
        title: "Success",
        description: `Linked ${data.details?.updated || 0} delivery partners and created ${
          data.details?.created || 0
        } new records.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error linking delivery partners:", error)

      toast({
        title: "Error",
        description: "Failed to link delivery partners. Please try again.",
        variant: "destructive",
      })

      setResults({
        success: false,
        message: "Failed to link delivery partners. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button onClick={handleLinkDeliveryPartners} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Linking Partners...
          </>
        ) : (
          "Link Delivery Partners"
        )}
      </Button>

      {results && (
        <div
          className={`mt-4 p-4 rounded-md ${results.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
        >
          <p className="font-medium">{results.message}</p>
          {results.details && (
            <ul className="mt-2 text-sm">
              <li>Created: {results.details.created} new delivery partner records</li>
              <li>Updated: {results.details.updated} existing delivery partner records</li>
              <li>Orphaned: {results.details.orphaned} delivery partners without users</li>
              <li>Total: {results.details.total} delivery partners processed</li>
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
