import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Briefcase, MapPin, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Careers | Retail Bandhu",
  description: "Join our team and help us build the future of retail technology",
}

export default function CareersPage() {
  const departments = [
    {
      name: "Engineering",
      description: "Build the technology that powers our platform",
      openings: 5,
      icon: (
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
          className="h-6 w-6"
        >
          <path d="m18 16 4-4-4-4"></path>
          <path d="m6 8-4 4 4 4"></path>
          <path d="m14.5 4-5 16"></path>
        </svg>
      ),
    },
    {
      name: "Product",
      description: "Shape the future of our product offerings",
      openings: 3,
      icon: (
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
          className="h-6 w-6"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.29 7 12 12 20.71 7"></polyline>
          <line x1="12" x2="12" y1="22" y2="12"></line>
        </svg>
      ),
    },
    {
      name: "Design",
      description: "Create beautiful and intuitive user experiences",
      openings: 2,
      icon: (
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
          className="h-6 w-6"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>
      ),
    },
    {
      name: "Sales & Marketing",
      description: "Help grow our customer base and market our solutions",
      openings: 4,
      icon: (
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
          className="h-6 w-6"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
      ),
    },
    {
      name: "Customer Success",
      description: "Ensure our customers get the most out of our platform",
      openings: 3,
      icon: (
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
          className="h-6 w-6"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
    {
      name: "Operations",
      description: "Keep our business running smoothly and efficiently",
      openings: 2,
      icon: (
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
          className="h-6 w-6"
        >
          <rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      ),
    },
  ]

  const openPositions = [
    {
      title: "Senior Backend Developer",
      department: "Engineering",
      location: "Bangalore, India",
      type: "Full-time",
      href: "/company/careers/senior-backend-developer",
    },
    {
      title: "UX/UI Designer",
      department: "Design",
      location: "Remote, India",
      type: "Full-time",
      href: "/company/careers/ux-ui-designer",
    },
    {
      title: "Product Manager",
      department: "Product",
      location: "Bangalore, India",
      type: "Full-time",
      href: "/company/careers/product-manager",
    },
    {
      title: "Sales Executive",
      department: "Sales & Marketing",
      location: "Mumbai, India",
      type: "Full-time",
      href: "/company/careers/sales-executive",
    },
    {
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Delhi, India",
      type: "Full-time",
      href: "/company/careers/customer-success-manager",
    },
    {
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Bangalore, India",
      type: "Full-time",
      href: "/company/careers/devops-engineer",
    },
  ]

  return (
    <div className="container py-12 px-4 md:px-6">
      <Link href="/company" className="flex items-center text-sm text-muted-foreground mb-6 hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Company
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Careers</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Join our team and help us build the future of retail technology in India.
        </p>
      </div>

      <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden mb-16">
        <Image src="/diverse-group.png" alt="Retail Bandhu Team" fill className="object-cover" priority />
      </div>

      <div className="grid gap-8 md:grid-cols-2 mb-16">
        <div>
          <h2 className="text-3xl font-bold mb-4">Why Join Us?</h2>
          <p className="text-muted-foreground mb-6">
            At Retail Bandhu, we're on a mission to transform the retail industry in India. We're building technology
            that connects retailers and wholesalers, streamlines operations, and drives growth.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full text-primary mr-4">
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
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Impactful Work</h3>
                <p className="text-muted-foreground">
                  Your work will directly impact thousands of businesses across India.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full text-primary mr-4">
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
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Learning & Growth</h3>
                <p className="text-muted-foreground">
                  Continuous learning opportunities and a clear career growth path.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full text-primary mr-4">
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
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" x2="22" y1="12" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Inclusive Culture</h3>
                <p className="text-muted-foreground">A diverse and inclusive workplace where everyone can thrive.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full text-primary mr-4">
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
                  <path d="M20 7h-9"></path>
                  <path d="M14 17H5"></path>
                  <circle cx="17" cy="17" r="3"></circle>
                  <circle cx="7" cy="7" r="3"></circle>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Competitive Benefits</h3>
                <p className="text-muted-foreground">Competitive salary, health insurance, and other benefits.</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-4">Our Values</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-2">Customer First</h3>
              <p className="text-muted-foreground">We put our customers at the center of everything we do.</p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Innovation</h3>
              <p className="text-muted-foreground">
                We're constantly looking for new and better ways to solve problems.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Collaboration</h3>
              <p className="text-muted-foreground">We work together across teams to achieve our goals.</p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Integrity</h3>
              <p className="text-muted-foreground">We're honest, transparent, and ethical in everything we do.</p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Excellence</h3>
              <p className="text-muted-foreground">We strive for excellence in all aspects of our work.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Departments</h2>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {departments.map((dept) => (
            <Card key={dept.name} className="flex flex-col">
              <CardHeader>
                <div className="text-primary mb-4">{dept.icon}</div>
                <CardTitle>{dept.name}</CardTitle>
                <CardDescription>{dept.description}</CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto pt-0">
                <div className="text-sm text-muted-foreground">
                  {dept.openings} open position{dept.openings !== 1 ? "s" : ""}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Open Positions</h2>
        <div className="space-y-4">
          {openPositions.map((position) => (
            <div key={position.title} className="bg-muted/30 p-6 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-medium">{position.title}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-1" />
                      {position.department}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {position.location}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {position.type}
                    </div>
                  </div>
                </div>
                <Button asChild>
                  <Link href={position.href} className="flex items-center">
                    <span>Apply Now</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-muted/50 p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Don't see a position that fits?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          We're always looking for talented individuals to join our team. Send us your resume and we'll keep it on file
          for future opportunities.
        </p>
        <Button asChild size="lg">
          <Link href="/company/careers/general-application">Send Your Resume</Link>
        </Button>
      </div>
    </div>
  )
}
