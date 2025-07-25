import type { Metadata } from "next"
import HomePageClient from "./pageClient"

export const metadata: Metadata = {
  title: "Retail Bandhu - Connecting Retailers and Wholesalers Across India",
  description:
    "Streamline your retail business with our comprehensive platform for inventory management, order processing, and delivery tracking.",
}

export default function HomePage() {
  return <HomePageClient />
}
