import type { Metadata } from "next"
import { ContactPage } from "./contact-client"

export const metadata: Metadata = {
  title: "Contact Us - Retail Bandhu",
  description: "Get in touch with the Retail Bandhu team for any questions or support",
}

export default function Contact() {
  return <ContactPage />
}
