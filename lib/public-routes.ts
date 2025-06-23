// Define public routes that don't require authentication
export const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/register-driver",
  "/register/success",
  "/features",
  "/benefits",
  "/testimonials",
  "/contact",
  "/about",
  "/documentation",
  "/tutorials",
  "/blog",
  "/case-studies",
  "/support",
  "/careers",
  "/press",
  "/privacy-policy",
  "/terms-of-service",
  "/payment-error",
  "/api/auth/status",
  "/company/about",
  "/company/terms-of-service",
  "/company/privacy-policy",
  "/company/careers",
  "/company/press",
  "/resources/documentation",
  "/resources/tutorials",
  "/resources/blog",
  "/resources/case-studies",
  "/resources/support",
  "/products/inventory-management",
  "/products/order-processing",
  "/products/delivery-tracking",
  "/products/payment-solutions",
  "/products/analytics-reports",
  "/company",
  "/products",
  "/resources",
]

// Routes that start with these prefixes are also public
export const publicPrefixes = [
  "/features/",
  "/api/auth/",
  "/api/contact",
  "/_next/",
  "/favicon.ico",
  "/images/",
  "/fonts/",
  "/company/",
  "/resources/",
  "/products/",
]

/**
 * Check if a path is public (doesn't require authentication)
 */
export function isPublicRoute(path: string): boolean {
  // Check exact matches
  if (publicRoutes.includes(path)) {
    return true
  }

  // Check prefixes
  for (const prefix of publicPrefixes) {
    if (path.startsWith(prefix)) {
      return true
    }
  }

  return false
}
