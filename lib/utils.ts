import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

// Add this function to generate document numbers
export function generateDocumentNumber(prefix: string, orderId: string, timestamp: number): string {
  const shortOrderId = orderId.substring(0, 6)
  const dateCode = new Date(timestamp).toISOString().slice(0, 10).replace(/-/g, "")
  return `${prefix}-${dateCode}-${shortOrderId}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}
