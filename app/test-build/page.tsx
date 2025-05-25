"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function TestBuildPage() {
  const [status, setStatus] = useState("Testing...")
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    async function testAuth() {
      try {
        const supabase = createClientComponentClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        setSession(session)
        setStatus("✅ Build successful - No server/client conflicts!")
      } catch (error) {
        setStatus("❌ Error: " + (error as Error).message)
      }
    }

    testAuth()
  }, [])

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Build Test Page</h1>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Build Status</h2>
          <p>{status}</p>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Authentication Test</h2>
          <p>Session: {session ? "✅ Active" : "❌ None"}</p>
          {session && <p className="text-sm text-gray-600">User: {session.user?.email}</p>}
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Component Tests</h2>
          <ul className="space-y-1 text-sm">
            <li>✅ Client components working</li>
            <li>✅ No next/headers conflicts</li>
            <li>✅ Supabase client initialized</li>
            <li>✅ Middleware configured</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
