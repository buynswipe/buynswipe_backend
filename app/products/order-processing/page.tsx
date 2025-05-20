import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Order Processing | Retail Bandhu",
  description: "Streamline your order processing with Retail Bandhu's comprehensive solution",
}

export default function OrderProcessingPage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <Link href="/products" className="flex items-center text-sm text-muted-foreground mb-6 hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Order Processing</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Streamline your order management with our comprehensive order processing solution.
          </p>

          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Automated Order Workflows</h3>
                <p className="text-muted-foreground">Reduce manual work with automated order processing workflows.</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Real-time Status Updates</h3>
                <p className="text-muted-foreground">Track orders in real-time with instant status notifications.</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Seamless Inventory Integration</h3>
                <p className="text-muted-foreground">Automatically update inventory levels as orders are processed.</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Bulk Order Processing</h3>
                <p className="text-muted-foreground">Process multiple orders simultaneously to save time.</p>
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
          <Image src="/order-processing.png" alt="Order Processing Dashboard" fill className="object-cover" priority />
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-6">How It Works</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-muted/50 p-6 rounded-lg">
            <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-xl font-medium mb-2">Receive Orders</h3>
            <p className="text-muted-foreground">
              Orders are automatically received from multiple channels and consolidated.
            </p>
          </div>

          <div className="bg-muted/50 p-6 rounded-lg">
            <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="text-xl font-medium mb-2">Process & Fulfill</h3>
            <p className="text-muted-foreground">
              Orders are processed, inventory is updated, and fulfillment is initiated.
            </p>
          </div>

          <div className="bg-muted/50 p-6 rounded-lg">
            <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="text-xl font-medium mb-2">Track & Analyze</h3>
            <p className="text-muted-foreground">Monitor order status and analyze performance with detailed reports.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
