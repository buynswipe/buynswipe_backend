import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Retail Bandhu",
  description:
    "Retail Bandhu connects retailers, wholesalers and delivery partners with a unified platform for ordering, logistics, payments, and analytics.",
}

export default function AboutPage() {
  return (
    <div className="container py-10">
      {/* Hero banner (purple) */}
      <div className="mb-10 overflow-hidden rounded-xl border">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Your%20paragraph%20text%282%29-HctM9yz71J3aQSYZj5GBUg94BKvQE6.png"
          alt="Retail Bandhu — Digitizing India’s FMCG Supply Chain"
          className="h-56 w-full object-cover md:h-72"
        />
      </div>

      <section className="mx-auto max-w-4xl space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">About Retail Bandhu</h1>
        <p className="text-muted-foreground">
          Retail Bandhu was born in 2025 out of a deep understanding of the challenges that millions of small retailers
          face across India. Frustrated by fragmented supply chains, non-transparent pricing, inventory gaps, and
          delivery delays, our founders — rooted in retail & FMCG operations — set out to build a platform that bridges
          retailers, wholesalers, and delivery partners in a unified ecosystem. What began as a simple digital catalog
          soon evolved into a full-stack B2B platform powering end-to-end operations: from ordering to analytics to
          delivery tracking.
        </p>
      </section>

      <div className="my-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h2 className="mb-3 text-xl font-semibold">What We Do & Why We Exist</h2>
          <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Inventory & Order Management</span> — real-time product
              access, smarter reorders
            </li>
            <li>
              <span className="font-medium text-foreground">Wholesale Sourcing</span> — transparent pricing & access to
              trusted suppliers
            </li>
            <li>
              <span className="font-medium text-foreground">Delivery & Logistics</span> — verified delivery partners and
              route optimization
            </li>
            <li>
              <span className="font-medium text-foreground">Payments & Credit Tools</span> — flexible payment options,
              credit support
            </li>
            <li>
              <span className="font-medium text-foreground">Analytics & Reports</span> — insights to help retailers grow
              and optimize
            </li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            We’re on a mission to make the retail ecosystem in Bharat efficient, accessible, and profitable for all
            stakeholders — from kirana owners in small towns to delivery agents and local wholesalers.
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-3 text-xl font-semibold">Our Edge / Unique Proposition</h2>
          <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Unified platform</span> (procurement + logistics + finance)
              — not fragmented tools.
            </li>
            <li>
              <span className="font-medium text-foreground">Local-first, multilingual design</span> — built for Bharat,
              by people who understand its complexities.
            </li>
            <li>
              <span className="font-medium text-foreground">Network & scale effects</span> — more retailers drive demand
              for wholesalers and expand the logistics network.
            </li>
            <li>
              <span className="font-medium text-foreground">Transparency & trust</span> — clear pricing, verification,
              support — no hidden costs.
            </li>
          </ul>
        </div>
      </div>

      <div className="my-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h2 className="mb-3 text-xl font-semibold">Impact & Reach (so far)</h2>
          <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
            <li>Recognized by Startup India (2025)</li>
            <li>Onboarding retailers</li>
            <li>Building a community of wholesalers & delivery partners</li>
            <li>Enabled small retailers to reduce procurement costs and delivery delays</li>
          </ul>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-3 text-xl font-semibold">Vision & Mission</h2>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Mission:</span> To digitally empower every small retailer,
            wholesaler, and delivery partner across India, enabling growth, trust, and inclusion.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Vision:</span> To become the backbone of India’s retail
            infrastructure — a platform so essential that every kirana shop, every local distributor, and every delivery
            provider thrives because of it.
          </p>
          <div className="mt-4 rounded-md bg-muted p-3">
            {/* Branded truck visual */}
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Generated%20Image%20September%2017%2C%202025%20-%205_11PM-bhsq3U9HpYO8Esba0Tzvq3uafeQWCT.png"
              alt="Retail Bandhu branded delivery vehicle"
              className="mx-auto h-40 w-auto object-contain"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-4xl rounded-xl border bg-gradient-to-br from-purple-50 to-orange-50 p-6 dark:from-purple-950/40 dark:to-orange-900/20">
        <div className="flex items-center gap-3">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Retail%20Bandhu%20Icon-UTC7N2g2VekiBnTd3BPQpxy6SJtc59.png"
            alt="Retail Bandhu Icon"
            className="h-10 w-10 rounded-md bg-white p-1 shadow"
          />
          <div>
            <div className="text-lg font-semibold">Aapke Vyapar ka Saathi</div>
            <p className="text-sm text-muted-foreground">
              Retail Bandhu is committed to being the trusted partner for every small business across Bharat.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
