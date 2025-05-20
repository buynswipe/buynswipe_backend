import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Analytics & Reports | Retail Bandhu",
  description: "Gain insights into your business with Retail Bandhu's analytics and reporting tools",
}

export default function AnalyticsReportsPage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <Link href="/products" className="flex items-center text-sm text-muted-foreground mb-6 hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Analytics & Reports</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Gain valuable insights into your business performance with customizable reports and interactive dashboards.
          </p>

          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Interactive Dashboards</h3>
                <p className="text-muted-foreground">Visualize key metrics with customizable dashboards.</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Sales Analytics</h3>
                <p className="text-muted-foreground">
                  Track sales performance across products, regions, and time periods.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Inventory Reports</h3>
                <p className="text-muted-foreground">Monitor stock levels, turnover rates, and reorder points.</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Custom Report Builder</h3>
                <p className="text-muted-foreground">Create custom reports tailored to your specific business needs.</p>
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
          <Image
            src="/business-analytics-concept.png"
            alt="Analytics Dashboard"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-6">Key Analytics Features</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-muted/50 p-6 rounded-lg">
            <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-xl font-medium mb-2">Performance Metrics</h3>
            <p className="text-muted-foreground">
              Track KPIs like sales growth, inventory turnover, and profit margins.
            </p>
          </div>

          <div className="bg-muted/50 p-6 rounded-lg">
            <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="text-xl font-medium mb-2">Trend Analysis</h3>
            <p className="text-muted-foreground">Identify patterns and trends in your business data over time.</p>
          </div>

          <div className="bg-muted/50 p-6 rounded-lg">
            <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="text-xl font-medium mb-2">Export Capabilities</h3>
            <p className="text-muted-foreground">Export reports in multiple formats for further analysis.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
