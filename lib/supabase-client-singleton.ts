/**
 * Singleton pattern for Supabase clients to prevent multiple instances
 */

import { createClientSupabaseClient } from "./supabase-client"
import { createServiceClient } from "./supabase-server"
import type { SupabaseClient } from "@supabase/supabase-js"

let clientInstance: SupabaseClient | null = null
let serviceInstance: SupabaseClient | null = null

/**
 * Get or create the service client (server-side only)
 */
export function getServiceClient(): SupabaseClient {
  if (!serviceInstance) {
    serviceInstance = createServiceClient()
  }
  return serviceInstance
}

/**
 * Reset service client (useful for testing)
 */
export function resetServiceClient(): void {
  serviceInstance = null
}

/**
 * Get or create the client component client (client-side only)
 */
export function getClientComponentClient(): SupabaseClient {
  if (!clientInstance) {
    clientInstance = createClientSupabaseClient()
  }
  return clientInstance
}

/**
 * Reset client component client (useful for testing)
 */
export function resetClientComponentClient(): void {
  clientInstance = null
}
