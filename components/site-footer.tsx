import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Store } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="w-full border-t bg-background py-12 site-footer">
      <div className="container grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Store className="h-4 w-4 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-bold">Retail Bandhu</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Connecting retailers and wholesalers across India with our comprehensive FMCG business management platform.
          </p>
          <div className="mt-4 flex space-x-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-bold">Products</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/products/inventory-management"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Inventory Management
              </Link>
            </li>
            <li>
              <Link
                href="/products/order-processing"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Order Processing
              </Link>
            </li>
            <li>
              <Link
                href="/products/delivery-tracking"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Delivery Tracking
              </Link>
            </li>
            <li>
              <Link
                href="/products/payment-solutions"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Payment Solutions
              </Link>
            </li>
            <li>
              <Link
                href="/products/analytics-reports"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Analytics & Reports
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-bold">Resources</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/resources/documentation"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Documentation
              </Link>
            </li>
            <li>
              <Link
                href="/resources/tutorials"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Tutorials
              </Link>
            </li>
            <li>
              <Link href="/resources/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="/resources/case-studies"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Case Studies
              </Link>
            </li>
            <li>
              <Link href="/resources/support" className="text-muted-foreground hover:text-foreground transition-colors">
                Support Center
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-bold">Company</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/company/about" className="text-muted-foreground hover:text-foreground transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/company/careers" className="text-muted-foreground hover:text-foreground transition-colors">
                Careers
              </Link>
            </li>
            <li>
              <Link href="/company/press" className="text-muted-foreground hover:text-foreground transition-colors">
                Press
              </Link>
            </li>
            <li>
              <Link
                href="/company/privacy-policy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/company/terms-of-service"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
        © 2025 Retail Bandhu. All rights reserved.
      </div>
    </footer>
  )
}
