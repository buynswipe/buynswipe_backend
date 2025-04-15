"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Loader2, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react"

export default function PaymentConfigPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [configStatus, setConfigStatus] = useState<{
    success: boolean
    message: string
    config: {
      merchantKeySet: boolean
      merchantSaltSet: boolean
      siteUrlSet: boolean
    }
  } | null>(null)

  // Check PayU configuration
  const checkConfig = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/payments/payu/check-config")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to check PayU configuration")
      }

      setConfigStatus(data)
    } catch (error: any) {
      console.error("Error checking PayU config:", error)
      setError(error.message || "Failed to check PayU configuration")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkConfig()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Payment Configuration</h2>
        <p className="text-muted-foreground">Manage and verify your payment gateway configuration</p>
      </div>

      <Separator />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>PayU Configuration</CardTitle>
            <CardDescription>Verify your PayU merchant credentials and configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : configStatus ? (
              <div className="space-y-4">
                <Alert variant={configStatus.success ? "default" : "destructive"}>
                  {configStatus.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  <AlertTitle>{configStatus.success ? "Configuration Valid" : "Configuration Error"}</AlertTitle>
                  <AlertDescription>{configStatus.message}</AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Merchant Key</span>
                    <span className="flex items-center">
                      {configStatus.config.merchantKeySet ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Set
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                          Not Set
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Merchant Salt</span>
                    <span className="flex items-center">
                      {configStatus.config.merchantSaltSet ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Set
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                          Not Set
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Site URL</span>
                    <span className="flex items-center">
                      {configStatus.config.siteUrlSet ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Set
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                          Not Set (Using Fallback)
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {!configStatus.success && (
                  <Alert>
                    <AlertTitle>How to Fix</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>To fix configuration issues, make sure the following environment variables are set:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {!configStatus.config.merchantKeySet && <li>PAYU_MERCHANT_KEY - Your PayU merchant key</li>}
                        {!configStatus.config.merchantSaltSet && <li>PAYU_MERCHANT_SALT - Your PayU merchant salt</li>}
                        {!configStatus.config.siteUrlSet && (
                          <li>NEXT_PUBLIC_SITE_URL - Your application's URL (e.g., https://your-app.vercel.app)</li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : null}
          </CardContent>
          <CardFooter>
            <Button onClick={checkConfig} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
            <CardDescription>Common issues and solutions for payment integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">UPI Payment Not Working</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  If UPI payments are not working, try the following:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                  <li>Verify your PayU credentials are correct</li>
                  <li>Check if the PayU UPI service is operational</li>
                  <li>Ensure your application can make outbound API calls to PayU</li>
                  <li>Try using the fallback QR code generation if PayU API is unavailable</li>
                  <li>Check browser console for any JavaScript errors</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium">Payment Verification Issues</h3>
                <p className="text-sm text-muted-foreground mt-1">If payment verification is not working:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                  <li>Ensure the transaction ID is being correctly stored with the order</li>
                  <li>Check if the PayU verification API is accessible</li>
                  <li>Verify that the hash calculation is correct</li>
                  <li>Check server logs for any API errors</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
