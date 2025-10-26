// Voice service for speech-to-text and text-to-speech functionality

export interface VoiceRecognitionResult {
  text: string
  confidence: number
  language: "en" | "hi"
}

export interface VoiceSynthesisOptions {
  text: string
  language: "en" | "hi"
  rate?: number
  pitch?: number
}

// Browser-based Speech Recognition
export class VoiceRecognitionService {
  private recognition: any
  private isListening = false

  constructor(language: "en" | "hi" = "en") {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser")
      return
    }

    this.recognition = new SpeechRecognition()
    this.recognition.language = language === "hi" ? "hi-IN" : "en-IN"
    this.recognition.continuous = false
    this.recognition.interimResults = true
  }

  startListening(
    onResult: (result: VoiceRecognitionResult) => void,
    onError: (error: string) => void,
    onEnd: () => void,
  ): void {
    if (!this.recognition) {
      onError("Speech Recognition not supported")
      return
    }

    this.isListening = true

    this.recognition.onstart = () => {
      console.log("Voice recognition started")
    }

    this.recognition.onresult = (event: any) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        const confidence = event.results[i][0].confidence

        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }

        if (finalTranscript) {
          onResult({
            text: finalTranscript,
            confidence,
            language: this.recognition.language.includes("hi") ? "hi" : "en",
          })
        }
      }
    }

    this.recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      onError(event.error)
    }

    this.recognition.onend = () => {
      this.isListening = false
      onEnd()
    }

    this.recognition.start()
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }

  isSupported(): boolean {
    return !!this.recognition
  }
}

// Browser-based Speech Synthesis
export class VoiceSynthesisService {
  private synthesis: SpeechSynthesis

  constructor() {
    this.synthesis = window.speechSynthesis
  }

  speak(options: VoiceSynthesisOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error("Speech Synthesis not supported"))
        return
      }

      // Cancel any ongoing speech
      this.synthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(options.text)
      utterance.lang = options.language === "hi" ? "hi-IN" : "en-IN"
      utterance.rate = options.rate || 1
      utterance.pitch = options.pitch || 1

      utterance.onend = () => resolve()
      utterance.onerror = (event) => reject(new Error(event.error))

      this.synthesis.speak(utterance)
    })
  }

  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel()
    }
  }

  isSupported(): boolean {
    return !!this.synthesis
  }
}

// Server-side voice logging
export async function logVoiceInteraction(
  conversationId: string,
  transcribedText: string,
  language: "en" | "hi",
  confidenceScore: number,
  durationSeconds: number,
) {
  try {
    const response = await fetch("/api/ai-bandhu/voice/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        transcribedText,
        language,
        confidenceScore,
        durationSeconds,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to log voice interaction")
    }

    return await response.json()
  } catch (error) {
    console.error("Error logging voice interaction:", error)
    throw error
  }
}
