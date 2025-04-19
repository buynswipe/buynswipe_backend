export type UserRole = "admin" | "retailer" | "wholesaler" | "delivery_partner"

export interface UserProfile {
  id: string
  created_at: string
  email: string
  role: UserRole
  business_name: string
  phone: string
  address: string
  city: string
  pincode: string
  is_approved: boolean
  gst_number?: string | null
  latitude?: number
  longitude?: number
}

export interface Product {
  id: string
  created_at: string
  wholesaler_id: string
  name: string
  description: string | null
  category: string
  price: number
  stock_quantity: number
  initial_quantity: number
  image_url?: string | null
}

export interface Order {
  id: string
  created_at: string
  retailer_id: string
  wholesaler_id: string
  status: "placed" | "confirmed" | "dispatched" | "delivered" | "rejected"
  payment_method: "cod" | "upi"
  payment_status: "pending" | "paid"
  total_amount: number
  notes?: string | null
  estimated_delivery?: string | null
  delivery_partner_id?: string | null
  delivery_instructions?: string | null
  payment_reference?: string | null
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
}

export interface Transaction {
  id: string
  created_at: string
  order_id: string
  amount: number
  payment_method: "cod" | "upi"
  status: "pending" | "completed" | "failed"
  transaction_fee: number
  payment_gateway?: string | null
  gateway_transaction_id?: string | null
  metadata?: any
  external_reference?: string | null
}

export interface DeliveryPartner {
  id: string
  created_at: string
  name: string
  phone: string
  email: string | null
  vehicle_type: "bike" | "auto" | "van" | "truck"
  vehicle_number: string
  license_number: string | null
  address: string
  city: string
  pincode: string
  is_active: boolean
  wholesaler_id?: string | null
  user_id?: string | null
  total_earnings?: number | null
  pending_payout?: number | null
  last_payout_date?: string | null
  total_deliveries?: number | null
  on_time_deliveries?: number | null
  rating?: number | null
}

// DeliveryStatusUpdate type
export interface DeliveryStatusUpdate {
  id: string
  order_id: string
  delivery_partner_id: string
  status: "assigned" | "picked_up" | "in_transit" | "delivered" | "failed"
  location_lat?: number | null
  location_lng?: number | null
  notes?: string | null
  created_at: string
}

// DeliveryProof type
export interface DeliveryProof {
  id: string
  order_id: string
  delivery_partner_id: string
  photo_url?: string | null
  signature_url?: string | null
  receiver_name: string
  notes?: string | null
  created_at: string
}

// DeliveryPartnerEarning type
export interface DeliveryPartnerEarning {
  id: string
  delivery_partner_id: string
  order_id: string
  amount: number
  status: "pending" | "paid" | "cancelled"
  payout_id?: string | null
  created_at: string
  paid_at?: string | null
}

// Chat Support System Types
export interface Conversation {
  id: string
  user_id: string
  title: string | null
  created_at: string
  updated_at: string
  status: "active" | "closed" | "archived"
  assigned_to: string | null
  is_escalated: boolean
  language: string
  metadata: Record<string, any> | null
}

export interface Message {
  id: string
  conversation_id: string
  sender_type: "user" | "ai" | "agent"
  sender_id: string | null
  content: string
  created_at: string
  metadata: Record<string, any> | null
}

export interface ChatFeedback {
  id: string
  message_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface SuggestedResponse {
  id: string
  category: string
  trigger_keywords: string[]
  response_text: string
  created_at: string
  updated_at: string
  language: string
}
