import type { AIBandhuRoleConfig } from "./types"

export const AI_BANDHU_ROLE_CONFIG: Record<string, AIBandhuRoleConfig> = {
  retailer: {
    role: "retailer",
    dashboardPath: "/ai-bandhu/retailer",
    features: ["voice-orders", "product-recommendations", "order-tracking", "chat-support"],
    defaultLanguage: "en",
  },
  wholesaler: {
    role: "wholesaler",
    dashboardPath: "/ai-bandhu/wholesaler",
    features: ["voice-orders", "inventory-insights", "delivery-coordination", "chat-support"],
    defaultLanguage: "en",
  },
  delivery_partner: {
    role: "delivery_partner",
    dashboardPath: "/ai-bandhu/delivery-partner",
    features: ["voice-tracking", "route-optimization", "notifications", "chat-support"],
    defaultLanguage: "en",
  },
  admin: {
    role: "admin",
    dashboardPath: "/ai-bandhu/admin",
    features: ["all"],
    defaultLanguage: "en",
  },
}

export function getAIBandhuConfig(role: string): AIBandhuRoleConfig | null {
  return AI_BANDHU_ROLE_CONFIG[role] || null
}
