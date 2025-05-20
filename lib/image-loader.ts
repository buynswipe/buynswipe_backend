type ImageLoaderProps = {
  src: string
  width: number
  quality?: number
}

export default function imageLoader({ src, width, quality = 75 }: ImageLoaderProps) {
  // For blob.v0.dev URLs, return as is
  if (src.startsWith("https://blob.v0.dev/")) {
    return src
  }

  // For placeholder SVGs
  if (src.startsWith("/placeholder.svg")) {
    return src
  }

  // For relative URLs, add the base URL in production
  if (src.startsWith("/")) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://retail.buynswipe.com"
    return `${baseUrl}${src}?w=${width}&q=${quality}`
  }

  // For all other URLs, return as is
  return src
}
