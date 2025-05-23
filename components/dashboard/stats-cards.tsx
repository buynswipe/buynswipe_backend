"use client"

import type React from "react"

import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  icon: React.ReactNode
  description?: string
}

function StatCard({ title, value, change, changeType, icon, description }: StatCardProps) {
  return (
    <div className="stat-card group hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-colors">
            {icon}
          </div>
          <div>
            <p className="stat-label">{title}</p>
            <p className="stat-value">{value}</p>
          </div>
        </div>
        <div className="text-right">
          <div
            className={cn("stat-change flex items-center gap-1", {
              positive: changeType === "positive",
              negative: changeType === "negative",
              "text-gray-500": changeType === "neutral",
            })}
          >
            {changeType === "positive" && <TrendingUp className="h-3 w-3" />}
            {changeType === "negative" && <TrendingDown className="h-3 w-3" />}
            {change}
          </div>
          {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
        </div>
      </div>
    </div>
  )
}

export function StatsCards() {
  const stats = [
    {
      title: "Total Revenue",
      value: "₹2,45,000",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: <DollarSign className="h-5 w-5 text-green-600" />,
      description: "vs last month",
    },
    {
      title: "Orders",
      value: "1,234",
      change: "+8.2%",
      changeType: "positive" as const,
      icon: <ShoppingCart className="h-5 w-5 text-blue-600" />,
      description: "vs last month",
    },
    {
      title: "Customers",
      value: "856",
      change: "+5.1%",
      changeType: "positive" as const,
      icon: <Users className="h-5 w-5 text-purple-600" />,
      description: "vs last month",
    },
    {
      title: "Products",
      value: "2,456",
      change: "-2.3%",
      changeType: "negative" as const,
      icon: <Package className="h-5 w-5 text-orange-600" />,
      description: "vs last month",
    },
  ]

  return (
    <div className="dashboard-grid">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}
