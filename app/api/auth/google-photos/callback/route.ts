import { createClient } from "@/lib/supabase-server"
import type { NextRequest } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    console.log("Google Photos callback endpoint called")

    // Get the URL parameters
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Check if there was an error
    if (error) {
      console.error("OAuth error:", error)
      return new Response(
        `
        <html>
          <head>
            <title>Authentication Error</title>
            <script>
              window.opener.postMessage({ type: "GOOGLE_PHOTOS_AUTH_ERROR", error: "${error}" }, "${process.env.NEXT_PUBLIC_SITE_URL}");
              window.close();
            </script>
          </head>
          <body>
            <p>Authentication error. You can close this window.</p>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: {
            "Content-Type": "text/html",
          },
        },
      )
    }

    // Verify the state parameter to prevent CSRF attacks
    const storedState = cookies().get("google_photos_oauth_state")?.value

    if (!storedState || state !== storedState) {
      console.error("State mismatch. Stored:", storedState, "Received:", state)
      return new Response(
        `
        <html>
          <head>
            <title>Authentication Error</title>
            <script>
              window.opener.postMessage({ type: "GOOGLE_PHOTOS_AUTH_ERROR", error: "Invalid state parameter" }, "${process.env.NEXT_PUBLIC_SITE_URL}");
              window.close();
            </script>
          </head>
          <body>
            <p>Authentication error: Invalid state parameter. You can close this window.</p>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: {
            "Content-Type": "text/html",
          },
        },
      )
    }

    // Check if the code is present
    if (!code) {
      console.error("No authorization code received")
      return new Response(
        `
        <html>
          <head>
            <title>Authentication Error</title>
            <script>
              window.opener.postMessage({ type: "GOOGLE_PHOTOS_AUTH_ERROR", error: "No authorization code received" }, "${process.env.NEXT_PUBLIC_SITE_URL}");
              window.close();
            </script>
          </head>
          <body>
            <p>Authentication error: No authorization code received. You can close this window.</p>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: {
            "Content-Type": "text/html",
          },
        },
      )
    }

    // Get the user ID from the cookie
    const userId = cookies().get("google_photos_user_id")?.value

    if (!userId) {
      console.error("No user ID found in cookie")
      return new Response(
        `
        <html>
          <head>
            <title>Authentication Error</title>
            <script>
              window.opener.postMessage({ type: "GOOGLE_PHOTOS_AUTH_ERROR", error: "User session expired. Please try again." }, "${process.env.NEXT_PUBLIC_SITE_URL}");
              window.close();
            </script>
          </head>
          <body>
            <p>Authentication error: User session expired. Please try again. You can close this window.</p>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: {
            "Content-Type": "text/html",
          },
        },
      )
    }

    // Exchange the authorization code for tokens
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google-photos/callback`

    console.log("Exchanging code for tokens")
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error("Token exchange error:", tokenResponse.status, errorText)
      return new Response(
        `
        <html>
          <head>
            <title>Authentication Error</title>
            <script>
              window.opener.postMessage({ type: "GOOGLE_PHOTOS_AUTH_ERROR", error: "Failed to exchange authorization code for tokens" }, "${process.env.NEXT_PUBLIC_SITE_URL}");
              window.close();
            </script>
          </head>
          <body>
            <p>Authentication error: Failed to exchange authorization code for tokens. You can close this window.</p>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: {
            "Content-Type": "text/html",
          },
        },
      )
    }

    const tokenData = await tokenResponse.json()
    console.log("Token exchange successful")

    // Create a direct Supabase admin client
    const supabase = createClient()

    // Calculate token expiration time
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()

    // Check if the user already has a Google Photos integration
    const { data: existingIntegration, error: checkError } = await supabase
      .from("user_integrations")
      .select("id")
      .eq("user_id", userId)
      .eq("provider", "google_photos")
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned"
      console.error("Error checking existing integration:", checkError)
    }

    // Store or update the tokens in the database
    let dbError
    if (existingIntegration) {
      console.log("Updating existing integration")
      const { error } = await supabase
        .from("user_integrations")
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingIntegration.id)
      dbError = error
    } else {
      console.log("Creating new integration")
      const { error } = await supabase.from("user_integrations").insert({
        user_id: userId,
        provider: "google_photos",
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: expiresAt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      dbError = error
    }

    if (dbError) {
      console.error("Error storing tokens:", dbError)
      return new Response(
        `
        <html>
          <head>
            <title>Authentication Error</title>
            <script>
              window.opener.postMessage({ type: "GOOGLE_PHOTOS_AUTH_ERROR", error: "Failed to store authentication tokens" }, "${process.env.NEXT_PUBLIC_SITE_URL}");
              window.close();
            </script>
          </head>
          <body>
            <p>Authentication error: Failed to store authentication tokens. You can close this window.</p>
          </body>
        </html>
        `,
        {
          status: 500,
          headers: {
            "Content-Type": "text/html",
          },
        },
      )
    }

    // Clear the cookies
    cookies().delete("google_photos_oauth_state")
    cookies().delete("google_photos_user_id")

    // Return a success response that will close the popup and notify the opener
    return new Response(
      `
      <html>
        <head>
          <title>Authentication Successful</title>
          <script>
            window.opener.postMessage({ type: "GOOGLE_PHOTOS_AUTH_SUCCESS" }, "${process.env.NEXT_PUBLIC_SITE_URL}");
            window.close();
          </script>
        </head>
        <body>
          <p>Authentication successful! You can close this window.</p>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      },
    )
  } catch (error) {
    console.error("Unexpected error in Google Photos callback:", error)
    return new Response(
      `
      <html>
        <head>
          <title>Authentication Error</title>
          <script>
            window.opener.postMessage({ type: "GOOGLE_PHOTOS_AUTH_ERROR", error: "An unexpected error occurred" }, "${process.env.NEXT_PUBLIC_SITE_URL}");
            window.close();
          </script>
        </head>
        <body>
          <p>Authentication error: An unexpected error occurred. You can close this window.</p>
        </body>
      </html>
      `,
      {
        status: 500,
        headers: {
          "Content-Type": "text/html",
        },
      },
    )
  }
}
