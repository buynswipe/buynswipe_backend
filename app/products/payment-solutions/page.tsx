import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Payment Solutions | Retail Bandhu",
  description: "Comprehensive payment solutions for your retail business",
}

export default function PaymentSolutionsPage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <Link href="/products" className="flex items-center text-sm text-muted-foreground mb-6 hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Payment Solutions</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Accept payments through multiple channels, manage invoices, and reconcile accounts with ease.
          </p>

          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Multiple Payment Methods</h3>
                <p className="text-muted-foreground">Accept UPI, cash on delivery, credit cards, and more.</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Automated Invoicing</h3>
                <p className="text-muted-foreground">Generate and send invoices automatically.</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Payment Reconciliation</h3>
                <p className="text-muted-foreground">Automatically reconcile payments with orders.</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Secure Transactions</h3>
                <p className="text-muted-foreground">Industry-standard security for all payment transactions.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>

        <div className="relative h-[300px] md:h-[500px] rounded-lg overflow-hidden">
          <Image src="/payment-processing.png" alt="Payment Solutions" fill className="object-cover" priority />
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-6">Payment Options</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-muted/50 p-6 rounded-lg">
            <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-xl font-medium mb-2">UPI Payments</h3>
            <p className="text-muted-foreground">Accept payments via UPI for instant transfers.</p>
          </div>

          <div className="bg-muted/50 p-6 rounded-lg">
            <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="text-xl font-medium mb-2">Cash on Delivery</h3>
            <p className="text-muted-foreground">Manage and track cash payments with our COD system.</p>
          </div>

          <div className="bg-muted/50 p-6 rounded-lg">
            <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="text-xl font-medium mb-2">Credit/Debit Cards</h3>
            <p className="text-muted-foreground">Securely process card payments through our platform.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
