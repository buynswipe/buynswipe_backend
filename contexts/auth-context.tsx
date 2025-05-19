"use client"

import { useContext } from "react"
import type React from "react"
import { useState, useEffect, useRef, createContext } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/supabase-js"

// Update the AuthContextType to include signOut function
type AuthContextType = {
  user: User | null
  isLoading: boolean
  error: string | null
  signOut: () => Promise<void>
}

// Update the default context value to include a no-op signOut function
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  signOut: async () => {},
})

// In the AuthProvider component, implement the signOut function
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Create a single Supabase client instance using useRef
  const supabaseClient = useRef(createClientComponentClient())
  const supabase = supabaseClient.current

  // Add the signOut function
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      // The auth state change listener will update the user state
    } catch (error: any) {
      console.error("Error signing out:", error)
    }
  }

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          // Handle specific auth errors gracefully
          if (sessionError.message.includes("refresh_token_not_found")) {
            console.warn("Session expired or invalid, redirecting to login")
            // Clear any stale auth state
            setUser(null)
          } else {
            throw sessionError
          }
        } else {
          setUser(session?.user || null)
        }
      } catch (error: any) {
        console.error("Error getting session:", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  // Include signOut in the context value
  return <AuthContext.Provider value={{ user, isLoading, error, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
