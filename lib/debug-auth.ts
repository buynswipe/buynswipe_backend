import type { NextRequest } from "next/server"

export function debugAuthRequest(req: NextRequest) {
  if (process.env.DEBUG_AUTH === "true") {
    console.log("Auth Debug:", {
      pathname: req.nextUrl.pathname,
      method: req.method,
      timestamp: new Date().toISOString(),
    })
  }
}

// Client-side debug helper
export function debugAuthClient(context: string, data?: any) {
  if (process.env.NEXT_PUBLIC_DEBUG_AUTH === "true") {
    console.log(`Auth Debug [${context}]:`, data)
  }
}
