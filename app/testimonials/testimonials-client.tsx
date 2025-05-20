"use client"

import { Star } from "lucide-react"
import Image from "next/image"

export function TestimonialsPage() {
  const testimonials = [
    {
      name: "Rajesh Kumar",
      position: "Owner, Kumar Retail Store",
      image: "/diverse-group.png",
      quote:
        "Retail Bandhu has transformed how I manage my store. Inventory management is now seamless, and I can place orders with wholesalers in just a few clicks. The delivery tracking feature gives me peace of mind.",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      position: "Manager, Sharma Wholesalers",
      image: "/diverse-group.png",
      quote:
        "As a wholesaler, Retail Bandhu has helped me connect with more retailers and streamline order processing. The analytics tools provide valuable insights into our business performance.",
      rating: 5,
    },
    {
      name: "Amit Patel",
      position: "CEO, Patel Distribution",
      image: "/diverse-group.png",
      quote:
        "The payment solutions offered by Retail Bandhu are secure and reliable. We've seen a significant reduction in payment delays since we started using the platform.",
      rating: 4,
    },
    {
      name: "Sunita Verma",
      position: "Owner, Verma Grocery",
      image: "/diverse-group.png",
      quote:
        "I was skeptical at first, but Retail Bandhu has exceeded my expectations. The mobile app allows me to manage my business on the go, and the customer support team is always helpful.",
      rating: 5,
    },
    {
      name: "Vikram Singh",
      position: "Operations Manager, Singh Enterprises",
      image: "/diverse-group.png",
      quote:
        "The real-time delivery tracking feature has been a game-changer for our business. We can now provide accurate delivery estimates to our customers, improving satisfaction.",
      rating: 4,
    },
    {
      name: "Neha Gupta",
      position: "Owner, Gupta Retail Chain",
      image: "/diverse-group.png",
      quote:
        "Retail Bandhu's inventory management system has helped us reduce stockouts by 60%. The automatic reorder notifications ensure we never run out of popular items.",
      rating: 5,
    },
  ]

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Don't just take our word for it. Here's what retailers and wholesalers across India have to say about Retail
          Bandhu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                <Image
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold">{testimonial.name}</h3>
                <p className="text-sm text-muted-foreground">{testimonial.position}</p>
              </div>
            </div>
            <div className="flex mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Join Our Growing Community</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Experience the benefits that thousands of businesses across India are already enjoying.
        </p>
        <a
          href="/register"
          className="bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          Get Started Free
        </a>
      </div>
    </div>
  )
}
