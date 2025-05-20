"use client"

import { Box, BarChart, Truck, CreditCard, LineChart } from "lucide-react"
import Image from "next/image"

export function FeaturesPage() {
  const features = [
    {
      id: "inventory",
      title: "Inventory Management",
      description:
        "Keep track of your inventory in real-time. Set up automatic reorder points, manage stock levels, and eliminate stockouts with our powerful inventory management system.",
      icon: Box,
      image: "/inventory-management.png",
    },
    {
      id: "orders",
      title: "Order Processing",
      description:
        "Streamline your order processing workflow. Place orders with wholesalers, track order status, and manage fulfillment all in one place.",
      icon: BarChart,
      image: "/order-processing.png",
    },
    {
      id: "delivery",
      title: "Delivery Tracking",
      description:
        "Track your deliveries in real-time. Get notifications on delivery status, share tracking information with customers, and ensure timely deliveries.",
      icon: Truck,
      image: "/delivery-tracking.png",
    },
    {
      id: "payments",
      title: "Payment Solutions",
      description:
        "Secure and flexible payment options. Accept multiple payment methods, manage transactions, and reconcile accounts with ease.",
      icon: CreditCard,
      image: "/payment-solutions.png",
    },
    {
      id: "analytics",
      title: "Analytics & Reports",
      description:
        "Gain insights into your business performance. Generate detailed reports, analyze sales trends, and make data-driven decisions.",
      icon: LineChart,
      image: "/analytics-reports.png",
    },
  ]

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Your Retail Business</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Retail Bandhu offers a comprehensive suite of features designed to streamline your retail operations and boost
          efficiency.
        </p>
      </div>

      <div className="space-y-24">
        {features.map((feature, index) => (
          <section key={feature.id} id={feature.id} className="scroll-mt-20">
            <div
              className={`flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-8 items-center`}
            >
              <div className="md:w-1/2">
                <div className="inline-flex items-center rounded-lg bg-primary/10 p-2 text-primary mb-4">
                  <feature.icon className="h-5 w-5" />
                  <span className="ml-2 text-sm font-medium">Feature {index + 1}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">{feature.title}</h2>
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {[1, 2, 3].map((item) => (
                    <li key={item} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-primary mr-2 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>
                        Benefit {item} of using {feature.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:w-1/2 relative h-[300px] w-full rounded-lg overflow-hidden shadow-lg">
                <Image src={feature.image || "/placeholder.svg"} alt={feature.title} fill className="object-cover" />
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-24 bg-primary/5 rounded-xl p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to transform your retail business?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of retailers and wholesalers who have streamlined their operations with Retail Bandhu.
        </p>
        <a
          href="/register"
          className="bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          Get Started Free
        </a>
      </div>
    </div>
  )
}
