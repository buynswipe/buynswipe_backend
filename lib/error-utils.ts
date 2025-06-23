/**
 * Utility functions for error handling
 */

export interface AppError {
  message: string
  code?: string
  statusCode?: number
  details?: any
}

export function createAppError(message: string, code?: string, statusCode?: number, details?: any): AppError {
  return {
    message,
    code,
    statusCode,
    details,
  }
}

export function isSupabaseError(error: any): boolean {
  return error && typeof error === "object" && "code" in error && "message" in error
}

export function handleSupabaseError(error: any): AppError {
  if (isSupabaseError(error)) {
    return createAppError(error.message || "Database error occurred", error.code, error.status || 500, error.details)
  }

  return createAppError(error?.message || "An unexpected error occurred", "UNKNOWN_ERROR", 500)
}

export function getErrorMessage(error: any): string {
  if (typeof error === "string") {
    return error
  }

  if (error?.message) {
    return error.message
  }

  if (isSupabaseError(error)) {
    return error.message || "Database error occurred"
  }

  return "An unexpected error occurred"
}

export function logError(context: string, error: any, additionalData?: any) {
  console.error(`[${context}] Error:`, error)

  if (additionalData) {
    console.error(`[${context}] Additional data:`, additionalData)
  }

  // In production, you might want to send this to an error tracking service
  if (process.env.NODE_ENV === "production") {
    // Example: Sentry.captureException(error, { tags: { context }, extra: additionalData })
  }
}
