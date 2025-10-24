"use client"

import { useEffect } from "react"
import { AiBandhuButton } from "./ai-bandhu-button"

export function AiBandhuWrapper() {
  useEffect(() => {
    // Listen for cart updates from AI Bandhu
    const handleCartUpdate = (event: CustomEvent) => {
      const { detail } = event
      // Dispatch to your cart state management (Redux, Zustand, Context, etc.)
      // For now, we'll just log it
      console.log("AI Bandhu cart update:", detail)
    }

    window.addEventListener("ai-bandhu-cart-update", handleCartUpdate as EventListener)
    return () => {
      window.removeEventListener("ai-bandhu-cart-update", handleCartUpdate as EventListener)
    }
  }, [])

  return <AiBandhuButton />
}
