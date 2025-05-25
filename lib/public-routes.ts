// List of public routes that don't require authentication
export const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/about",
  "/contact",
  "/features",
  "/benefits",
  "/testimonials",
  "/company",
  "/products",
  "/resources",
  "/register/success",
  "/pending-approval",
  "/payment-error",
  "/not-found",
]

// Check if a route is public
export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => {
    if (route === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(route)
  })
}

// Get redirect URL for authenticated users
export function getAuthenticatedRedirect(userRole?: string): string {
  switch (userRole) {
    case "delivery_partner":
      return "/delivery-partner/dashboard"
    case "wholesaler":
      return "/wholesaler-dashboard"
    case "admin":
      return "/dashboard/main"
    default:
      return "/dashboard"
  }
}
