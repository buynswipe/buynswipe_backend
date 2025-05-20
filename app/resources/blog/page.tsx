import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Blog | Retail Bandhu",
  description: "Latest news, updates, and insights from the Retail Bandhu team",
}

export default function BlogPage() {
  const featuredPost = {
    title: "5 Ways to Optimize Your Retail Supply Chain",
    description: "Learn how to streamline your supply chain operations and reduce costs with these proven strategies.",
    date: "May 15, 2023",
    author: "Priya Sharma",
    image: "/retail-network-digital-scm.png",
    href: "/resources/blog/optimize-retail-supply-chain",
  }

  const recentPosts = [
    {
      title: "The Future of FMCG Distribution in India",
      description: "Exploring emerging trends and technologies shaping the future of FMCG distribution in India.",
      date: "April 28, 2023",
      author: "Rahul Verma",
      image: "/fmcg-supply-chain.png",
      href: "/resources/blog/future-of-fmcg-distribution",
    },
    {
      title: "How to Reduce Order Processing Time by 50%",
      description:
        "Practical tips to significantly reduce your order processing time and improve customer satisfaction.",
      date: "April 15, 2023",
      author: "Amit Patel",
      image: "/order-processing.png",
      href: "/resources/blog/reduce-order-processing-time",
    },
    {
      title: "Implementing Effective Inventory Management Practices",
      description: "Best practices for managing your inventory to prevent stockouts and overstock situations.",
      date: "March 30, 2023",
      author: "Neha Singh",
      image: "/inventory-management.png",
      href: "/resources/blog/inventory-management-practices",
    },
    {
      title: "Leveraging Data Analytics for Retail Growth",
      description: "How to use data analytics to drive growth and make informed business decisions.",
      date: "March 15, 2023",
      author: "Vikram Desai",
      image: "/business-analytics-concept.png",
      href: "/resources/blog/data-analytics-retail-growth",
    },
    {
      title: "Building Strong Relationships with Wholesalers",
      description: "Strategies for developing and maintaining strong relationships with your wholesale partners.",
      date: "February 28, 2023",
      author: "Ananya Gupta",
      image: "/retail-storefront.png",
      href: "/resources/blog/wholesaler-relationships",
    },
  ]

  const categories = [
    "Supply Chain",
    "Inventory Management",
    "Order Processing",
    "Delivery Logistics",
    "Payment Solutions",
    "Analytics",
    "Industry Trends",
    "Case Studies",
  ]

  return (
    <div className="container py-12 px-4 md:px-6">
      <Link href="/resources" className="flex items-center text-sm text-muted-foreground mb-6 hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Resources
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Blog</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Latest news, updates, and insights from the Retail Bandhu team to help you grow your retail business.
        </p>
      </div>

      {/* Featured Post */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Featured Post</h2>
        <div className="grid md:grid-cols-2 gap-8 items-center bg-muted/30 rounded-lg overflow-hidden">
          <div className="relative h-[300px] md:h-full">
            <Image
              src={featuredPost.image || "/placeholder.svg"}
              alt={featuredPost.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6 md:p-8">
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{featuredPost.date}</span>
              <span className="mx-2">•</span>
              <User className="h-4 w-4 mr-2" />
              <span>{featuredPost.author}</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">{featuredPost.title}</h3>
            <p className="text-muted-foreground mb-6">{featuredPost.description}</p>
            <Button asChild>
              <Link href={featuredPost.href} className="flex items-center">
                <span>Read More</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="grid md:grid-cols-4 gap-8">
        <div className="md:col-span-3">
          <h2 className="text-2xl font-bold mb-6">Recent Posts</h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {recentPosts.map((post) => (
              <Card key={post.title} className="flex flex-col overflow-hidden">
                <div className="relative h-48">
                  <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                </div>
                <CardHeader>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{post.date}</span>
                    <span className="mx-2">•</span>
                    <User className="h-3 w-3 mr-1" />
                    <span>{post.author}</span>
                  </div>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{post.description}</CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto pt-0">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={post.href} className="flex items-center justify-between">
                      <span>Read Article</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Button variant="outline" asChild>
              <Link href="/resources/blog/archive">View All Posts</Link>
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-muted/30 p-6 rounded-lg">
            <h3 className="font-bold mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category}>
                  <Link
                    href={`/resources/blog/category/${category.toLowerCase().replace(" ", "-")}`}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-muted/30 p-6 rounded-lg mt-6">
            <h3 className="font-bold mb-4">Subscribe to Our Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Stay updated with the latest news and insights from Retail Bandhu.
            </p>
            <div className="space-y-4">
              <input type="email" placeholder="Your email address" className="w-full px-3 py-2 border rounded-md" />
              <Button className="w-full">Subscribe</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
