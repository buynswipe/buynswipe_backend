export function generateHomePageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Retail Bandhu",
    url: "https://retailbandhu.com",
    logo: "https://retailbandhu.com/logo.png",
    description:
      "Retail Bandhu is a comprehensive platform that connects retailers with wholesalers, streamlining inventory management, order processing, and delivery tracking for businesses across India.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Tech Park, Sector 5",
      addressLocality: "Bangalore",
      addressRegion: "Karnataka",
      postalCode: "560001",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-98765-43210",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: [
      "https://www.facebook.com/retailbandhu",
      "https://www.twitter.com/retailbandhu",
      "https://www.linkedin.com/company/retailbandhu",
      "https://www.instagram.com/retailbandhu",
    ],
  }
}
