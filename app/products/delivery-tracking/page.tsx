import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Delivery Tracking | Retail Bandhu",
  description: "Track deliveries in real-time with Retail Bandhu's delivery tracking solution",
}

export default function DeliveryTrackingPage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <Link href="/products" className="flex items-center text-sm text-muted-foreground mb-6 hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Delivery Tracking</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Track your deliveries in real-time and provide customers with accurate delivery estimates.
          </p>

          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Real-time GPS Tracking</h3>
                <p className="text-muted-foreground">Monitor delivery partner locations in real-time.</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Route Optimization</h3>
                <p className="text-muted-foreground">Optimize delivery routes to save time and fuel.</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Delivery Status Updates</h3>
                <p className="text-muted-foreground">Automatic status updates at each stage of the delivery process.</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Proof of Delivery</h3>
                <p className="text-muted-foreground">Capture signatures, photos, and notes as proof of delivery.</p>
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
          <Image src="/delivery-tracking.png" alt="Delivery Tracking System" fill className="object-cover" priority />
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-6">Key Features</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-muted/50 p-6 rounded-lg">
            <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-xl font-medium mb-2">Live Tracking</h3>
            <p className="text-muted-foreground">Track delivery partners in real-time on an interactive map.</p>
          </div>

          <div className="bg-muted/50 p-6 rounded-lg">
            <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="text-xl font-medium mb-2">Delivery Analytics</h3>
            <p className="text-muted-foreground">Analyze delivery performance with comprehensive reports.</p>
          </div>

          <div className="bg-muted/50 p-6 rounded-lg">
            <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="text-xl font-medium mb-2">Customer Notifications</h3>
            <p className="text-muted-foreground">Automatically notify customers about delivery status changes.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
