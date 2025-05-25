export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string
          business_name: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          pincode: string | null
          gst_number: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role: string
          business_name?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          gst_number?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string
          business_name?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          gst_number?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          wholesaler_id: string
          status: string
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wholesaler_id: string
          status?: string
          total_amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wholesaler_id?: string
          status?: string
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          category: string
          wholesaler_id: string
          stock_quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          category: string
          wholesaler_id: string
          stock_quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          category?: string
          wholesaler_id?: string
          stock_quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T]
