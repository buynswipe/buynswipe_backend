import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy - Retail Bandhu",
  description: "Privacy policy for the Retail Bandhu platform",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl/tight">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground">Last updated: May 20, 2023</p>
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">1. Introduction</h2>
          <p className="text-muted-foreground">
            At Retail Bandhu, we respect your privacy and are committed to protecting your personal data. This Privacy
            Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
          <p className="text-muted-foreground">
            Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please
            do not access the platform.
          </p>

          <h2 className="text-2xl font-bold">2. Information We Collect</h2>
          <p className="text-muted-foreground">
            We collect several types of information from and about users of our platform, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              <strong>Personal Data:</strong> Name, email address, telephone number, address, business details, and
              payment information.
            </li>
            <li>
              <strong>Usage Data:</strong> Information about how you use our platform, including your browsing history,
              search queries, and interaction with features.
            </li>
            <li>
              <strong>Device Data:</strong> Information about the device you use to access our platform, including IP
              address, browser type, and operating system.
            </li>
            <li>
              <strong>Location Data:</strong> Information about your location, which may be determined through your IP
              address or GPS data if you use our mobile application.
            </li>
          </ul>

          <h2 className="text-2xl font-bold">3. How We Use Your Information</h2>
          <p className="text-muted-foreground">We use the information we collect for various purposes, including:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>To provide and maintain our platform</li>
            <li>To process transactions and send related information</li>
            <li>To send administrative information, such as updates, security alerts, and support messages</li>
            <li>To respond to your comments, questions, and requests</li>
            <li>To personalize your experience on our platform</li>
            <li>To improve our platform and develop new features</li>
            <li>To monitor usage of our platform for security and fraud prevention</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-bold">4. Disclosure of Your Information</h2>
          <p className="text-muted-foreground">We may disclose your personal information to:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              <strong>Service Providers:</strong> Third-party vendors who provide services on our behalf, such as
              payment processing, data analysis, email delivery, and customer service.
            </li>
            <li>
              <strong>Business Partners:</strong> Wholesalers, retailers, and delivery partners who use our platform to
              provide services to you.
            </li>
            <li>
              <strong>Legal Authorities:</strong> If required by law or in response to valid requests by public
              authorities.
            </li>
            <li>
              <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.
            </li>
          </ul>

          <h2 className="text-2xl font-bold">5. Data Security</h2>
          <p className="text-muted-foreground">
            We implement appropriate technical and organizational measures to protect your personal data against
            unauthorized or unlawful processing, accidental loss, destruction, or damage.
          </p>
          <p className="text-muted-foreground">
            However, no method of transmission over the Internet or method of electronic storage is 100% secure. While
            we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its
            absolute security.
          </p>

          <h2 className="text-2xl font-bold">6. Your Rights</h2>
          <p className="text-muted-foreground">
            Depending on your location, you may have certain rights regarding your personal data, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>The right to access your personal data</li>
            <li>The right to rectify inaccurate personal data</li>
            <li>The right to erasure of your personal data</li>
            <li>The right to restrict processing of your personal data</li>
            <li>The right to data portability</li>
            <li>The right to object to processing of your personal data</li>
          </ul>
          <p className="text-muted-foreground">
            To exercise any of these rights, please contact us at privacy@retailbandhu.com.
          </p>

          <h2 className="text-2xl font-bold">7. Changes to This Privacy Policy</h2>
          <p className="text-muted-foreground">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page and updating the "Last updated" date.
          </p>
          <p className="text-muted-foreground">
            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy
            are effective when they are posted on this page.
          </p>

          <h2 className="text-2xl font-bold">8. Contact Us</h2>
          <p className="text-muted-foreground">
            If you have any questions about this Privacy Policy, please contact us at privacy@retailbandhu.com.
          </p>
        </div>
      </div>
    </div>
  )
}
