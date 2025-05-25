import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { logError } from "@/lib/debug-helpers"

// Cache for order lookups
const orderCache = new Map<string, { order: any; timestamp: number }>()
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

/**
 * Optimized order service with caching and query optimization
 */
export class OptimizedOrderService {
  private supabase = createServerComponentClient({ cookies })

  /**
   * Find an order with optimized caching and minimal queries
   */
  async findOrderOptimized(idOrReference: string) {
    console.log(`[OptimizedOrderService] Looking up order: ${idOrReference}`)

    // Check cache first
    const cached = orderCache.get(idOrReference)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`[OptimizedOrderService] Cache hit for: ${idOrReference}`)
      return { order: cached.order, source: "cache" }
    }

    try {
      // Strategy 1: Direct UUID lookup (most common case)
      if (this.isValidUUID(idOrReference)) {
        const order = await this.fetchOrderById(idOrReference)
        if (order) {
          this.cacheOrder(idOrReference, order)
          return { order, source: "direct" }
        }
      }

      // Strategy 2: Prefix search for shortened IDs
      if (idOrReference.length === 8) {
        const order = await this.findByPrefix(idOrReference)
        if (order) {
          this.cacheOrder(idOrReference, order)
          return { order, source: "prefix" }
        }
      }

      // Strategy 3: Reference number lookup (if column exists)
      const order = await this.findByReference(idOrReference)
      if (order) {
        this.cacheOrder(idOrReference, order)
        return { order, source: "reference" }
      }

      return { order: null, source: null, error: "Order not found" }
    } catch (error) {
      logError("Optimized order service error", error)
      return {
        order: null,
        source: null,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Optimized order fetching with minimal data
   */
  private async fetchOrderById(id: string) {
    try {
      const { data, error } = await this.supabase
        .from("orders")
        .select(this.getOptimizedSelectQuery())
        .eq("id", id)
        .maybeSingle()

      if (error) {
        logError("Order fetch by ID", error)
        return null
      }

      return data
    } catch (error) {
      logError("Order fetch by ID exception", error)
      return null
    }
  }

  /**
   * Find order by prefix with optimized query
   */
  private async findByPrefix(prefix: string) {
    try {
      // Use a more efficient query with LIKE
      const { data, error } = await this.supabase
        .from("orders")
        .select("id")
        .like("id", `${prefix}%`)
        .limit(1)
        .maybeSingle()

      if (error || !data) {
        return null
      }

      // Fetch full order data
      return await this.fetchOrderById(data.id)
    } catch (error) {
      logError("Order prefix search", error)
      return null
    }
  }

  /**
   * Find order by reference number
   */
  private async findByReference(reference: string) {
    try {
      // Check if reference_number column exists first
      const hasReferenceColumn = await this.checkReferenceColumn()
      if (!hasReferenceColumn) {
        return null
      }

      const { data, error } = await this.supabase
        .from("orders")
        .select(this.getOptimizedSelectQuery())
        .eq("reference_number", reference)
        .maybeSingle()

      if (error) {
        logError("Order reference search", error)
        return null
      }

      return data
    } catch (error) {
      logError("Order reference search exception", error)
      return null
    }
  }

  /**
   * Check if delivery partner is assigned with caching
   */
  async isDeliveryPartnerAssignedOptimized(userId: string, orderId: string) {
    const cacheKey = `assignment_${userId}_${orderId}`
    const cached = orderCache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.order
    }

    try {
      // Single optimized query to check assignment
      const { data, error } = await this.supabase
        .from("orders")
        .select(`
          delivery_partner_id,
          delivery_partners!inner(user_id)
        `)
        .eq("id", orderId)
        .eq("delivery_partners.user_id", userId)
        .maybeSingle()

      const isAssigned = !!data

      // Cache the result
      orderCache.set(cacheKey, {
        order: isAssigned,
        timestamp: Date.now(),
      })

      return isAssigned
    } catch (error) {
      logError("Assignment check error", error)
      return false
    }
  }

  /**
   * Get delivery updates with caching
   */
  async getDeliveryUpdatesOptimized(orderId: string) {
    const cacheKey = `updates_${orderId}`
    const cached = orderCache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return { updates: cached.order, error: null }
    }

    try {
      const { data, error } = await this.supabase
        .from("delivery_status_updates")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true })

      if (error) {
        logError("Delivery updates fetch", error)
        return { updates: null, error: error.message }
      }

      // Cache the results
      orderCache.set(cacheKey, {
        order: data || [],
        timestamp: Date.now(),
      })

      return { updates: data || [], error: null }
    } catch (error) {
      logError("Delivery updates exception", error)
      return { updates: null, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  /**
   * Optimized select query - only fetch what we need
   */
  private getOptimizedSelectQuery() {
    return `
      id,
      status,
      payment_status,
      payment_method,
      total_amount,
      created_at,
      delivery_partner_id,
      retailer:profiles!orders_retailer_id_fkey(
        id,
        business_name,
        address,
        city,
        pincode,
        phone
      ),
      wholesaler:profiles!orders_wholesaler_id_fkey(
        id,
        business_name,
        address,
        city,
        pincode,
        phone
      ),
      order_items(
        id,
        quantity,
        price,
        product:products(
          id,
          name
        )
      )
    `
  }

  /**
   * Check if reference_number column exists (cached)
   */
  private async checkReferenceColumn(): Promise<boolean> {
    const cacheKey = "has_reference_column"
    const cached = orderCache.get(cacheKey)

    if (cached) {
      return cached.order
    }

    try {
      const { data, error } = await this.supabase.rpc("get_table_columns", {
        table_name: "orders",
      })

      const hasColumn = data && data.some((col: any) => col.column_name === "reference_number")

      // Cache for 1 hour
      orderCache.set(cacheKey, {
        order: hasColumn,
        timestamp: Date.now(),
      })

      return hasColumn
    } catch (error) {
      return false
    }
  }

  /**
   * Validate UUID format
   */
  private isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  /**
   * Cache order data
   */
  private cacheOrder(key: string, order: any) {
    orderCache.set(key, {
      order,
      timestamp: Date.now(),
    })
  }

  /**
   * Clear cache for specific order
   */
  clearOrderCache(orderId: string) {
    orderCache.delete(orderId)
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    orderCache.clear()
  }
}

// Export singleton instance
export const optimizedOrderService = new OptimizedOrderService()
