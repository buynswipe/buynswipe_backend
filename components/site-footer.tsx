import Link from "next/link"
import { Store } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-12 md:px-6 md:py-16 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Store className="h-6 w-6" />
              <span className="font-bold text-xl">Retail Bandhu</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Connecting retailers and wholesalers across India with our comprehensive FMCG business management
              platform.
            </p>
            <div className="flex gap-4">
              <Link href="https://facebook.com" className="text-muted-foreground hover:text-primary">
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
              <Link href="https://twitter.com" className="text-muted-foreground hover:text-primary">
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
              <Link href="https://instagram.com" className="text-muted-foreground hover:text-primary">
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
              <Link href="https://linkedin.com" className="text-muted-foreground hover:text-primary">
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
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/products/inventory-management" className="hover:text-primary">
                  Inventory Management
                </Link>
              </li>
              <li>
                <Link href="/products/order-processing" className="hover:text-primary">
                  Order Processing
                </Link>
              </li>
              <li>
                <Link href="/products/delivery-tracking" className="hover:text-primary">
                  Delivery Tracking
                </Link>
              </li>
              <li>
                <Link href="/products/payment-solutions" className="hover:text-primary">
                  Payment Solutions
                </Link>
              </li>
              <li>
                <Link href="/products/analytics-reports" className="hover:text-primary">
                  Analytics & Reports
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/resources/documentation" className="hover:text-primary">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/resources/tutorials" className="hover:text-primary">
                  Tutorials
                </Link>
              </li>
              <li>
                <Link href="/resources/blog" className="hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/resources/case-studies" className="hover:text-primary">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="/resources/support" className="hover:text-primary">
                  Support Center
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/company/about" className="hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/company/careers" className="hover:text-primary">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/company/press" className="hover:text-primary">
                  Press
                </Link>
              </li>
              <li>
                <Link href="/company/privacy-policy" className="hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/company/terms-of-service" className="hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Retail Bandhu. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
