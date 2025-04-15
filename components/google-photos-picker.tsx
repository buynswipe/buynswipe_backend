"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, ImageIcon, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface GooglePhotosPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (imageUrl: string) => void
}

interface MediaItem {
  id: string
  baseUrl: string
  mimeType: string
  mediaMetadata: {
    width: string
    height: string
    creationTime: string
  }
  filename: string
}

export function GooglePhotosPicker({ open, onOpenChange, onSelect }: GooglePhotosPickerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchMediaItems = useCallback(
    async (pageToken?: string) => {
      try {
        setIsLoading(true)
        setAuthError(null)
        console.log("Fetching media items", pageToken ? `with page token ${pageToken}` : "")

        const response = await fetch(`/api/google-photos/media${pageToken ? `?pageToken=${pageToken}` : ""}`)
        const data = await response.json()
        console.log("Media items response:", data)

        if (response.ok) {
          setIsConnected(data.connected)

          if (data.connected) {
            if (pageToken) {
              setMediaItems((prev) => [...prev, ...data.mediaItems])
            } else {
              setMediaItems(data.mediaItems || [])
            }
            setNextPageToken(data.nextPageToken || null)
          } else {
            setAuthError(data.message || "Not connected to Google Photos")
          }
        } else {
          console.error("Error fetching media items:", data)
          setAuthError(data.message || "Failed to fetch media items")
          toast({
            title: "Error",
            description: data.message || "Failed to fetch media items",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching media items:", error)
        setAuthError("An unexpected error occurred")
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [toast],
  )

  const handleConnectGooglePhotos = async () => {
    try {
      setIsLoading(true)
      setAuthError(null)

      console.log("Initiating Google Photos connection...")
      const response = await fetch("/api/auth/google-photos")

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error response from auth endpoint:", errorData)
        setAuthError(errorData.message || "Failed to initiate Google Photos connection")
        toast({
          title: "Error",
          description: errorData.message || "Failed to initiate Google Photos connection",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const data = await response.json()
      console.log("Auth response:", data)

      if (data.authUrl) {
        // Open a popup window for authentication
        const width = 600
        const height = 700
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2

        console.log("Opening popup with URL:", data.authUrl)
        const popup = window.open(
          data.authUrl,
          "google-photos-auth",
          `width=${width},height=${height},left=${left},top=${top}`,
        )

        if (!popup) {
          console.error("Popup blocked")
          setAuthError("Popup blocked. Please allow popups for this site.")
          toast({
            title: "Error",
            description: "Popup blocked. Please allow popups for this site.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        // Listen for messages from the popup
        const handleMessage = (event: MessageEvent) => {
          console.log("Received message from popup:", event.data)

          if (event.data.type === "GOOGLE_PHOTOS_AUTH_SUCCESS") {
            window.removeEventListener("message", handleMessage)
            toast({
              title: "Success",
              description: "Google Photos connected successfully",
            })
            fetchMediaItems()
          } else if (event.data.type === "GOOGLE_PHOTOS_AUTH_ERROR") {
            window.removeEventListener("message", handleMessage)
            setAuthError(event.data.error || "Failed to connect Google Photos")
            toast({
              title: "Error",
              description: event.data.error || "Failed to connect Google Photos",
              variant: "destructive",
            })
            setIsLoading(false)
          }
        }

        window.addEventListener("message", handleMessage)
      } else {
        console.error("No authUrl in response:", data)
        setAuthError(data.message || "Failed to initiate Google Photos connection")
        toast({
          title: "Error",
          description: data.message || "Failed to initiate Google Photos connection",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error connecting to Google Photos:", error)
      setAuthError("An unexpected error occurred")
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (nextPageToken) {
      setIsLoadingMore(true)
      fetchMediaItems(nextPageToken)
    }
  }

  const handleSelectImage = (mediaItem: MediaItem) => {
    // Get an optimized version of the image
    // Google Photos API allows appending =w{width}-h{height} to the baseUrl to get a resized image
    const optimizedUrl = `${mediaItem.baseUrl}=w800-h800`
    onSelect(optimizedUrl)
    onOpenChange(false)
  }

  useEffect(() => {
    if (open) {
      fetchMediaItems()
    }
  }, [open, fetchMediaItems])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Image from Google Photos</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isLoading && !isLoadingMore ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !isConnected ? (
            <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
              <ImageIcon className="h-16 w-16 text-muted-foreground" />
              <p className="text-center text-muted-foreground">Connect your Google Photos account to select images</p>
              {authError && (
                <div className="text-red-500 text-center max-w-md">
                  <p className="font-semibold">Error:</p>
                  <p>{authError}</p>
                </div>
              )}
              <Button onClick={handleConnectGooglePhotos} disabled={isLoading} className="flex items-center gap-2">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Connect Google Photos
              </Button>
            </div>
          ) : (
            <div className="overflow-y-auto h-[400px] pr-2">
              {mediaItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
                  <p className="text-center text-muted-foreground">No images found in your Google Photos</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {mediaItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative aspect-square rounded-md overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => handleSelectImage(item)}
                    >
                      <Image
                        src={`${item.baseUrl}=w200-h200`}
                        alt={item.filename}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}

              {nextPageToken && (
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" onClick={handleLoadMore} disabled={isLoadingMore}>
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
