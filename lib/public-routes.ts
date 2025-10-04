export function isPublicRoute(path: string): boolean {
  const publicRoutes = new Set<string>([
    "/",
    "/login",
    "/register",
    "/register/success",
    "/about",
    "/contact",
    "/features",
    "/benefits",
    "/testimonials",
    "/products",
    "/resources",
    "/company",
    "/company/about",
    "/error",
    "/not-found",
  ])

  if (publicRoutes.has(path)) return true
  // Allow nested routes for these bases
  const prefixes = ["/products", "/resources", "/company"]
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`))
}
