import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, BookOpen, Newspaper, BarChart2, LifeBuoy, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Resources | Retail Bandhu",
  description: "Resources and support for Retail Bandhu platform",
}

export default function ResourcesPage() {
  const resources = [
    {
      title: "Documentation",
      description: "Comprehensive guides and reference materials for the Retail Bandhu platform.",
      icon: <FileText className="h-8 w-8" />,
      href: "/resources/documentation",
    },
    {
      title: "Tutorials",
      description: "Step-by-step tutorials to help you get the most out of Retail Bandhu.",
      icon: <BookOpen className="h-8 w-8" />,
      href: "/resources/tutorials",
    },
    {
      title: "Blog",
      description: "Latest news, updates, and insights from the Retail Bandhu team.",
      icon: <Newspaper className="h-8 w-8" />,
      href: "/resources/blog",
    },
    {
      title: "Case Studies",
      description: "Real-world examples of how businesses are using Retail Bandhu to transform their operations.",
      icon: <BarChart2 className="h-8 w-8" />,
      href: "/resources/case-studies",
    },
    {
      title: "Support Center",
      description: "Get help with any issues you encounter while using Retail Bandhu.",
      icon: <LifeBuoy className="h-8 w-8" />,
      href: "/resources/support",
    },
  ]

  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Resources</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Explore our resources to learn more about Retail Bandhu and how to make the most of our platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <Card key={resource.title} className="flex flex-col">
            <CardHeader>
              <div className="mb-4 text-primary">{resource.icon}</div>
              <CardTitle>{resource.title}</CardTitle>
              <CardDescription>{resource.description}</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto pt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href={resource.href} className="flex items-center justify-between">
                  <span>Explore</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
