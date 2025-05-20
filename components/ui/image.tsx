"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, src, alt, fallbackSrc = "/retail-storefront.png", ...props }, ref) => {
    const [imgSrc, setImgSrc] = React.useState<string | undefined>(src)
    const [isLoading, setIsLoading] = React.useState(true)

    const handleError = () => {
      if (imgSrc !== fallbackSrc) {
        setImgSrc(fallbackSrc)
      }
    }

    return (
      <div className={cn("relative", isLoading && "bg-muted animate-pulse", className)}>
        <img
          ref={ref}
          src={imgSrc || "/placeholder.svg"}
          alt={alt}
          className={cn("object-contain w-full h-full", className)}
          onLoad={() => setIsLoading(false)}
          onError={handleError}
          {...props}
        />
      </div>
    )
  },
)

Image.displayName = "Image"
