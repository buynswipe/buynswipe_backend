"use client"

import { useState, useRef, useEffect } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send, Mic, Copy, Volume2, VolumeX, MicOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  language: "hi" | "en"
  timestamp: Date
}

interface AIBandhuDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function AIBandhuDrawer({ isOpen, onClose }: AIBandhuDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [userRole, setUserRole] = useState<"retailer" | "wholesaler" | "delivery">("retailer")
  const [language, setLanguage] = useState<"hi" | "en">("en")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.language = language === "hi" ? "hi-IN" : "en-US"
        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join("")
          setInputValue((prev) => prev + " " + transcript)
        }
      }
    }
  }, [language])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const startListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Please use a modern browser for voice input.",
        variant: "destructive",
      })
      return
    }

    setIsListening(true)
    recognitionRef.current.start()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) {
      toast({
        title: "Text-to-Speech Not Available",
        description: "Your browser does not support text-to-speech.",
        variant: "destructive",
      })
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.language = language === "hi" ? "hi-IN" : "en-US"
    utterance.rate = 0.9
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Math.random().toString(),
      role: "user",
      content: inputValue,
      language,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai-bandhu/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputValue,
          role: userRole,
          language,
          conversationHistory: messages,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()
      const assistantMessage: Message = {
        id: Math.random().toString(),
        role: "assistant",
        content: data.message,
        language,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Auto-speak response
      if (language === "hi") {
        speak(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Message copied to clipboard.",
    })
  }

  const clearHistory = () => {
    setMessages([])
    toast({
      title: "History Cleared",
      description: "Chat history has been cleared.",
    })
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[90vh] max-w-2xl mx-auto">
        <DrawerHeader className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle>Bandhu AI Assistant</DrawerTitle>
              <p className="text-sm text-slate-500 mt-1">Your personal business advisor</p>
            </div>
          </div>

          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Role</label>
                <div className="flex gap-2 mt-2">
                  {(["retailer", "wholesaler", "delivery"] as const).map((role) => (
                    <Button
                      key={role}
                      variant={userRole === role ? "default" : "outline"}
                      onClick={() => setUserRole(role)}
                      className="capitalize"
                    >
                      {role}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Language</label>
                <div className="flex gap-2 mt-2">
                  {(["en", "hi"] as const).map((lang) => (
                    <Button
                      key={lang}
                      variant={language === lang ? "default" : "outline"}
                      onClick={() => setLanguage(lang)}
                    >
                      {lang === "en" ? "English" : "हिंदी"}
                    </Button>
                  ))}
                </div>
              </div>

              <Button onClick={clearHistory} variant="destructive" className="w-full">
                Clear History
              </Button>
            </TabsContent>

            <TabsContent value="chat" className="space-y-4">
              <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500">
                      <p>Start a conversation with Bandhu AI</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <Card
                        key={msg.id}
                        className={`p-3 ${msg.role === "user" ? "bg-orange-50 ml-8" : "bg-slate-50 mr-8"}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-slate-600 mb-1">
                              {msg.role === "user" ? "You" : "Bandhu"}
                            </p>
                            <p className="text-sm text-slate-900">{msg.content}</p>
                          </div>
                          <div className="flex gap-1">
                            {msg.role === "assistant" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => speak(msg.content)}
                                className="h-6 w-6 p-0"
                              >
                                {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyMessage(msg.content)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  placeholder={language === "hi" ? "संदेश भेजें..." : "Type a message..."}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={isLoading}
                />
                <Button
                  onClick={isListening ? stopListening : startListening}
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  disabled={isLoading}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()} size="icon">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  )
}
