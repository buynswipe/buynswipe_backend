import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { nanoid } from "nanoid"

export async function GET(request: Request) {
  try {
    console.log("Google Photos auth endpoint called")

    // Create a direct Supabase admin client
    const supabaseAdmin = createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser()

    if (userError) {
      console.error("Error getting user:", userError)
      return NextResponse.json({ message: "Authentication error: " + userError.message }, { status: 401 })
    }

    if (!user) {
      console.error("No user found")
      return NextResponse.json({ message: "Unauthorized - Please log in" }, { status: 401 })
    }

    // Generate a state parameter to prevent CSRF attacks
    const state = nanoid()

    // Store the state in a cookie
    cookies().set("google_photos_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    })

    // Store the user ID in a cookie for the callback
    cookies().set("google_photos_user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    })

    // Construct the OAuth URL
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google-photos/callback`
    const scope = encodeURIComponent("https://www.googleapis.com/auth/photoslibrary.readonly")

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    }&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`

    console.log("Generated auth URL:", authUrl)
    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error("Error initiating Google Photos auth:", error)
    return NextResponse.json({ message: "An unexpected error occurred: " + (error as Error).message }, { status: 500 })
  }
}
