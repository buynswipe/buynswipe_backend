"use client"

import { useEffect, useRef, useState } from "react"
import { X, Send, Mic, Volume2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  language: "hi" | "en"
  timestamp: Date
}

interface AIBandhuDrawerProps {
  role: "retailer" | "wholesaler" | "delivery_partner"
  onClose: () => void
}

export function AIBandhuDrawer({ role, onClose }: AIBandhuDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  const roleConfig = {
    retailer: { title: "बंधु खुदरा | Retail Bandhu", subtitle: "आपका डिजिटल सहायक | Your Digital Assistant" },
    wholesaler: { title: "बंधु थोक | Wholesale Bandhu", subtitle: "व्यावसायिक विश्लेषण | Business Analytics" },
    delivery_partner: { title: "बंधु डिलीवरी | Delivery Bandhu", subtitle: "मार्ग अनुकूल | Route Optimizer" },
  }

  const config = roleConfig[role]

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
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
        if (event.results[0].isFinal) {
          setInput(transcript)
        }
      }
    }
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      language: /[\u0900-\u097F]/.test(input) ? "hi" : "en",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai-bandhu/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          role,
          conversationHistory: messages,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message,
        language: data.language || "en",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Auto-speak response
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(data.message)
        utterance.lang = data.language === "hi" ? "hi-IN" : "en-IN"
        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "माफी चाहता हूं, कुछ गलत हुआ। Please try again. | I apologize, something went wrong.",
        language: "en",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleListening = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop()
      } else {
        recognitionRef.current.start()
      }
    }
  }

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-end sm:justify-center p-4">
      <Card className="w-full max-w-md h-[600px] flex flex-col shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 flex items-center justify-between rounded-t-lg">
          <div>
            <h2 className="font-bold text-lg">{config.title}</h2>
            <p className="text-sm opacity-90">{config.subtitle}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-blue-700">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center text-gray-500">
              <div>
                <p className="font-semibold mb-2">नमस्ते 👋 | Hello!</p>
                <p className="text-sm">मुझसे कोई भी सवाल पूछें | Ask me anything!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-xs px-4 py-2 rounded-lg",
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-900 rounded-bl-none",
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                    {msg.role === "assistant" && (
                      <div className="flex gap-2 mt-2 pt-2 border-t border-gray-300">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => copyMessage(msg.id, msg.content)}
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4 space-y-3">
          {isSpeaking && (
            <Button
              variant="outline"
              size="sm"
              onClick={stopSpeaking}
              className="w-full text-red-600 border-red-600 bg-transparent"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              रोकें | Stop Speaking
            </Button>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="संदेश लिखें... | Type message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              size="icon"
              variant={isListening ? "destructive" : "outline"}
              onClick={toggleListening}
              disabled={isLoading}
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
