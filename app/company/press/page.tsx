import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Press | Retail Bandhu",
  description: "Latest news and media coverage about Retail Bandhu",
}

export default function PressPage() {
  const pressReleases = [
    {
      title: "Retail Bandhu Raises $10M Series A to Transform FMCG Distribution in India",
      date: "May 10, 2023",
      excerpt:
        "Retail Bandhu, a leading B2B platform connecting retailers and wholesalers, has raised $10 million in Series A funding led by Accel Partners with participation from existing investors.",
      image: "/retail-network-digital-scm.png",
      href: "/company/press/series-a-funding",
    },
    {
      title: "Retail Bandhu Expands to 10 New Cities Across India",
      date: "April 5, 2023",
      excerpt:
        "Retail Bandhu announces expansion to 10 new cities across India, bringing its total coverage to 25 cities and over 50,000 retailers.",
      image: "/retail-dashboard.png",
      href: "/company/press/expansion",
    },
    {
      title: "Retail Bandhu Launches New Mobile App for Delivery Partners",
      date: "March 15, 2023",
      excerpt:
        "Retail Bandhu introduces a new mobile app for delivery partners, enabling real-time tracking, route optimization, and seamless communication.",
      image: "/delivery-tracking.png",
      href: "/company/press/delivery-app-launch",
    },
    {
      title: "Retail Bandhu Partners with Leading FMCG Brands to Streamline Distribution",
      date: "February 20, 2023",
      excerpt:
        "Retail Bandhu announces strategic partnerships with five leading FMCG brands to streamline distribution and improve market reach.",
      image: "/fmcg-supply-chain.png",
      href: "/company/press/fmcg-partnerships",
    },
  ]

  const mediaFeatures = [
    {
      title: "How Retail Bandhu is Digitizing India's FMCG Supply Chain",
      publication: "TechCrunch",
      date: "April 25, 2023",
      excerpt:
        "An in-depth look at how Retail Bandhu is using technology to transform India's traditional FMCG supply chain.",
      logo: "/placeholder-46fnv.png",
      href: "https://techcrunch.com",
    },
    {
      title: "The Future of Retail Distribution in India",
      publication: "Economic Times",
      date: "March 30, 2023",
      excerpt:
        "Retail Bandhu's CEO discusses the future of retail distribution in India and how technology is driving change.",
      logo: "/generic-business-newspaper-logo.png",
      href: "https://economictimes.com",
    },
    {
      title: "Retail Bandhu Named in Top 50 Startups to Watch",
      publication: "YourStory",
      date: "February 15, 2023",
      excerpt: "Retail Bandhu has been named one of the top 50 startups to watch in 2023 by YourStory.",
      logo: "/yourstory-logo.png",
      href: "https://yourstory.com",
    },
    {
      title: "How This Startup is Connecting Retailers and Wholesalers Across India",
      publication: "Inc42",
      date: "January 20, 2023",
      excerpt: "A feature on how Retail Bandhu is building a digital ecosystem for India's retail industry.",
      logo: "/placeholder.svg?height=40&width=120&query=Inc42 Logo",
      href: "https://inc42.com",
    },
  ]

  return (
    <div className="container py-12 px-4 md:px-6">
      <Link href="/company" className="flex items-center text-sm text-muted-foreground mb-6 hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Company
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Press</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Latest news and media coverage about Retail Bandhu. For press inquiries, please contact
          press@retailbandhu.com.
        </p>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Press Releases</h2>
        <div className="grid gap-8 md:grid-cols-2">
          {pressReleases.map((release) => (
            <Card key={release.title} className="flex flex-col overflow-hidden">
              <div className="relative h-48">
                <Image src={release.image || "/placeholder.svg"} alt={release.title} fill className="object-cover" />
              </div>
              <CardHeader>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{release.date}</span>
                </div>
                <CardTitle>{release.title}</CardTitle>
                <CardDescription>{release.excerpt}</CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto pt-0">
                <Button asChild variant="outline" className="w-full">
                  <Link href={release.href} className="flex items-center justify-between">
                    <span>Read Full Release</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Media Coverage</h2>
        <div className="space-y-6">
          {mediaFeatures.map((feature) => (
            <div key={feature.title} className="bg-muted/30 p-6 rounded-lg">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/6 flex items-center justify-center">
                  <Image
                    src={feature.logo || "/placeholder.svg"}
                    alt={feature.publication}
                    width={120}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div className="md:w-5/6">
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <span className="font-medium text-foreground">{feature.publication}</span>
                    <span className="mx-2">•</span>
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{feature.date}</span>
                  </div>
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.excerpt}</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href={feature.href} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <span>Read Article</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Press Kit</h2>
        <div className="bg-muted/30 p-6 rounded-lg">
          <p className="text-muted-foreground mb-6">
            Download our press kit for logos, product images, and company information.
          </p>
          <Button asChild>
            <Link href="/company/press/press-kit">Download Press Kit</Link>
          </Button>
        </div>
      </div>

      <div className="bg-muted/50 p-8 rounded-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Press Contact</h2>
            <p className="text-muted-foreground">For press inquiries, please contact our press team.</p>
          </div>
          <div className="space-y-2">
            <p className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 mr-2 text-primary"
              >
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              <span>press@retailbandhu.com</span>
            </p>
            <p className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 mr-2 text-primary"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>+91 1800-123-4567</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
