/**
 * Log an error with context
 * @param context The context where the error occurred
 * @param error The error object
 */
export function logError(context: string, error: any) {
  console.error(`[ERROR] ${context}:`, error)

  // If this is a Supabase error, log additional details
  if (error && error.code && error.message && error.details) {
    console.error(`[ERROR DETAILS] Code: ${error.code}, Message: ${error.message}, Details: ${error.details}`)
  }

  // Log the stack trace if available
  if (error && error.stack) {
    console.error(`[ERROR STACK] ${error.stack}`)
  }
}

/**
 * Log a debug message
 * @param context The context of the debug message
 * @param message The debug message
 * @param data Optional data to log
 */
export function logDebug(context: string, message: string, data?: any) {
  console.log(`[DEBUG] ${context}: ${message}`)
  if (data !== undefined) {
    console.log(`[DEBUG DATA]`, data)
  }
}
