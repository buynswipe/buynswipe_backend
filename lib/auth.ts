import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
}

export async function getCurrentUser() {
  const supabase = createServerComponentClient({ cookies })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return null
    }

    const { data: user } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}
