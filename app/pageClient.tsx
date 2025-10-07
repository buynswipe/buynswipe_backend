"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"
import FeatureCard from "./FeatureCard"

// Client component for authenticated user greeting
function AuthenticatedGreeting() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/status")
        if (!res.ok) throw new Error("status not ok")
        const data = await res.json()
        if (data?.authenticated) setUser(data)
      } catch {
        // ignore errors in preview
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  if (loading || !user) return null

  return (
    <div className="mb-6 rounded-lg bg-primary/10 p-4">
      <p className="font-medium">
        Welcome back, {user.profile?.first_name || "User"}!
        <Link
          href={
            user.profile?.role === "delivery_partner"
              ? "/delivery-partner/dashboard"
              : user.profile?.role === "wholesaler"
                ? "/wholesaler-dashboard"
                : "/dashboard/main"
          }
          className="ml-2 underline"
        >
          Go to your dashboard
        </Link>
      </p>
    </div>
  )
}

export default function HomePageClient() {
  return (
    <div className="w-full flex flex-col">
      <main>
        {/* Optional greeting for signed-in users */}
        <div className="container mx-auto max-w-6xl px-6 pt-6">
          <AuthenticatedGreeting />
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden bg-[#3a0ca3] text-white">
          <div className="container mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-6 py-16 md:grid-cols-2 md:py-24">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Live for Retailers & Wholesalers
              </div>
              <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">Retail Bandhu</h1>
              <p className="text-white/90 md:text-lg">
                Digitizing India’s FMCG supply chain. Connecting Retailers, Wholesalers and Delivery Partners with
                transparent pricing, fast deliveries, and actionable insights.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild className="bg-orange-500 hover:bg-orange-600">
                  <Link href="/register">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white hover:text-[#3a0ca3]"
                >
                  <Link href="/features">Explore Features</Link>
                </Button>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/450618361911.jpg-W7H45wbGBzkZoqYSBHtGKLj21fAEz4.png"
                  alt="Retail Bandhu Icon"
                  className="h-10 w-10 rounded"
                />
                <span className="text-sm text-white/80">Aapke Vyapar Ka Saathi</span>
              </div>
            </div>

            {/* Right visual banner (provided source URL) */}
            <div className="relative">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Your%20paragraph%20text%282%29-HctM9yz71J3aQSYZj5GBUg94BKvQE6.png"
                alt="Retail Bandhu Branding Banner"
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Highlights using FeatureCard */}
        <section className="container mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FeatureCard
              title="Wholesale Sourcing"
              desc="Transparent pricing from trusted suppliers with digital catalogues."
              imageSrc="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Retail%20Bandhu%20Icon-UTC7N2g2VekiBnTd3BPQpxy6SJtc59.png"
            />
            <FeatureCard
              title="Delivery & Logistics"
              desc="Verified delivery partners, status tracking and proof of delivery."
              imageSrc="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20250909-WA0045-removebg-preview-SubVFN3Q1zu3XfNFT2FGfv9AVlEIS7.png"
            />
            <FeatureCard
              title="Payments & Analytics"
              desc="Flexible payment options and insights to grow your business."
              imageSrc="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Generated%20Image%20September%2017%2C%202025%20-%205_11PM-bhsq3U9HpYO8Esba0Tzvq3uafeQWCT.png"
            />
          </div>
        </section>

        {/* Truck strip */}
        <section className="bg-slate-50 py-10">
          <div className="container mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 md:flex-row">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Dukaan se Dil Tak</h2>
              <p className="mt-2 text-slate-600">One platform for procurement, logistics and finance.</p>
              <div className="mt-4">
                <Button asChild>
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/RETAIL%20BANDHU%20DELIVERY-LXo1nuikO6AP02VOfBeZrjyRDSLrDP.jpg"
                alt="Retail Bandhu Delivery Vehicle"
                className="w-full rounded-lg shadow-sm"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/40 py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <span>Key Features</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Everything You Need to Manage Your Retail Business
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform offers a comprehensive suite of features designed to streamline your retail operations
                  and boost efficiency.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Inventory Management",
                  description: "Keep track of your stock levels in real-time and set automatic reorder points.",
                  href: "/features#inventory",
                },
                {
                  title: "Order Processing",
                  description: "Place and manage orders with wholesalers seamlessly, reducing paperwork.",
                  href: "/features#orders",
                },
                {
                  title: "Delivery Tracking",
                  description: "Track your orders from dispatch to delivery with real-time updates.",
                  href: "/features#delivery",
                },
                {
                  title: "Payment Solutions",
                  description: "Multiple payment options with secure transaction processing.",
                  href: "/features#payments",
                },
                {
                  title: "Analytics & Reports",
                  description: "Gain insights into your business performance with detailed reports.",
                  href: "/features#analytics",
                },
                {
                  title: "Mobile Accessibility",
                  description: "Access your business data anytime, anywhere with our mobile-responsive platform.",
                  href: "/features",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-start gap-2 rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                  <Link
                    href={feature.href}
                    className="mt-auto inline-flex items-center text-sm font-medium text-primary"
                  >
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary/5 py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Ready to Transform Your Retail Business?
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of retailers and wholesalers who have streamlined their operations with Retail Bandhu.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <Link href="/register">Get Started Free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
