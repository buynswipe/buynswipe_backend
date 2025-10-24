"use client"

import { useState, useRef, useEffect } from "react"
import { X, Send, Mic, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"

interface Message {
  type: "user" | "ai"
  content: string
  timestamp: Date
}

interface AiBandhuDrawerProps {
  onClose: () => void
}

export function AiBandhuDrawer({ onClose }: AiBandhuDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "ai",
      content:
        "नमस्ते! 🙏 मैं AI Bandhu हूँ। आप अपने ऑर्डर के लिए कुछ भी बोलिए या लिखिए। Hello! I'm your smart shopping partner! 🛒",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "hi-IN"

      recognitionRef.current.onstart = () => setIsListening(true)
      recognitionRef.current.onend = () => setIsListening(false)
      recognitionRef.current.onresult = (event: any) => {
        let transcript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        if (event.results[event.results.length - 1].isFinal) {
          setInput(transcript)
        }
      }
    }
  }, [])

  const handleVoiceInput = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop()
      } else {
        recognitionRef.current.start()
      }
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      type: "user",
      content: input,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Call intent parsing API
      const response = await fetch("/api/ai-bandhu/parse-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: input }),
      })

      const data = await response.json()

      // Add AI response
      const aiMessage: Message = {
        type: "ai",
        content: data.message || "Sorry, I couldn't process that. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])

      // If there's a cart update, dispatch it
      if (data.cartUpdate) {
        window.dispatchEvent(new CustomEvent("ai-bandhu-cart-update", { detail: data.cartUpdate }))
      }
    } catch (error) {
      const aiMessage: Message = {
        type: "ai",
        content: "क्षमा करें, कुछ गलत हुआ। कृपया फिर से प्रयास करें। Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 cursor-pointer" onClick={onClose} aria-hidden />

      {/* Drawer Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col rounded-l-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between rounded-tl-2xl">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <div>
              <h3 className="font-bold text-lg">AI Bandhu</h3>
              <p className="text-xs text-blue-100">Your Smart Partner</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-blue-700 rounded-lg transition-colors" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
              <Card
                className={`max-w-xs px-4 py-2 ${
                  msg.type === "user"
                    ? "bg-blue-500 text-white rounded-3xl rounded-tr-sm"
                    : "bg-gray-100 text-gray-900 rounded-3xl rounded-tl-sm"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <span className="text-xs mt-1 block opacity-70">
                  {msg.timestamp.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </Card>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-gray-100 px-4 py-2 rounded-3xl rounded-tl-sm">
                <div className="flex gap-2 items-center h-6">
                  <Loader className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-600">AI Bandhu is thinking...</span>
                </div>
              </Card>
            </div>
          )}
          <div ref={scrollRef} />
        </ScrollArea>

        {/* Footer with tagline */}
        <div className="border-t p-2 text-center text-xs text-gray-500 bg-gray-50">
          हर दुकान बने डिजिटल दुकान | Bolo Bandhu, Order Ho Gaya! 🚀
        </div>

        {/* Input Area */}
        <div className="border-t p-4 space-y-3">
          {/* Waveform indicator */}
          {isListening && (
            <div className="flex items-center gap-1 justify-center h-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-blue-500 rounded-full animate-pulse"
                  style={{
                    height: `${10 + i * 8}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
              <span className="text-xs text-blue-600 ml-2">Listening...</span>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleSendMessage()
                }
              }}
              placeholder="बोलिए या लिखिए... Speak or type..."
              className="flex-1 rounded-full"
              disabled={isLoading}
            />
            <Button
              size="icon"
              onClick={handleVoiceInput}
              variant={isListening ? "default" : "outline"}
              className="rounded-full"
              aria-label="Toggle voice input"
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="rounded-full bg-blue-500 hover:bg-blue-600"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
