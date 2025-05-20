import type { Metadata } from "next"
import { BenefitsPage } from "./benefits-client"

export const metadata: Metadata = {
  title: "Benefits - Retail Bandhu",
  description: "Discover the benefits of using Retail Bandhu for your retail business",
}

export default function Benefits() {
  return <BenefitsPage />
}
