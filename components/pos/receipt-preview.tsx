"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Printer, Download, Share } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface ReceiptPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: any
  onPrint: () => void
}

export function ReceiptPreview({ open, onOpenChange, transaction, onPrint }: ReceiptPreviewProps) {
  const isMobile = useIsMobile()

  if (!transaction) return null

  const handleDownload = () => {
    window.print()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Receipt",
          text: `Receipt #${transaction.id?.slice(-8)} - Total: ₹${transaction.total?.toFixed(2)}`,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? "w-[95vw] h-[90vh] max-w-none" : "sm:max-w-md"} p-0`}>
        <div className="flex flex-col h-full">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle>Receipt Preview</DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4">
            {/* Receipt Content */}
            <div className={`bg-white border rounded-lg font-mono ${isMobile ? "text-sm p-6" : "text-sm p-6"}`}>
              <div className="text-center mb-4">
                <h3 className={`font-bold ${isMobile ? "text-lg" : "text-base"}`}>RETAIL BANDHU</h3>
                <p className={isMobile ? "text-sm" : "text-xs"}>Your Retail Partner</p>
                <p className={isMobile ? "text-xs" : "text-xs"}>GST: 12ABCDE1234F1Z5</p>
              </div>

              <Separator className="my-4" />

              <div className="space-y-1 mb-4">
                <div className="flex justify-between">
                  <span>Receipt #:</span>
                  <span>{transaction.id?.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(transaction.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier:</span>
                  <span>Admin</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 mb-4">
                {transaction.items?.map((item: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between">
                      <span className="flex-1 truncate pr-2">{item.name}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className={`${isMobile ? "text-xs" : "text-xs"} text-gray-500 ml-2`}>
                      {item.quantity} x ₹{item.price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-1 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{transaction.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (18%):</span>
                  <span>₹{transaction.tax?.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between font-bold ${isMobile ? "text-base" : ""}`}>
                  <span>Total:</span>
                  <span>₹{transaction.total?.toFixed(2)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-1 mb-4">
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span>{transaction.paymentMethod?.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid:</span>
                  <span>₹{transaction.amountPaid?.toFixed(2)}</span>
                </div>
                {transaction.change > 0 && (
                  <div className="flex justify-between">
                    <span>Change:</span>
                    <span>₹{transaction.change?.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className={`text-center mt-6 ${isMobile ? "text-xs" : "text-xs"}`}>
                <p>Thank you for your business!</p>
                <p>Visit us again soon</p>
              </div>
            </div>
          </ScrollArea>

          {/* Action Buttons */}
          <div className="p-4 border-t">
            <div className={`${isMobile ? "space-y-2" : "flex space-x-2"}`}>
              {isMobile ? (
                <>
                  <Button onClick={onPrint} className="w-full h-12">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Receipt
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleDownload} className="flex-1 h-12">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    {navigator.share && (
                      <Button variant="outline" onClick={handleShare} className="flex-1 h-12">
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={handleDownload} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={onPrint} className="flex-1">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
