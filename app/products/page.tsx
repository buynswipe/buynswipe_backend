import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, ShoppingCart, Truck, CreditCard, BarChart2, ArrowRight, CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Products | Retail Bandhu",
  description: "Comprehensive retail management solutions for modern businesses",
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
      features: [
        "Real-time stock tracking",
        "Automated reorder alerts",
        "Multi-location inventory",
        "Barcode scanning",
        "Stock movement history",
      ],
      pricing: "Starting at ₹999/month",
    },
    {
      title: "Order Processing",
      description:
        "Simplify your order processing with automated workflows, real-time status updates, and seamless integration.",
      icon: <ShoppingCart className="h-8 w-8" />,
      href: "/products/order-processing",
      image: "/order-processing.png",
      features: [
        "Automated order workflows",
        "Real-time order tracking",
        "Multi-channel integration",
        "Customer notifications",
        "Order analytics",
      ],
      pricing: "Starting at ₹799/month",
    },
    {
      title: "Delivery Tracking",
      description:
        "Track your deliveries in real-time, optimize routes, and provide customers with accurate delivery estimates.",
      icon: <Truck className="h-8 w-8" />,
      href: "/products/delivery-tracking",
      image: "/delivery-tracking.png",
      features: [
        "Real-time GPS tracking",
        "Route optimization",
        "Delivery notifications",
        "Proof of delivery",
        "Performance analytics",
      ],
      pricing: "Starting at ₹1299/month",
    },
    {
      title: "Payment Solutions",
      description: "Accept payments through multiple channels, manage invoices, and reconcile accounts with ease.",
      icon: <CreditCard className="h-8 w-8" />,
      href: "/products/payment-solutions",
      image: "/payment-processing.png",
      features: [
        "Multiple payment gateways",
        "Invoice management",
        "Automated reconciliation",
        "Payment analytics",
        "Fraud protection",
      ],
      pricing: "Starting at ₹599/month",
    },
    {
      title: "Analytics & Reports",
      description: "Gain insights into your business performance with customizable reports and interactive dashboards.",
      icon: <BarChart2 className="h-8 w-8" />,
      href: "/products/analytics-reports",
      image: "/business-analytics-concept.png",
      features: [
        "Real-time dashboards",
        "Custom report builder",
        "Sales analytics",
        "Inventory insights",
        "Performance metrics",
      ],
      pricing: "Starting at ₹899/month",
    },
  ]

  const benefits = [
    {
      title: "Increase Efficiency",
      description: "Automate manual processes and reduce operational overhead by up to 60%",
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
    },
    {
      title: "Reduce Costs",
      description: "Lower inventory costs and minimize stockouts with intelligent forecasting",
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
    },
    {
      title: "Improve Customer Satisfaction",
      description: "Faster order processing and accurate delivery tracking enhance customer experience",
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
    },
    {
      title: "Scale Your Business",
      description: "Our solutions grow with your business, supporting expansion across multiple locations",
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="container py-20 px-4 md:px-6">
        <div className="text-center space-y-6">
          <Badge variant="outline" className="px-4 py-2">
            Comprehensive Retail Solutions
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Our Products</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our comprehensive suite of products designed to streamline your retail operations and drive business
            growth.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="container py-16 px-4 md:px-6">
        <div className="space-y-16">
          {products.map((product, index) => (
            <div
              key={product.title}
              className={`flex flex-col ${index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} gap-12 items-center`}
            >
              {/* Product Image */}
              <div className="w-full lg:w-1/2">
                <Card className="overflow-hidden border-0 shadow-2xl">
                  <div className="relative h-[400px] w-full">
                    <Image
                      src={product.image || "/placeholder.svg?height=400&width=600"}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Card>
              </div>

              {/* Product Content */}
              <div className="w-full lg:w-1/2 space-y-6">
                <div className="space-y-4">
                  <div className="text-primary">{product.icon}</div>
                  <h2 className="text-3xl md:text-4xl font-bold">{product.title}</h2>
                  <p className="text-lg text-muted-foreground">{product.description}</p>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Key Features:</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pricing and CTA */}
                <div className="space-y-4">
                  <div className="text-2xl font-bold text-primary">{product.pricing}</div>
                  <div className="flex space-x-4">
                    <Button asChild size="lg">
                      <Link href={product.href}>
                        Learn More
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link href="/contact">Get Demo</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Why Choose Retail Bandhu?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our solutions are designed to transform your retail operations and drive measurable business results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">{benefit.icon}</div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16 px-4 md:px-6">
        <Card className="bg-primary text-primary-foreground border-0">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Transform Your Business?</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Join thousands of retailers who have already streamlined their operations with Retail Bandhu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white" asChild>
                <Link href="/contact">Schedule Demo</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
