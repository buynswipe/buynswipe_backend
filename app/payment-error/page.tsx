"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { XCircle, ArrowLeft, Home } from "lucide-react"
import Link from "next/link"

export default function PaymentErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") || "An unknown error occurred during payment processing"
  const orderId = searchParams.get("orderId")

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card className="border-red-200">
        <CardHeader className="bg-red-50">
          <div className="flex justify-center mb-2">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-center text-red-800">Payment Failed</CardTitle>
          <CardDescription className="text-center text-red-700">
            We encountered an issue while processing your payment
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">What can you do now?</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>Check your internet connection and try again</li>
              <li>Verify your payment details and try again</li>
              <li>Try a different payment method</li>
              <li>Contact customer support if the issue persists</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
          {orderId ? (
            <Button asChild variant="default">
              <Link href={`/orders/${orderId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Order
              </Link>
            </Button>
          ) : (
            <Button asChild variant="default">
              <Link href="/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Link>
            </Button>
          )}

          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
