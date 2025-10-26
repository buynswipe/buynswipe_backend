"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, Loader2 } from "lucide-react"
import { VoiceSynthesisService } from "@/lib/ai-bandhu/voice-service"

interface VoiceOutputProps {
  text: string
  language?: "en" | "hi"
}

export function VoiceOutput({ text, language = "en" }: VoiceOutputProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const synthesisRef = React.useRef<VoiceSynthesisService | null>(null)

  React.useEffect(() => {
    synthesisRef.current = new VoiceSynthesisService()
    if (!synthesisRef.current.isSupported()) {
      setIsSupported(false)
    }
  }, [])

  const handleSpeak = async () => {
    if (!synthesisRef.current?.isSupported()) {
      setError("Text-to-Speech not supported")
      return
    }

    setIsSpeaking(true)
    setError(null)

    try {
      await synthesisRef.current.speak({
        text,
        language,
        rate: 1,
        pitch: 1,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSpeaking(false)
    }
  }

  const handleStop = () => {
    if (synthesisRef.current) {
      synthesisRef.current.stop()
    }
    setIsSpeaking(false)
  }

  if (!isSupported) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {isSpeaking ? (
          <Button onClick={handleStop} variant="outline" className="gap-2 bg-transparent">
            <VolumeX className="h-4 w-4" />
            Stop Speaking
          </Button>
        ) : (
          <Button onClick={handleSpeak} variant="outline" className="gap-2 bg-transparent">
            <Volume2 className="h-4 w-4" />
            Speak Response
          </Button>
        )}
      </div>

      {isSpeaking && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Speaking...</span>
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
