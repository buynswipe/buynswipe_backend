import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Store, ClipboardList, Clock, CheckCircle } from "@/components/icons"

export const metadata = {
  title: "Features - Retail Bandhu",
  description: "Explore the powerful features of Retail Bandhu for FMCG businesses",
}

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col">
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
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Powerful Features for Your FMCG Business
                </h1>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Everything you need to manage your retail business efficiently
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <div className="space-y-4">
                  <div className="inline-block rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Inventory Management</h2>
                  <p className="text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                    Our comprehensive inventory management system helps you keep track of your stock levels, set alerts
                    for low inventory, and manage your product catalog with ease.
                  </p>
                </div>
                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Real-time Stock Updates</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Keep track of your inventory in real-time with automatic updates as products are sold or
                        restocked.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Low Stock Alerts</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Set custom thresholds for low stock alerts to ensure you never run out of popular products.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Batch Tracking</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Track product batches, expiry dates, and manufacturing information for better inventory control.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <Link href="/features/inventory-management" passHref>
                    <Button variant="outline">Learn More</Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <img
                  src="/inventory-management.png"
                  alt="Inventory management dashboard showing stock levels and alerts"
                  width={550}
                  height={400}
                  className="rounded-lg object-cover border shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="order-2 lg:order-1 relative">
                <img
                  src="/order-processing.png"
                  alt="Order processing system showing order creation and management"
                  width={550}
                  height={400}
                  className="rounded-lg object-cover border shadow-lg"
                />
              </div>
              <div className="order-1 lg:order-2">
                <div className="space-y-4">
                  <div className="inline-block rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                    <ClipboardList className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Order Processing</h2>
                  <p className="text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                    Create, manage, and track orders from placement to delivery with our intuitive order processing
                    system.
                  </p>
                </div>
                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Streamlined Order Creation</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Create orders quickly with our user-friendly interface and product search functionality.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Order Status Tracking</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Track orders through every stage of the fulfillment process with real-time status updates.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Bulk Order Management</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Process multiple orders simultaneously with our bulk order management tools.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <Link href="/features/order-processing" passHref>
                    <Button variant="outline">Learn More</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <div className="space-y-4">
                  <div className="inline-block rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Delivery Tracking</h2>
                  <p className="text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                    Monitor deliveries in real-time with our advanced tracking system designed specifically for FMCG
                    delivery partners.
                  </p>
                </div>
                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Real-time Location Tracking</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Track delivery partners in real-time to ensure timely deliveries and route optimization.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Proof of Delivery</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Capture signatures, photos, and notes as proof of delivery for better accountability.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Delivery Analytics</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Analyze delivery performance metrics to identify bottlenecks and improve efficiency.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <Link href="/features/delivery-tracking" passHref>
                    <Button variant="outline">Learn More</Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <img
                  src="/delivery-tracking.png"
                  alt="Delivery tracking interface showing real-time location and status updates"
                  width={550}
                  height={400}
                  className="rounded-lg object-cover border shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

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
      </main>

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
              <h3 className="text-lg font-bold">Features</h3>
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
                  <Link href="/blog" className="hover:underline">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:underline">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
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
                <li>
                  <Link href="/cookie-policy" className="hover:underline">
                    Cookie Policy
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
    </div>
  )
}
