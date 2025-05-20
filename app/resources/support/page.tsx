import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, LifeBuoy, MessageSquare, FileQuestion, Mail, Phone, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: "Support Center | Retail Bandhu",
  description: "Get help with any issues you encounter while using Retail Bandhu",
}

export default function SupportPage() {
  const faqs = [
    {
      question: "How do I reset my password?",
      answer:
        "To reset your password, go to the login page and click on 'Forgot Password'. Enter your email address, and we'll send you a link to reset your password. Follow the instructions in the email to create a new password.",
    },
    {
      question: "How can I add a new product to my inventory?",
      answer:
        "To add a new product, navigate to the Products section from your dashboard. Click on the 'Add Product' button, fill in the product details including name, description, price, and quantity, then click 'Save'. You can also upload product images and set additional attributes.",
    },
    {
      question: "How do I process a new order?",
      answer:
        "New orders appear in your Orders dashboard. Click on an order to view its details. You can then update the order status, assign a delivery partner, generate an invoice, and process the payment. The system will automatically update inventory levels when an order is processed.",
    },
    {
      question: "Can I track my delivery partners in real-time?",
      answer:
        "Yes, you can track your delivery partners in real-time from the Delivery Tracking section. You'll see their current location on a map, along with details of the orders they're delivering. You can also communicate with them directly through the platform.",
    },
    {
      question: "How do I generate reports?",
      answer:
        "Go to the Analytics & Reports section from your dashboard. You can choose from pre-built report templates or create custom reports by selecting the metrics and time period you're interested in. Reports can be viewed online or exported in various formats.",
    },
    {
      question: "What payment methods are supported?",
      answer:
        "Retail Bandhu supports multiple payment methods including UPI, cash on delivery (COD), credit/debit cards, and net banking. You can configure which payment methods to offer to your customers from the Payment Settings section.",
    },
    {
      question: "How do I add a new user to my account?",
      answer:
        "To add a new user, go to the Settings section and select 'User Management'. Click on 'Add User', enter their details including name, email, and role, then click 'Save'. The new user will receive an email invitation to join your account.",
    },
    {
      question: "Can I use Retail Bandhu on my mobile device?",
      answer:
        "Yes, Retail Bandhu is fully responsive and works on mobile devices. You can access all features through your mobile browser. We also have dedicated mobile apps for delivery partners to track deliveries and update delivery status.",
    },
  ]

  return (
    <div className="container py-12 px-4 md:px-6">
      <Link href="/resources" className="flex items-center text-sm text-muted-foreground mb-6 hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Resources
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Support Center</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Get help with any issues you encounter while using Retail Bandhu. Browse our FAQs, documentation, or contact
          our support team.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 mb-16">
        <Card>
          <CardHeader>
            <div className="text-primary mb-4">
              <LifeBuoy className="h-8 w-8" />
            </div>
            <CardTitle>Help Center</CardTitle>
            <CardDescription>Browse our knowledge base for answers to common questions.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/resources/documentation" className="flex items-center justify-between">
                <span>Visit Help Center</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-primary mb-4">
              <MessageSquare className="h-8 w-8" />
            </div>
            <CardTitle>Live Chat</CardTitle>
            <CardDescription>Chat with our support team for immediate assistance.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="#chat" className="flex items-center justify-between">
                <span>Start Chat</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-primary mb-4">
              <FileQuestion className="h-8 w-8" />
            </div>
            <CardTitle>Submit a Ticket</CardTitle>
            <CardDescription>Create a support ticket for complex issues.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="#ticket" className="flex items-center justify-between">
                <span>Create Ticket</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="faqs" className="mb-16">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faqs">Frequently Asked Questions</TabsTrigger>
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
          <TabsTrigger value="tutorials">Video Tutorials</TabsTrigger>
        </TabsList>

        <TabsContent value="faqs" className="mt-6">
          <div className="bg-muted/30 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <div className="bg-muted/30 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-xl font-medium mb-4">Get in Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Email</h4>
                      <p className="text-muted-foreground">support@retailbandhu.com</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Phone</h4>
                      <p className="text-muted-foreground">+91 1800-123-4567</p>
                      <p className="text-sm text-muted-foreground">Monday to Friday, 9am to 6pm IST</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-4">Send a Message</h3>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Your email"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  <Button className="w-full">Send Message</Button>
                </form>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tutorials" className="mt-6">
          <div className="bg-muted/30 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Video Tutorials</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-background p-4 rounded-lg">
                <div className="relative h-48 bg-muted rounded-md mb-4 flex items-center justify-center">
                  <div className="text-muted-foreground">Video Thumbnail</div>
                </div>
                <h3 className="font-medium mb-2">Getting Started with Retail Bandhu</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Learn the basics of setting up your account and navigating the platform.
                </p>
                <Button variant="outline" className="w-full">
                  Watch Video
                </Button>
              </div>

              <div className="bg-background p-4 rounded-lg">
                <div className="relative h-48 bg-muted rounded-md mb-4 flex items-center justify-center">
                  <div className="text-muted-foreground">Video Thumbnail</div>
                </div>
                <h3 className="font-medium mb-2">Managing Your Inventory</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  A comprehensive guide to managing your inventory effectively.
                </p>
                <Button variant="outline" className="w-full">
                  Watch Video
                </Button>
              </div>

              <div className="bg-background p-4 rounded-lg">
                <div className="relative h-48 bg-muted rounded-md mb-4 flex items-center justify-center">
                  <div className="text-muted-foreground">Video Thumbnail</div>
                </div>
                <h3 className="font-medium mb-2">Processing Orders</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Learn how to efficiently process and fulfill orders.
                </p>
                <Button variant="outline" className="w-full">
                  Watch Video
                </Button>
              </div>

              <div className="bg-background p-4 rounded-lg">
                <div className="relative h-48 bg-muted rounded-md mb-4 flex items-center justify-center">
                  <div className="text-muted-foreground">Video Thumbnail</div>
                </div>
                <h3 className="font-medium mb-2">Tracking Deliveries</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Learn how to track deliveries and manage delivery partners.
                </p>
                <Button variant="outline" className="w-full">
                  Watch Video
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button asChild variant="outline">
                <Link href="/resources/tutorials">View All Tutorials</Link>
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
