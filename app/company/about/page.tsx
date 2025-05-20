import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "About Us - Retail Bandhu",
  description: "Learn about our mission to connect retailers and wholesalers across India",
}

export default function AboutPage() {
  return (
    <div className="container py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl/tight">About Retail Bandhu</h1>
          <p className="text-lg text-muted-foreground">
            Our mission is to transform the FMCG retail ecosystem in India
          </p>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <Image src="/diverse-group.png" alt="The Retail Bandhu team" fill className="object-cover" />
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Our Story</h2>
          <p className="text-muted-foreground">
            Retail Bandhu was founded in 2020 with a simple mission: to bridge the gap between retailers and wholesalers
            in India's fragmented FMCG market. Our founders, having spent years in the retail industry, recognized the
            inefficiencies and challenges faced by small and medium retailers in sourcing products, managing inventory,
            and handling logistics.
          </p>
          <p className="text-muted-foreground">
            What started as a simple digital catalog has evolved into a comprehensive platform that connects thousands
            of retailers with wholesalers across India, streamlining the entire supply chain process from order
            placement to delivery tracking.
          </p>
          <h2 className="text-2xl font-bold">Our Mission</h2>
          <p className="text-muted-foreground">
            We are on a mission to digitize and streamline India's retail ecosystem, making it more efficient,
            transparent, and accessible for all stakeholders. We believe that by empowering retailers with the right
            tools and connecting them directly with wholesalers, we can help them grow their businesses and better serve
            their communities.
          </p>
          <h2 className="text-2xl font-bold">Our Values</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              <strong>Simplicity:</strong> We believe in making complex processes simple and intuitive.
            </li>
            <li>
              <strong>Transparency:</strong> We foster trust through transparent pricing, clear communication, and
              honest business practices.
            </li>
            <li>
              <strong>Empowerment:</strong> We empower businesses of all sizes to thrive in the digital economy.
            </li>
            <li>
              <strong>Innovation:</strong> We continuously innovate to solve real-world problems faced by our users.
            </li>
            <li>
              <strong>Community:</strong> We build and nurture a community of retailers, wholesalers, and delivery
              partners.
            </li>
          </ul>
        </div>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
