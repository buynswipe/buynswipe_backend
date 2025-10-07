import type React from "react"
import Link from "next/link"

type Props = {
  title: string
  desc?: string
  imageSrc?: string
  href?: string
  ctaLabel?: string
  className?: string
}

export default function FeatureCard({ title, desc, imageSrc, href, ctaLabel = "Learn more", className = "" }: Props) {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    href ? (
      <Link href={href} className="block no-underline">
        {children}
      </Link>
    ) : (
      <>{children}</>
    )

  return (
    <Wrapper>
      <div
        className={`flex h-full flex-col items-start gap-3 rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md ${className}`}
      >
        {imageSrc ? (
          <img src={imageSrc || "/placeholder.svg"} alt={title} className="h-10 w-10 rounded object-contain" />
        ) : null}
        <h3 className="text-lg font-semibold">{title}</h3>
        {desc ? <p className="text-sm text-slate-600">{desc}</p> : null}
        {href ? (
          <span className="mt-auto inline-flex items-center text-sm font-medium text-primary">{ctaLabel}</span>
        ) : null}
      </div>
    </Wrapper>
  )
}
