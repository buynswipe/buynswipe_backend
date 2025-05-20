import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, BookOpen, Video, FileText, ArrowRight } from "lucide-react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Tutorials | Retail Bandhu",
  description: "Step-by-step tutorials to help you get the most out of Retail Bandhu",
}

export default function TutorialsPage() {
  const tutorials = [
    {
      title: "Getting Started with Retail Bandhu",
      description: "Learn the basics of setting up your Retail Bandhu account and navigating the platform.",
      type: "Video",
      duration: "10 min",
      icon: <Video className="h-5 w-5" />,
      href: "/resources/tutorials/getting-started",
    },
    {
      title: "Managing Your Inventory",
      description: "A comprehensive guide to managing your inventory with Retail Bandhu.",
      type: "Guide",
      duration: "15 min",
      icon: <FileText className="h-5 w-5" />,
      href: "/resources/tutorials/inventory-management",
    },
    {
      title: "Processing Orders",
      description: "Learn how to efficiently process and fulfill orders using Retail Bandhu.",
      type: "Video",
      duration: "12 min",
      icon: <Video className="h-5 w-5" />,
      href: "/resources/tutorials/processing-orders",
    },
    {
      title: "Setting Up Payment Methods",
      description: "Configure different payment methods for your customers.",
      type: "Guide",
      duration: "8 min",
      icon: <FileText className="h-5 w-5" />,
      href: "/resources/tutorials/payment-setup",
    },
    {
      title: "Tracking Deliveries",
      description: "Learn how to track deliveries and manage delivery partners.",
      type: "Video",
      duration: "14 min",
      icon: <Video className="h-5 w-5" />,
      href: "/resources/tutorials/delivery-tracking",
    },
    {
      title: "Generating Reports",
      description: "Create custom reports to gain insights into your business performance.",
      type: "Guide",
      duration: "10 min",
      icon: <FileText className="h-5 w-5" />,
      href: "/resources/tutorials/reports",
    },
  ]

  return (
    <div className="container py-12 px-4 md:px-6">
      <Link href="/resources" className="flex items-center text-sm text-muted-foreground mb-6 hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Resources
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Tutorials</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Step-by-step tutorials to help you get the most out of Retail Bandhu. Browse our collection of guides and
          videos to learn how to use all the features of our platform.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tutorials.map((tutorial) => (
          <Card key={tutorial.title} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-muted-foreground">
                  {tutorial.icon}
                  <span className="ml-2 text-sm">{tutorial.type}</span>
                </div>
                <span className="text-sm text-muted-foreground">{tutorial.duration}</span>
              </div>
              <CardTitle>{tutorial.title}</CardTitle>
              <CardDescription>{tutorial.description}</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto pt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href={tutorial.href} className="flex items-center justify-between">
                  <span>View Tutorial</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 bg-muted/50 p-8 rounded-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            <BookOpen className="h-10 w-10 text-primary mr-4" />
            <div>
              <h2 className="text-2xl font-bold">Need more help?</h2>
              <p className="text-muted-foreground">
                Check out our comprehensive documentation or contact our support team.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild variant="outline">
              <Link href="/resources/documentation">View Documentation</Link>
            </Button>
            <Button asChild>
              <Link href="/resources/support">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
