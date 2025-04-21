import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

// Create a Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Export a db object that can be used instead of prisma
export const db = createClient<Database>(supabaseUrl, supabaseKey)

// For compatibility with code expecting prisma
export const prisma = {
  order: {
    findUnique: async ({ where }: { where: { id: string } }) => {
      const { data } = await db.from("orders").select("*").eq("id", where.id).single()
      return data
    },
    findMany: async (options: any = {}) => {
      let query = db.from("orders").select("*")

      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            // Handle complex queries like { userId: { equals: 'some-id' } }
            const subKey = Object.keys(value)[0]
            const subValue = Object.values(value)[0]

            if (subKey === "equals") {
              query = query.eq(key, subValue)
            } else if (subKey === "in") {
              query = query.in(key, subValue as any[])
            }
          } else {
            // Simple equality
            query = query.eq(key, value)
          }
        })
      }

      if (options.orderBy) {
        const [field, direction] = Object.entries(options.orderBy)[0]
        query = query.order(field as any, { ascending: direction === "asc" })
      }

      if (options.take) {
        query = query.limit(options.take)
      }

      const { data } = await query
      return data || []
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const { data: result } = await db.from("orders").update(data).eq("id", where.id).select().single()
      return result
    },
    create: async ({ data }: { data: any }) => {
      const { data: result } = await db.from("orders").insert(data).select().single()
      return result
    },
  },
  // Add other models as needed
}
