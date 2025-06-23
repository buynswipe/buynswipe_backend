// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/register/success",
  "/pending-approval",
  "/about",
  "/contact",
  "/features",
  "/benefits",
  "/testimonials",
  "/products",
  "/products/inventory-management",
  "/products/order-processing",
  "/products/delivery-tracking",
  "/products/payment-solutions",
  "/products/analytics-reports",
  "/resources",
  "/resources/documentation",
  "/resources/tutorials",
  "/resources/blog",
  "/resources/case-studies",
  "/resources/support",
  "/company",
  "/company/about",
  "/company/careers",
  "/company/press",
  "/company/terms-of-service",
  "/company/privacy-policy",
  "/not-found",
  "/error",
  "/payment-error",
  "/api/auth",
  "/favicon.ico",
  "/_next",
  "/public",
]

export function isPublicRoute(path: string): boolean {
  // Handle exact matches
  if (publicRoutes.includes(path)) {
    return true
  }

  // Handle dynamic routes and nested paths
  return publicRoutes.some((route) => {
    // Handle wildcard routes
    if (route.endsWith("*")) {
      return path.startsWith(route.slice(0, -1))
    }

    // Handle nested routes
    if (path.startsWith(route + "/")) {
      return true
    }

    return false
  })
}

export { publicRoutes }
