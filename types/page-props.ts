// Common page props types for Next.js App Router
export interface PageProps {
  params: Record<string, string | string[]>
  searchParams?: Record<string, string | string[] | undefined>
}

// Specific page props for different routes
export interface OrderPageProps {
  params: {
    id: string
  }
  searchParams?: Record<string, string | string[] | undefined>
}

export interface DeliveryTrackingPageProps {
  params: {
    id: string
  }
  searchParams?: Record<string, string | string[] | undefined>
}

export interface WholesalerPageProps {
  params: {
    id: string
  }
  searchParams?: Record<string, string | string[] | undefined>
}

// Generic dynamic route props
export interface DynamicPageProps<T extends Record<string, string | string[]> = Record<string, string>> {
  params: T
  searchParams?: Record<string, string | string[] | undefined>
}
