"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { AIBandhuDrawer } from "./ai-bandhu-drawer"

export function AIBandhuFloatingButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
      }
    }
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg z-40"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      <AIBandhuDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

export { AIBandhuDrawer }
