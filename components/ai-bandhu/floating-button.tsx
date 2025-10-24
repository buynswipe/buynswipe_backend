"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { AIBandhuDrawer } from "./ai-bandhu-drawer"

interface FloatingButtonProps {
  role: "retailer" | "wholesaler" | "delivery_partner"
}

export function AIBandhuFloatingButton({ role }: FloatingButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const roleConfig = {
    retailer: { bg: "bg-blue-600", hover: "hover:bg-blue-700", label: "ऑर्डर करें | Order Now" },
    wholesaler: { bg: "bg-green-600", hover: "hover:bg-green-700", label: "विश्लेषण | Analyze" },
    delivery_partner: { bg: "bg-purple-600", hover: "hover:bg-purple-700", label: "रूट | Route" },
  }

  const config = roleConfig[role]

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 ${config.bg} ${config.hover} text-white rounded-full shadow-lg p-4 transition-all hover:shadow-xl z-40 group`}
        aria-label="AI Bandhu Assistant"
      >
        <MessageCircle className="w-6 h-6" />
        <div className="absolute bottom-20 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
          {config.label}
        </div>
      </button>

      {/* Drawer */}
      {isOpen && <AIBandhuDrawer role={role} onClose={() => setIsOpen(false)} />}
    </>
  )
}

export const AIBandhuButton = AIBandhuFloatingButton
