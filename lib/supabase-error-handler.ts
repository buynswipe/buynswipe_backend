/**
 * Centralized error handling for Supabase operations
 */

export class SupabaseError extends Error {
  constructor(
    public code: string,
    message: string,
    public originalError?: unknown,
  ) {
    super(message)
    this.name = "SupabaseError"
  }
}

export function handleSupabaseError(error: unknown, context: string): SupabaseError {
  if (error instanceof SupabaseError) {
    return error
  }

  const errorObj = error as any

  // Handle Supabase-specific errors
  if (errorObj?.code) {
    return new SupabaseError(errorObj.code, `${context}: ${errorObj.message || "Unknown error"}`, error)
  }

  // Handle network errors
  if (errorObj?.message?.includes("fetch")) {
    return new SupabaseError("NETWORK_ERROR", `${context}: Network error - ${errorObj.message}`, error)
  }

  // Handle timeout errors
  if (errorObj?.message?.includes("timeout")) {
    return new SupabaseError("TIMEOUT_ERROR", `${context}: Request timeout`, error)
  }

  // Generic error
  return new SupabaseError("UNKNOWN_ERROR", `${context}: ${String(error)}`, error)
}

export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof SupabaseError)) {
    return false
  }

  // Retryable error codes
  const retryableCodes = ["NETWORK_ERROR", "TIMEOUT_ERROR", "PGRST116", "PGRST117"]

  return retryableCodes.includes(error.code)
}
