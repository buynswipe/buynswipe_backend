import { createClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("Google Photos media endpoint called")
    const pageToken = request.nextUrl.searchParams.get("pageToken")

    // Get the current user
    const supabase = createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("Error getting user:", userError)
      return NextResponse.json(
        { connected: false, message: "Authentication error: " + userError.message },
        { status: 401 },
      )
    }

    if (!user) {
      console.error("No user found")
      return NextResponse.json({ connected: false, message: "Authentication error: User not found" }, { status: 401 })
    }

    // Check if the user has connected Google Photos
    const { data: integration, error: integrationError } = await supabase
      .from("user_integrations")
      .select("access_token, refresh_token, token_expires_at")
      .eq("user_id", user.id)
      .eq("provider", "google_photos")
      .single()

    if (integrationError) {
      console.error("Error checking Google Photos integration:", integrationError)
      return NextResponse.json(
        {
          connected: false,
          message: "Google Photos not connected. Please connect your account.",
        },
        { status: 200 },
      )
    }

    if (!integration) {
      return NextResponse.json(
        {
          connected: false,
          message: "Google Photos not connected. Please connect your account.",
        },
        { status: 200 },
      )
    }

    // Check if the token is expired
    const tokenExpiresAt = new Date(integration.token_expires_at).getTime()
    const now = Date.now()
    const isExpired = tokenExpiresAt <= now

    let accessToken = integration.access_token

    // If token is expired, refresh it
    if (isExpired) {
      if (!integration.refresh_token) {
        return NextResponse.json(
          {
            connected: false,
            message: "Google Photos authentication expired. Please reconnect your account.",
          },
          { status: 200 },
        )
      }

      try {
        console.log("Refreshing token")
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            refresh_token: integration.refresh_token,
            grant_type: "refresh_token",
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Error refreshing token:", response.status, errorText)
          return NextResponse.json(
            {
              connected: false,
              message: "Failed to refresh authentication. Please reconnect your account.",
            },
            { status: 200 },
          )
        }

        const data = await response.json()
        accessToken = data.access_token

        // Update the token in the database
        const expiresAt = new Date(now + data.expires_in * 1000).toISOString()
        const { error: updateError } = await supabase
          .from("user_integrations")
          .update({
            access_token: accessToken,
            token_expires_at: expiresAt,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .eq("provider", "google_photos")

        if (updateError) {
          console.error("Error updating token:", updateError)
        }
      } catch (error) {
        console.error("Error refreshing token:", error)
        return NextResponse.json(
          {
            connected: false,
            message: "Failed to refresh authentication. Please reconnect your account.",
          },
          { status: 200 },
        )
      }
    }

    // Fetch media items from Google Photos
    try {
      console.log("Fetching media items from Google Photos")
      let url = "https://photoslibrary.googleapis.com/v1/mediaItems"

      if (pageToken) {
        url += `?pageToken=${pageToken}&pageSize=24`
      } else {
        url += "?pageSize=24"
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error fetching media items:", response.status, errorText)
        return NextResponse.json(
          {
            connected: false,
            message: "Failed to fetch media items. Please try reconnecting your account.",
          },
          { status: 200 },
        )
      }

      const data = await response.json()
      return NextResponse.json({
        connected: true,
        mediaItems: data.mediaItems || [],
        nextPageToken: data.nextPageToken || null,
      })
    } catch (error) {
      console.error("Error fetching media items:", error)
      return NextResponse.json(
        {
          connected: false,
          message: "Failed to fetch media items. Please try again.",
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("Unexpected error in Google Photos media endpoint:", error)
    return NextResponse.json({ message: "An unexpected error occurred: " + (error as Error).message }, { status: 500 })
  }
}
