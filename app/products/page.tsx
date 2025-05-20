import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Package, ShoppingCart, Truck, CreditCard, BarChart2, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Products | Retail Bandhu",
  description: "Products and solutions offered by Retail Bandhu",
}

export default function ProductsPage() {
  const products = [
    {
      title: "Inventory Management",
      description:
        "Streamline your inventory management with real-time tracking, automated reordering, and comprehensive reporting.",
      icon: <Package className="h-8 w-8" />,
      href: "/products/inventory-management",
      image: "/inventory-management.png",
    },
    {
      title: "Order Processing",
      description:
        "Simplify your order processing with automated workflows, real-time status updates, and seamless integration with your inventory.",
      icon: <ShoppingCart className="h-8 w-8" />,
      href: "/products/order-processing",
      image: "/order-processing.png",
    },
    {
      title: "Delivery Tracking",
      description:
        "Track your deliveries in real-time, optimize routes, and provide customers with accurate delivery estimates.",
      icon: <Truck className="h-8 w-8" />,
      href: "/products/delivery-tracking",
      image: "/delivery-tracking.png",
    },
    {
      title: "Payment Solutions",
      description: "Accept payments through multiple channels, manage invoices, and reconcile accounts with ease.",
      icon: <CreditCard className="h-8 w-8" />,
      href: "/products/payment-solutions",
      image: "/payment-processing.png",
    },
    {
      title: "Analytics & Reports",
      description: "Gain insights into your business performance with customizable reports and interactive dashboards.",
      icon: <BarChart2 className="h-8 w-8" />,
      href: "/products/analytics-reports",
      image: "/business-analytics-concept.png",
    },
  ]

  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Our Products</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Explore our comprehensive suite of products designed to streamline your retail operations.
        </p>
      </div>

      <div className="space-y-12">
        {products.map((product, index) => (
          <div
            key={product.title}
            className={`flex flex-col ${index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} gap-8 items-center`}
          >
            <div className="w-full md:w-1/2">
              <div className="relative h-[300px] w-full rounded-lg overflow-hidden">
                <Image src={product.image || "/placeholder.svg"} alt={product.title} fill className="object-cover" />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="text-primary mb-4">{product.icon}</div>
              <h2 className="text-3xl font-bold mb-4">{product.title}</h2>
              <p className="text-muted-foreground mb-6">{product.description}</p>
              <Button asChild>
                <Link href={product.href} className="flex items-center">
                  <span>Learn More</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
