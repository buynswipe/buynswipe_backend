import { createClient } from "@/lib/supabase-server"

const GOOGLE_PHOTOS_API_BASE_URL = "https://photoslibrary.googleapis.com/v1"

interface GooglePhotosTokens {
  access_token: string
  refresh_token?: string
  expires_at: number
}

export async function getUserTokens(userId: string): Promise<GooglePhotosTokens | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("user_integrations")
    .select("access_token, refresh_token, token_expires_at")
    .eq("user_id", userId)
    .eq("provider", "google_photos")
    .single()

  if (error || !data) {
    console.error("Error fetching Google Photos tokens:", error)
    return null
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: new Date(data.token_expires_at).getTime(),
  }
}

export async function refreshGooglePhotosToken(refreshToken: string) {
  try {
    console.log("Refreshing Google Photos token")
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error refreshing token:", response.status, errorText)
      throw new Error(`Failed to refresh token: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log("Token refreshed successfully")
    return {
      access_token: data.access_token,
      expires_in: data.expires_in || 3600,
    }
  } catch (error) {
    console.error("Error in refreshGooglePhotosToken:", error)
    throw error
  }
}

export async function refreshAccessToken(userId: string, refresh_token: string): Promise<GooglePhotosTokens | null> {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token,
        grant_type: "refresh_token",
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`)
    }

    const data = await response.json()

    // Calculate expiration time (usually 1 hour from now)
    const expiresAt = Date.now() + data.expires_in * 1000

    // Update the token in the database
    const supabase = createClient()
    const { error } = await supabase
      .from("user_integrations")
      .update({
        access_token: data.access_token,
        token_expires_at: new Date(expiresAt).toISOString(),
      })
      .eq("user_id", userId)
      .eq("provider", "google_photos")

    if (error) {
      console.error("Error updating access token:", error)
      return null
    }

    return {
      access_token: data.access_token,
      refresh_token,
      expires_at: expiresAt,
    }
  } catch (error) {
    console.error("Error refreshing access token:", error)
    return null
  }
}

export async function getValidAccessToken(userId: string): Promise<string | null> {
  const tokens = await getUserTokens(userId)

  if (!tokens) {
    return null
  }

  // Check if the token is expired or about to expire (within 5 minutes)
  const isExpired = tokens.expires_at - Date.now() < 5 * 60 * 1000

  if (isExpired && tokens.refresh_token) {
    const refreshedTokens = await refreshAccessToken(userId, tokens.refresh_token)
    return refreshedTokens?.access_token || null
  }

  return tokens.access_token
}

export async function listMediaItems(userId: string, pageSize = 25, pageToken?: string) {
  const accessToken = await getValidAccessToken(userId)

  if (!accessToken) {
    throw new Error("No valid access token available")
  }

  let url = `${GOOGLE_PHOTOS_API_BASE_URL}/mediaItems?pageSize=${pageSize}`

  if (pageToken) {
    url += `&pageToken=${pageToken}`
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to list media items: ${response.statusText}`)
  }

  return response.json()
}

export async function searchMediaItems(userId: string, filters?: any, pageSize = 25, pageToken?: string) {
  const accessToken = await getValidAccessToken(userId)

  if (!accessToken) {
    throw new Error("No valid access token available")
  }

  const response = await fetch(`${GOOGLE_PHOTOS_API_BASE_URL}/mediaItems:search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pageSize,
      pageToken,
      filters,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to search media items: ${response.statusText}`)
  }

  return response.json()
}

export async function getMediaItem(userId: string, mediaItemId: string) {
  const accessToken = await getValidAccessToken(userId)

  if (!accessToken) {
    throw new Error("No valid access token available")
  }

  const response = await fetch(`${GOOGLE_PHOTOS_API_BASE_URL}/mediaItems/${mediaItemId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get media item: ${response.statusText}`)
  }

  return response.json()
}

export function getOptimizedPhotoUrl(baseUrl: string, width: number, height: number) {
  // Google Photos API allows appending =w{width}-h{height} to the baseUrl to get a resized image
  return `${baseUrl}=w${width}-h${height}`
}
