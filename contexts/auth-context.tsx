"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: User | null
  profile: any | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const refreshUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setUser(session.user)

        // Get user profile
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setProfile(profileData)
      } else {
        setUser(null)
        setProfile(null)
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user)

        // Get user profile
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setProfile(profileData)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
      router.refresh()
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, router])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshUser }}>{children}</AuthContext.Provider>
  )
}
