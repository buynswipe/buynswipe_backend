import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Case Studies | Retail Bandhu",
  description: "Real-world examples of how businesses are using Retail Bandhu",
}

export default function CaseStudiesPage() {
  const caseStudies = [
    {
      title: "How SuperMart Reduced Order Processing Time by 60%",
      description:
        "SuperMart, a chain of 50+ retail stores across North India, was struggling with order processing delays. Learn how they implemented Retail Bandhu to streamline their operations.",
      image: "/retail-dashboard.png",
      industry: "Supermarket Chain",
      results: [
        "60% reduction in order processing time",
        "30% increase in inventory turnover",
        "25% reduction in stockouts",
      ],
      href: "/resources/case-studies/supermart",
    },
    {
      title: "GrocerPlus: Transforming Delivery Operations",
      description:
        "GrocerPlus, an online grocery retailer, faced challenges with their delivery tracking and management. Discover how Retail Bandhu helped them optimize their delivery operations.",
      image: "/delivery-tracking.png",
      industry: "Online Grocery",
      results: [
        "45% improvement in on-time deliveries",
        "70% reduction in delivery-related customer complaints",
        "20% increase in delivery partner efficiency",
      ],
      href: "/resources/case-studies/grocerplus",
    },
    {
      title: "FastRetail's Journey to Streamlined Inventory Management",
      description:
        "FastRetail, a fashion retailer with 30 stores, was struggling with inventory management across multiple locations. See how Retail Bandhu provided a comprehensive solution.",
      image: "/inventory-management.png",
      industry: "Fashion Retail",
      results: [
        "40% reduction in inventory holding costs",
        "35% improvement in stock accuracy",
        "28% increase in sales due to better product availability",
      ],
      href: "/resources/case-studies/fastretail",
    },
    {
      title: "MegaDistributors: Connecting with 1000+ Retailers",
      description:
        "MegaDistributors, a large FMCG distributor, needed a better way to connect with their network of retailers. Learn how Retail Bandhu transformed their business model.",
      image: "/fmcg-supply-chain.png",
      industry: "FMCG Distribution",
      results: [
        "85% of retailers now place orders digitally",
        "50% reduction in order errors",
        "40% faster payment reconciliation",
      ],
      href: "/resources/case-studies/megadistributors",
    },
  ]

  return (
    <div className="container py-12 px-4 md:px-6">
      <Link href="/resources" className="flex items-center text-sm text-muted-foreground mb-6 hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Resources
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Case Studies</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Real-world examples of how businesses are using Retail Bandhu to transform their operations and drive growth.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {caseStudies.map((study) => (
          <Card key={study.title} className="flex flex-col overflow-hidden">
            <div className="relative h-48">
              <Image src={study.image || "/placeholder.svg"} alt={study.title} fill className="object-cover" />
            </div>
            <CardHeader>
              <div className="text-sm text-muted-foreground mb-2">Industry: {study.industry}</div>
              <CardTitle>{study.title}</CardTitle>
              <CardDescription>{study.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <h4 className="font-medium mb-2">Key Results:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {study.results.map((result, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    {result}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto pt-0">
              <Button asChild className="w-full">
                <Link href={study.href} className="flex items-center justify-center">
                  <span>Read Full Case Study</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 bg-muted/50 p-8 rounded-lg">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Want to become our next success story?</h2>
          <p className="text-muted-foreground mb-6">
            Join hundreds of businesses that have transformed their operations with Retail Bandhu.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
