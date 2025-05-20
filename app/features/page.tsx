import type { Metadata } from "next"
import { FeaturesPage } from "./features-client"

export const metadata: Metadata = {
  title: "Features - Retail Bandhu",
  description: "Explore the powerful features of Retail Bandhu for your retail business",
}

export default function Features() {
  return <FeaturesPage />
}
