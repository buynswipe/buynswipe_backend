import type { Metadata } from "next"
import { TestimonialsPage } from "./testimonials-client"

export const metadata: Metadata = {
  title: "Testimonials - Retail Bandhu",
  description: "See what our customers say about Retail Bandhu",
}

export default function Testimonials() {
  return <TestimonialsPage />
}
