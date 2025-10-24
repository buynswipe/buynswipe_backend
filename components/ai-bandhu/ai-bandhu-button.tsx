"use client"

import { useState } from "react"
import { AiBandhuDrawer } from "./ai-bandhu-drawer"

export function AiBandhuButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 group"
        aria-label="Open AI Bandhu assistant"
      >
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-blue-500 rounded-full opacity-0 group-hover:opacity-75 transition-opacity duration-300 blur-lg animate-pulse" />

          {/* Button */}
          <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
            <div className="text-2xl">🤖</div>
          </div>

          {/* Pulsing indicator */}
          <div className="absolute top-0 right-0 h-3 w-3 bg-green-400 rounded-full animate-pulse shadow-lg" />
        </div>
      </button>

      {/* Drawer */}
      {isOpen && <AiBandhuDrawer onClose={() => setIsOpen(false)} />}
    </>
  )
}
