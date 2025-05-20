import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, Newspaper, Shield, FileText, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Company | Retail Bandhu",
  description: "Learn about Retail Bandhu company",
}

export default function CompanyPage() {
  const companyPages = [
    {
      title: "About Us",
      description: "Learn about our mission to transform retail operations across India.",
      icon: <Users className="h-8 w-8" />,
      href: "/company/about",
    },
    {
      title: "Careers",
      description: "Join our team and help us build the future of retail technology.",
      icon: <Briefcase className="h-8 w-8" />,
      href: "/company/careers",
    },
    {
      title: "Press",
      description: "Latest news and media coverage about Retail Bandhu.",
      icon: <Newspaper className="h-8 w-8" />,
      href: "/company/press",
    },
    {
      title: "Privacy Policy",
      description: "Learn how we collect, use, and protect your information.",
      icon: <Shield className="h-8 w-8" />,
      href: "/company/privacy-policy",
    },
    {
      title: "Terms of Service",
      description: "Please read these terms carefully before using our platform.",
      icon: <FileText className="h-8 w-8" />,
      href: "/company/terms-of-service",
    },
  ]

  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Company</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Learn more about Retail Bandhu, our mission, and our team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companyPages.map((page) => (
          <Card key={page.title} className="flex flex-col">
            <CardHeader>
              <div className="mb-4 text-primary">{page.icon}</div>
              <CardTitle>{page.title}</CardTitle>
              <CardDescription>{page.description}</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto pt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href={page.href} className="flex items-center justify-between">
                  <span>View</span>
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
