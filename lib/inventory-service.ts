import { createClient } from "@supabase/supabase-js"

interface InventoryItem {
  id: string
  name: string
  barcode: string
  category: string
  price: number
  costPrice: number
  stock: number
  minStock: number
  maxStock: number
  supplier: string
  location: string
  lastRestocked: Date
  expiryDate?: Date
  batchNumber?: string
  isActive: boolean
  tags: string[]
  images: string[]
  description: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
}

interface StockMovement {
  id: string
  itemId: string
  type: "IN" | "OUT" | "ADJUSTMENT" | "TRANSFER"
  quantity: number
  reason: string
  reference?: string
  userId: string
  timestamp: Date
  cost?: number
  notes?: string
}

interface LowStockAlert {
  id: string
  itemId: string
  currentStock: number
  minStock: number
  severity: "LOW" | "CRITICAL" | "OUT_OF_STOCK"
  createdAt: Date
  acknowledged: boolean
}

export class InventoryService {
  private supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  async getInventoryItem(barcode: string): Promise<InventoryItem | null> {
    try {
      const { data, error } = await this.supabase
        .from("inventory_items")
        .select("*")
        .eq("barcode", barcode)
        .eq("isActive", true)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error("Error fetching inventory item:", error)
      return null
    }
  }

  async searchInventory(
    query: string,
    filters?: {
      category?: string
      supplier?: string
      lowStock?: boolean
      outOfStock?: boolean
    },
  ): Promise<InventoryItem[]> {
    try {
      let queryBuilder = this.supabase.from("inventory_items").select("*").eq("isActive", true)

      // Text search
      if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,barcode.ilike.%${query}%,description.ilike.%${query}%`)
      }

      // Apply filters
      if (filters?.category) {
        queryBuilder = queryBuilder.eq("category", filters.category)
      }

      if (filters?.supplier) {
        queryBuilder = queryBuilder.eq("supplier", filters.supplier)
      }

      if (filters?.lowStock) {
        queryBuilder = queryBuilder.lt("stock", "minStock")
      }

      if (filters?.outOfStock) {
        queryBuilder = queryBuilder.eq("stock", 0)
      }

      const { data, error } = await queryBuilder.order("name")

      if (error) throw error

      return data || []
    } catch (error) {
      console.error("Error searching inventory:", error)
      return []
    }
  }

  async updateStock(
    itemId: string,
    quantity: number,
    type: StockMovement["type"],
    reason: string,
    userId: string,
  ): Promise<boolean> {
    try {
      // Start a transaction
      const { data: item, error: fetchError } = await this.supabase
        .from("inventory_items")
        .select("stock")
        .eq("id", itemId)
        .single()

      if (fetchError) throw fetchError

      const newStock = type === "IN" ? item.stock + quantity : item.stock - quantity

      if (newStock < 0) {
        throw new Error("Insufficient stock")
      }

      // Update stock
      const { error: updateError } = await this.supabase
        .from("inventory_items")
        .update({
          stock: newStock,
          lastRestocked: type === "IN" ? new Date().toISOString() : undefined,
        })
        .eq("id", itemId)

      if (updateError) throw updateError

      // Record stock movement
      const { error: movementError } = await this.supabase.from("stock_movements").insert({
        itemId,
        type,
        quantity,
        reason,
        userId,
        timestamp: new Date().toISOString(),
      })

      if (movementError) throw movementError

      // Check for low stock alerts
      await this.checkLowStockAlerts(itemId)

      return true
    } catch (error) {
      console.error("Error updating stock:", error)
      return false
    }
  }

  async addInventoryItem(item: Omit<InventoryItem, "id">): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.from("inventory_items").insert(item).select("id").single()

      if (error) throw error

      return data.id
    } catch (error) {
      console.error("Error adding inventory item:", error)
      return null
    }
  }

  async getLowStockAlerts(): Promise<LowStockAlert[]> {
    try {
      const { data, error } = await this.supabase
        .from("low_stock_alerts")
        .select(`
          *,
          inventory_items (
            name,
            barcode,
            category
          )
        `)
        .eq("acknowledged", false)
        .order("severity", { ascending: false })
        .order("createdAt", { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error("Error fetching low stock alerts:", error)
      return []
    }
  }

  private async checkLowStockAlerts(itemId: string): Promise<void> {
    try {
      const { data: item, error } = await this.supabase
        .from("inventory_items")
        .select("stock, minStock")
        .eq("id", itemId)
        .single()

      if (error) throw error

      let severity: LowStockAlert["severity"] | null = null

      if (item.stock === 0) {
        severity = "OUT_OF_STOCK"
      } else if (item.stock <= item.minStock * 0.5) {
        severity = "CRITICAL"
      } else if (item.stock <= item.minStock) {
        severity = "LOW"
      }

      if (severity) {
        // Check if alert already exists
        const { data: existingAlert } = await this.supabase
          .from("low_stock_alerts")
          .select("id")
          .eq("itemId", itemId)
          .eq("acknowledged", false)
          .single()

        if (!existingAlert) {
          await this.supabase.from("low_stock_alerts").insert({
            itemId,
            currentStock: item.stock,
            minStock: item.minStock,
            severity,
            createdAt: new Date().toISOString(),
            acknowledged: false,
          })
        }
      }
    } catch (error) {
      console.error("Error checking low stock alerts:", error)
    }
  }

  async getStockMovements(itemId?: string, limit = 50): Promise<StockMovement[]> {
    try {
      let query = this.supabase
        .from("stock_movements")
        .select(`
          *,
          inventory_items (
            name,
            barcode
          )
        `)
        .order("timestamp", { ascending: false })
        .limit(limit)

      if (itemId) {
        query = query.eq("itemId", itemId)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error) {
      console.error("Error fetching stock movements:", error)
      return []
    }
  }

  async getInventoryStats(): Promise<{
    totalItems: number
    totalValue: number
    lowStockItems: number
    outOfStockItems: number
    categories: { name: string; count: number; value: number }[]
  }> {
    try {
      const { data: items, error } = await this.supabase
        .from("inventory_items")
        .select("stock, price, costPrice, category")
        .eq("isActive", true)

      if (error) throw error

      const stats = {
        totalItems: items.length,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        categories: [] as { name: string; count: number; value: number }[],
      }

      const categoryMap = new Map<string, { count: number; value: number }>()

      items.forEach((item) => {
        const itemValue = item.stock * item.costPrice
        stats.totalValue += itemValue

        if (item.stock === 0) {
          stats.outOfStockItems++
        } else if (item.stock <= 5) {
          // Assuming minStock is around 5 for simplicity
          stats.lowStockItems++
        }

        const category = categoryMap.get(item.category) || { count: 0, value: 0 }
        category.count++
        category.value += itemValue
        categoryMap.set(item.category, category)
      })

      stats.categories = Array.from(categoryMap.entries()).map(([name, data]) => ({
        name,
        ...data,
      }))

      return stats
    } catch (error) {
      console.error("Error fetching inventory stats:", error)
      return {
        totalItems: 0,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        categories: [],
      }
    }
  }

  async generateReorderReport(): Promise<
    {
      item: InventoryItem
      suggestedQuantity: number
      estimatedCost: number
      priority: "HIGH" | "MEDIUM" | "LOW"
    }[]
  > {
    try {
      const { data: items, error } = await this.supabase
        .from("inventory_items")
        .select("*")
        .lte("stock", "minStock")
        .eq("isActive", true)
        .order("stock")

      if (error) throw error

      return items.map((item) => {
        const suggestedQuantity = Math.max(item.maxStock - item.stock, item.minStock * 2)
        const estimatedCost = suggestedQuantity * item.costPrice

        let priority: "HIGH" | "MEDIUM" | "LOW" = "LOW"
        if (item.stock === 0) {
          priority = "HIGH"
        } else if (item.stock <= item.minStock * 0.5) {
          priority = "MEDIUM"
        }

        return {
          item,
          suggestedQuantity,
          estimatedCost,
          priority,
        }
      })
    } catch (error) {
      console.error("Error generating reorder report:", error)
      return []
    }
  }
}

export const inventoryService = new InventoryService()
