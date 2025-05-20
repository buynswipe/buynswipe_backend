"use client"

import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function BenefitsPage() {
  const benefits = [
    {
      title: "Streamlined Inventory Management",
      description:
        "Keep track of your stock levels in real-time, set automatic reorder points, and eliminate stockouts.",
      icon: CheckCircle,
    },
    {
      title: "Efficient Order Processing",
      description: "Place and manage orders with wholesalers seamlessly, reducing paperwork and manual errors.",
      icon: CheckCircle,
    },
    {
      title: "Real-time Delivery Tracking",
      description: "Track your orders from dispatch to delivery with real-time updates and notifications.",
      icon: CheckCircle,
    },
    {
      title: "Secure Payment Solutions",
      description: "Multiple payment options with secure transaction processing and automatic reconciliation.",
      icon: CheckCircle,
    },
    {
      title: "Comprehensive Analytics",
      description: "Gain insights into your business performance with detailed reports and analytics.",
      icon: CheckCircle,
    },
    {
      title: "Mobile Accessibility",
      description: "Access your business data anytime, anywhere with our mobile-responsive platform.",
      icon: CheckCircle,
    },
  ]

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Benefits of Retail Bandhu</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Our platform offers numerous advantages to retailers and wholesalers, streamlining operations and boosting
          efficiency.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start mb-4">
              <benefit.icon className="h-6 w-6 text-primary mr-2 flex-shrink-0" />
              <h3 className="text-xl font-semibold">{benefit.title}</h3>
            </div>
            <p className="text-muted-foreground">{benefit.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-primary/5 rounded-xl p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to transform your retail business?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of retailers and wholesalers who have streamlined their operations with Retail Bandhu.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/register">Get Started Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/contact">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
