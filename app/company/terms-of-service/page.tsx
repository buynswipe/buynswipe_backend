import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service - Retail Bandhu",
  description: "Terms and conditions for using the Retail Bandhu platform",
}

export default function TermsOfServicePage() {
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
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl/tight">Terms of Service</h1>
          <p className="text-lg text-muted-foreground">Last updated: May 20, 2023</p>
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">1. Introduction</h2>
          <p className="text-muted-foreground">
            Welcome to Retail Bandhu. These Terms of Service govern your use of our website, mobile application, and
            services. By accessing or using our platform, you agree to be bound by these Terms. If you disagree with any
            part of the terms, you may not access the service.
          </p>

          <h2 className="text-2xl font-bold">2. Definitions</h2>
          <p className="text-muted-foreground">
            <strong>"Service"</strong> refers to the Retail Bandhu platform, including the website, mobile application,
            and all related services.
          </p>
          <p className="text-muted-foreground">
            <strong>"User"</strong> refers to any individual or entity that accesses or uses the Service, including
            retailers, wholesalers, and delivery partners.
          </p>
          <p className="text-muted-foreground">
            <strong>"Content"</strong> refers to all information, data, text, graphics, images, videos, and other
            materials that are posted, uploaded, or otherwise made available through the Service.
          </p>

          <h2 className="text-2xl font-bold">3. User Accounts</h2>
          <p className="text-muted-foreground">
            To use certain features of the Service, you must register for an account. You agree to provide accurate,
            current, and complete information during the registration process and to update such information to keep it
            accurate, current, and complete.
          </p>
          <p className="text-muted-foreground">
            You are responsible for safeguarding the password that you use to access the Service and for any activities
            or actions under your password. We encourage you to use "strong" passwords (passwords that use a combination
            of upper and lower case letters, numbers, and symbols) with your account.
          </p>

          <h2 className="text-2xl font-bold">4. User Conduct</h2>
          <p className="text-muted-foreground">
            You agree not to use the Service for any purpose that is prohibited by these Terms. You are responsible for
            all of your activity in connection with the Service.
          </p>
          <p className="text-muted-foreground">You shall not:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              Use the Service for any illegal purpose or in violation of any local, state, national, or international
              law.
            </li>
            <li>
              Violate or encourage others to violate the rights of third parties, including intellectual property
              rights.
            </li>
            <li>
              Post, upload, or distribute any content that is unlawful, defamatory, libelous, inaccurate, or that a
              reasonable person could deem to be objectionable, profane, indecent, pornographic, harassing, threatening,
              embarrassing, hateful, or otherwise inappropriate.
            </li>
            <li>Interfere with security-related features of the Service.</li>
            <li>
              Use the Service to transmit any viruses, worms, defects, Trojan horses, or any items of a destructive
              nature.
            </li>
          </ul>

          <h2 className="text-2xl font-bold">5. Intellectual Property</h2>
          <p className="text-muted-foreground">
            The Service and its original content, features, and functionality are and will remain the exclusive property
            of Retail Bandhu and its licensors. The Service is protected by copyright, trademark, and other laws of both
            India and foreign countries.
          </p>
          <p className="text-muted-foreground">
            Our trademarks and trade dress may not be used in connection with any product or service without the prior
            written consent of Retail Bandhu.
          </p>

          <h2 className="text-2xl font-bold">6. Changes to Terms</h2>
          <p className="text-muted-foreground">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is
            material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a
            material change will be determined at our sole discretion.
          </p>
          <p className="text-muted-foreground">
            By continuing to access or use our Service after any revisions become effective, you agree to be bound by
            the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
          </p>

          <h2 className="text-2xl font-bold">7. Contact Us</h2>
          <p className="text-muted-foreground">
            If you have any questions about these Terms, please contact us at legal@retailbandhu.com.
          </p>
        </div>
      </div>
    </div>
  )
}
