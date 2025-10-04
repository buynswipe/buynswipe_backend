import type { Metadata } from "next"
import ContactClient from "./contact-client"

export const metadata: Metadata = {
  title: "Contact | Retail Bandhu",
  description: "Connect with Retail Bandhu for product, delivery and partnership inquiries.",
}

export default function Page() {
  return <ContactClient />
}
