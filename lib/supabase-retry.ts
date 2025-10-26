/**
 * Retry logic for Supabase operations with exponential backoff
 */

interface RetryOptions {
  maxAttempts?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
}

export async function withRetry<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error | null = null
  let delay = config.initialDelayMs

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt === config.maxAttempts) {
        break
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay))

      // Increase delay for next attempt
      delay = Math.min(delay * config.backoffMultiplier, config.maxDelayMs)
    }
  }

  throw lastError || new Error("Operation failed after retries")
}

/**
 * Retry wrapper for async operations with logging
 */
export async function withRetryAndLogging<T>(
  operation: () => Promise<T>,
  operationName: string,
  options: RetryOptions = {},
): Promise<T> {
  return withRetry(async () => {
    try {
      return await operation()
    } catch (error) {
      console.error(`[Supabase] ${operationName} failed:`, error)
      throw error
    }
  }, options)
}
