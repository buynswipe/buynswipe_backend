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
      // Add other table types as needed
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
