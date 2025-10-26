"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { VoiceRecognitionService, logVoiceInteraction } from "@/lib/ai-bandhu/voice-service"

interface VoiceInputProps {
  onTranscript: (text: string) => void
  language?: "en" | "hi"
  conversationId?: string
}

export function VoiceInput({ onTranscript, language = "en", conversationId }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<VoiceRecognitionService | null>(null)
  const startTimeRef = useRef<number>(0)

  const initializeRecognition = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = new VoiceRecognitionService(language)
      if (!recognitionRef.current.isSupported()) {
        setIsSupported(false)
        setError("Speech Recognition not supported in your browser")
      }
    }
  }

  const handleStartListening = () => {
    initializeRecognition()

    if (!recognitionRef.current?.isSupported()) {
      setError("Speech Recognition not supported")
      return
    }

    setIsListening(true)
    setTranscript("")
    setError(null)
    startTimeRef.current = Date.now()

    recognitionRef.current.startListening(
      (result) => {
        setTranscript(result.text)
      },
      (error) => {
        setError(error)
        setIsListening(false)
      },
      async () => {
        setIsListening(false)

        if (transcript) {
          onTranscript(transcript)

          // Log voice interaction if conversationId is provided
          if (conversationId) {
            const durationSeconds = (Date.now() - startTimeRef.current) / 1000
            try {
              await logVoiceInteraction(conversationId, transcript, language, 0.95, durationSeconds)
            } catch (err) {
              console.error("Failed to log voice interaction:", err)
            }
          }

          setTranscript("")
        }
      },
    )
  }

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stopListening()
    }
    setIsListening(false)
  }

  if (!isSupported) {
    return (
      <div className="text-sm text-muted-foreground">
        <p>Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {isListening ? (
          <Button onClick={handleStopListening} variant="destructive" className="gap-2">
            <MicOff className="h-4 w-4" />
            Stop Listening
          </Button>
        ) : (
          <Button onClick={handleStartListening} variant="outline" className="gap-2 bg-transparent">
            <Mic className="h-4 w-4" />
            Start Voice Input
          </Button>
        )}
      </div>

      {isListening && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Listening...</span>
        </div>
      )}

      {transcript && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium">Transcript:</p>
          <p className="text-sm text-foreground mt-1">{transcript}</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  )
}
