import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "Retail Bandhu - Connecting Retailers and Wholesalers"
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 128,
        background: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
          <path d="M2 7h20" />
          <path d="M22 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7" />
          <path d="M18 12V7" />
          <path d="M14 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7" />
          <path d="M10 12V7" />
          <path d="M6 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7" />
        </svg>
        <div style={{ marginLeft: 24, fontSize: 72, fontWeight: "bold", color: "#1e3a8a" }}>Retail Bandhu</div>
      </div>
      <div style={{ fontSize: 36, color: "#64748b", textAlign: "center", marginTop: 24 }}>
        Connecting Retailers and Wholesalers Across India
      </div>
    </div>,
    { ...size },
  )
}
