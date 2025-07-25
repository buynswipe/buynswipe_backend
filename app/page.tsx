import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Package, ShoppingCart, Truck, BarChart3, Users, Zap, Shield, Globe, Star } from "lucide-react"

export default function HomePage() {
  const features = [
    {
      icon: <Package className="h-8 w-8" />,
      title: "Inventory Management",
      description: "Real-time stock tracking with automated alerts and comprehensive reporting.",
    },
    {
      icon: <ShoppingCart className="h-8 w-8" />,
      title: "Order Processing",
      description: "Streamlined order workflows from placement to fulfillment.",
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Delivery Tracking",
      description: "End-to-end delivery management with real-time GPS tracking.",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Analytics & Reports",
      description: "Powerful insights and customizable reports for data-driven decisions.",
    },
  ]

  const benefits = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Increase Efficiency",
      description: "Automate manual processes and reduce operational overhead by up to 60%",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Scale Globally",
      description: "Support for multiple currencies, languages, and tax regulations",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support from our expert team",
    },
  ]

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Owner, Kumar Electronics",
      content:
        "Retail Bandhu transformed our inventory management. We reduced stockouts by 80% and increased our profit margins significantly.",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      role: "Manager, Sharma Textiles",
      content:
        "The order processing system is incredibly efficient. Our customers love the real-time tracking and faster deliveries.",
      rating: 5,
    },
    {
      name: "Amit Patel",
      role: "CEO, Patel Wholesale",
      content:
        "The analytics dashboard gives us insights we never had before. We can now make data-driven decisions with confidence.",
      rating: 5,
    },
  ]

  const stats = [
    { number: "10,000+", label: "Active Retailers" },
    { number: "₹500Cr+", label: "Transactions Processed" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "24/7", label: "Customer Support" },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="secondary" className="w-fit">
                🚀 Trusted by 10,000+ Retailers
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Transform Your Retail Business with <span className="text-yellow-400">Smart Solutions</span>
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Streamline inventory, automate orders, track deliveries, and grow your business with our comprehensive
                retail management platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold" asChild>
                  <Link href="/register">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 bg-transparent"
                  asChild
                >
                  <Link href="/products">View Products</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="/retail-dashboard.png"
                  alt="Retail Bandhu Dashboard"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-2xl"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="px-4 py-2">
              Powerful Features
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools you need to manage and grow your retail business
              efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="px-4 py-2">
                  Why Choose Us
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold">Built for Modern Retailers</h2>
                <p className="text-lg text-gray-600">
                  Our platform is designed with the modern retailer in mind, offering cutting-edge technology and
                  user-friendly interfaces.
                </p>
              </div>

              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                      {benefit.icon}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <Image
                src="/retail-storefront.png"
                alt="Modern Retail Store"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="px-4 py-2">
              Customer Stories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">What Our Customers Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what real retailers are saying about Retail Bandhu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.content}"</p>
                  <div className="border-t pt-4">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Transform Your Business?</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Join thousands of retailers who have already streamlined their operations and increased their profits with
            Retail Bandhu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold" asChild>
              <Link href="/register">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 bg-transparent"
              asChild
            >
              <Link href="/contact">Schedule a Demo</Link>
            </Button>
          </div>
          <p className="text-sm text-blue-200">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>
    </div>
  )
}
