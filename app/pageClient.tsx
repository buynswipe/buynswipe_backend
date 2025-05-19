"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Store, ClipboardList, Clock, AlertTriangle } from "@/components/icons"
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
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Store className="h-6 w-6" />
            <Link href="/">Retail Bandhu</Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="/benefits" className="text-sm font-medium hover:underline underline-offset-4">
              Benefits
            </Link>
            <Link href="/testimonials" className="text-sm font-medium hover:underline underline-offset-4">
              Testimonials
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:underline underline-offset-4">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium hover:underline underline-offset-4 hidden sm:inline-block"
            >
              Login
            </Link>
            <Link href="/register" passHref>
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
          <div className="container px-4 md:px-6">
            <AuthenticatedGreeting />
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                    Connecting Retailers and Wholesalers Across India
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                    Streamline your FMCG retail business with our comprehensive platform for inventory management, order
                    processing, and delivery tracking.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register" passHref>
                    <Button size="lg" className="px-8">
                      Start Free Trial
                    </Button>
                  </Link>
                  <Link href="/features" passHref>
                    <Button size="lg" variant="outline" className="px-8">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:mx-0 relative">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MQGm0dmm0duZOnmf6kcmrqZptAGcnc.png"
                  alt="Retail Bandhu workflow showing retailers connecting with wholesalers and delivery partners in a unified digital ecosystem"
                  width={550}
                  height={400}
                  className="rounded-lg object-contain border shadow-lg"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Powerful Features for Your FMCG Business
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Everything you need to manage your retail business efficiently
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Inventory Management</h3>
                <p className="text-sm text-gray-500 text-center dark:text-gray-400">
                  Track stock levels, set alerts for low inventory, and manage product catalogs with ease.
                </p>
                <Link href="/features/inventory-management" className="text-primary text-sm mt-2 hover:underline">
                  Learn more →
                </Link>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="p-2 bg-primary/10 rounded-full">
                  <ClipboardList className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Order Processing</h3>
                <p className="text-sm text-gray-500 text-center dark:text-gray-400">
                  Create, manage, and track orders from placement to delivery with real-time updates.
                </p>
                <Link href="/features/order-processing" className="text-primary text-sm mt-2 hover:underline">
                  Learn more →
                </Link>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Delivery Tracking</h3>
                <p className="text-sm text-gray-500 text-center dark:text-gray-400">
                  Monitor deliveries in real-time with our advanced tracking system for delivery partners.
                </p>
                <Link href="/features/delivery-tracking" className="text-primary text-sm mt-2 hover:underline">
                  Learn more →
                </Link>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="p-2 bg-primary/10 rounded-full">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Payment Management</h3>
                <p className="text-sm text-gray-500 text-center dark:text-gray-400">
                  Process payments securely with multiple options including UPI, COD, and online transfers.
                </p>
                <Link href="/features/payment-management" className="text-primary text-sm mt-2 hover:underline">
                  Learn more →
                </Link>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="p-2 bg-primary/10 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Alerts & Notifications</h3>
                <p className="text-sm text-gray-500 text-center dark:text-gray-400">
                  Stay informed with real-time alerts for inventory, orders, and delivery updates.
                </p>
                <Link href="/features/alerts-notifications" className="text-primary text-sm mt-2 hover:underline">
                  Learn more →
                </Link>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="p-2 bg-primary/10 rounded-full">
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
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Analytics & Reports</h3>
                <p className="text-sm text-gray-500 text-center dark:text-gray-400">
                  Gain insights with comprehensive analytics and reports to make data-driven decisions.
                </p>
                <Link href="/features/analytics-reports" className="text-primary text-sm mt-2 hover:underline">
                  Learn more →
                </Link>
              </div>
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
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Transform Your FMCG Business?
                </h2>
                <p className="max-w-[600px] text-primary-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of businesses across India that are growing with Retail Bandhu
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register" passHref>
                  <Button size="lg" variant="secondary" className="px-8">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/contact" passHref>
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Get in Touch</h2>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                    Have questions? Our team is here to help you get started with Retail Bandhu.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
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
                      className="h-6 w-6 text-primary"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <div>
                      <h3 className="text-xl font-bold">Phone</h3>
                      <p className="text-gray-500 dark:text-gray-400">+91 98765 43210</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
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
                      className="h-6 w-6 text-primary"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <div>
                      <h3 className="text-xl font-bold">Email</h3>
                      <p className="text-gray-500 dark:text-gray-400">info@retailbandhu.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
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
                      className="h-6 w-6 text-primary"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <div>
                      <h3 className="text-xl font-bold">Address</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        123 Tech Park, Sector 5<br />
                        Bangalore, Karnataka 560001
                        <br />
                        India
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm">
                <form className="space-y-4" action="/api/contact" method="POST">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="first-name"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        First name
                      </label>
                      <input
                        id="first-name"
                        name="first-name"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="last-name"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Last name
                      </label>
                      <input
                        id="last-name"
                        name="last-name"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Phone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="business-type"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Business Type
                    </label>
                    <select
                      id="business-type"
                      name="business-type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">Select your business type</option>
                      <option value="retailer">Retailer</option>
                      <option value="wholesaler">Wholesaler</option>
                      <option value="delivery-partner">Delivery Partner</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter your message"
                      required
                    ></textarea>
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full border-t bg-background py-6 md:py-12">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-bold text-xl">
                  <Store className="h-6 w-6" />
                  <Link href="/">Retail Bandhu</Link>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Connecting retailers and wholesalers across India with our comprehensive FMCG business management
                  platform.
                </p>
                <div className="flex gap-4">
                  <Link href="https://facebook.com" className="text-gray-500 hover:text-primary dark:text-gray-400">
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
                      className="h-5 w-5"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                    <span className="sr-only">Facebook</span>
                  </Link>
                  <Link href="https://twitter.com" className="text-gray-500 hover:text-primary dark:text-gray-400">
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
                      className="h-5 w-5"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                    <span className="sr-only">Twitter</span>
                  </Link>
                  <Link href="https://instagram.com" className="text-gray-500 hover:text-primary dark:text-gray-400">
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
                      className="h-5 w-5"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    <span className="sr-only">Instagram</span>
                  </Link>
                  <Link href="https://linkedin.com" className="text-gray-500 hover:text-primary dark:text-gray-400">
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
                      className="h-5 w-5"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect width="4" height="12" x="2" y="9" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                    <span className="sr-only">LinkedIn</span>
                  </Link>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Products</h3>
                <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <li>
                    <Link href="/features/inventory-management" className="hover:underline">
                      Inventory Management
                    </Link>
                  </li>
                  <li>
                    <Link href="/features/order-processing" className="hover:underline">
                      Order Processing
                    </Link>
                  </li>
                  <li>
                    <Link href="/features/delivery-tracking" className="hover:underline">
                      Delivery Tracking
                    </Link>
                  </li>
                  <li>
                    <Link href="/features/payment-management" className="hover:underline">
                      Payment Solutions
                    </Link>
                  </li>
                  <li>
                    <Link href="/features/analytics-reports" className="hover:underline">
                      Analytics & Reports
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Resources</h3>
                <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <li>
                    <Link href="/documentation" className="hover:underline">
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link href="/tutorials" className="hover:underline">
                      Tutorials
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="hover:underline">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="/case-studies" className="hover:underline">
                      Case Studies
                    </Link>
                  </li>
                  <li>
                    <Link href="/support" className="hover:underline">
                      Support Center
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Company</h3>
                <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <li>
                    <Link href="/about" className="hover:underline">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/careers" className="hover:underline">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link href="/press" className="hover:underline">
                      Press
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy-policy" className="hover:underline">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms-of-service" className="hover:underline">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 border-t pt-8 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>© {new Date().getFullYear()} Retail Bandhu. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
