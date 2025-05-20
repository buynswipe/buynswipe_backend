"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"

// Client component for authenticated user greeting
function AuthenticatedGreeting() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/status")
        const data = await res.json()

        if (data.authenticated) {
          setUser(data)
        }
      } catch (error) {
        console.error("Error checking auth status:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) return null

  if (!user) return null

  return (
    <div className="bg-primary/10 p-4 rounded-lg mb-6">
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
    <div className="flex flex-col">
      <main>
        {/* Hero Section */}
        <section className="py-12 md:py-24 lg:py-32 xl:py-40">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Connecting Retailers and Wholesalers Across India
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Streamline your FMCG retail business with our comprehensive platform for inventory management, order
                  processing, and delivery tracking.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/register">Start Free Trial</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/features">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[600px] aspect-video overflow-hidden rounded-xl border shadow-xl">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Photo%20of%20a%20smiling%20Kirana%20owner%20with%20the%20Retal%20Bandhu%20app..jpg-pDNZw4FBkwgr64cFaurbj7f67tv3za.jpeg"
                    alt="Retail store owner using the Retail Bandhu app on a tablet"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
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

        {/* Benefits Section */}
        <section id="benefits" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Benefits for Your FMCG Business
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Why businesses across India choose Retail Bandhu
                </p>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 mt-12">
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">For Retailers</h3>
                    <ul className="mt-2 space-y-2 text-gray-500 dark:text-gray-400">
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                        <span>Access to a wide network of wholesalers</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                        <span>Simplified order management</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                        <span>Real-time delivery tracking</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                        <span>Reduced paperwork and manual processes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                        <span>Better inventory management</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">For Wholesalers</h3>
                    <ul className="mt-2 space-y-2 text-gray-500 dark:text-gray-400">
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                        <span>Expanded customer base</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                        <span>Streamlined order fulfillment</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                        <span>Reduced payment collection hassles</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                        <span>Better inventory planning</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                        <span>Increased sales and revenue</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">For Delivery Partners</h3>
                    <ul className="mt-2 space-y-2 text-gray-500 dark:text-gray-400">
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                        <span>Easy-to-use delivery management system</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                        <span>Real-time order updates</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                        <span>Efficient route planning</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                        <span>Transparent earnings tracking</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                        <span>Simplified proof of delivery</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Business Growth</h3>
                    <ul className="mt-2 space-y-2 text-gray-500 dark:text-gray-400">
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                        <span>Increased operational efficiency</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                        <span>Reduced costs and overheads</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                        <span>Better customer satisfaction</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                        <span>Data-driven business decisions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                        <span>Scalable solution for growing businesses</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 text-center">
              <Link href="/benefits" passHref>
                <Button variant="outline">View All Benefits</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Users Say</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Hear from businesses that have transformed their operations with Retail Bandhu
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              <div className="flex flex-col justify-between space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 text-yellow-500"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    "Retail Bandhu has completely transformed how we manage our FMCG retail store. Inventory management
                    is now a breeze, and we've reduced stockouts by 60%."
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-gray-100 p-1 dark:bg-gray-800">
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Rajesh Kumar</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ganesh General Store, Delhi</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 text-yellow-500"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    "As a wholesaler, Retail Bandhu has helped us expand our customer base significantly. The order
                    management system is intuitive and has reduced our processing time by 40%."
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-gray-100 p-1 dark:bg-gray-800">
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Priya Sharma</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Mega Wholesale Supplies, Mumbai</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 text-yellow-500"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    "The delivery tracking system is fantastic! As a delivery partner, I can easily manage my
                    deliveries, update statuses, and track my earnings all in one place."
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-gray-100 p-1 dark:bg-gray-800">
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Amit Patel</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Swift Delivery Services, Bangalore</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 text-center">
              <Link href="/testimonials" passHref>
                <Button variant="outline">Read More Testimonials</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-24 lg:py-32 bg-primary/5">
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
