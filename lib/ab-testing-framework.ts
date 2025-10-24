import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

export interface Variant {
  id: string
  name: string
  description: string
  weight: number // 0-100, percentage of users in this variant
}

export interface ExperimentConfig {
  id: string
  name: string
  description: string
  startDate: Date
  endDate: Date
  variants: Variant[]
  targetMetrics: string[]
  status: "draft" | "running" | "paused" | "completed"
}

export interface ExperimentResult {
  variantId: string
  variantName: string
  sampleSize: number
  conversionRate: number
  revenue: number
  avgResponseTime: number
  confidence: number
}

export class ABTestingFramework {
  private supabase: any

  constructor() {
    const cookieStore = cookies()
    this.supabase = createServerComponentClient({ cookies: () => cookieStore })
  }

  // Create a new experiment
  async createExperiment(config: ExperimentConfig) {
    try {
      const { data, error } = await this.supabase.from("ab_experiments").insert([
        {
          id: config.id || uuidv4(),
          name: config.name,
          description: config.description,
          variants: config.variants,
          target_metrics: config.targetMetrics,
          start_date: config.startDate.toISOString(),
          end_date: config.endDate.toISOString(),
          status: config.status,
          created_at: new Date().toISOString(),
        },
      ])

      if (error) throw error
      return { success: true, experimentId: data[0].id }
    } catch (error) {
      console.error("Error creating experiment:", error)
      return { success: false, error }
    }
  }

  // Assign user to variant
  async assignUserToVariant(experimentId: string, userId: string) {
    try {
      // Get experiment config
      const { data: experiment } = await this.supabase
        .from("ab_experiments")
        .select("*")
        .eq("id", experimentId)
        .single()

      if (!experiment) throw new Error("Experiment not found")

      // Randomly assign variant based on weights
      const variant = this.selectVariant(experiment.variants)

      // Record assignment
      await this.supabase.from("ab_assignments").insert([
        {
          experiment_id: experimentId,
          user_id: userId,
          variant_id: variant.id,
          assigned_at: new Date().toISOString(),
        },
      ])

      return { success: true, variantId: variant.id, variantName: variant.name }
    } catch (error) {
      console.error("Error assigning user:", error)
      return { success: false, error }
    }
  }

  // Get user's assigned variant
  async getUserVariant(experimentId: string, userId: string) {
    try {
      const { data } = await this.supabase
        .from("ab_assignments")
        .select("variant_id")
        .eq("experiment_id", experimentId)
        .eq("user_id", userId)
        .single()

      return { success: true, variantId: data?.variant_id }
    } catch (error) {
      console.error("Error getting user variant:", error)
      return { success: false, error }
    }
  }

  // Track event for analysis
  async trackEvent(experimentId: string, userId: string, eventType: string, eventData: any) {
    try {
      await this.supabase.from("ab_events").insert([
        {
          experiment_id: experimentId,
          user_id: userId,
          event_type: eventType,
          event_data: eventData,
          timestamp: new Date().toISOString(),
        },
      ])

      return { success: true }
    } catch (error) {
      console.error("Error tracking event:", error)
      return { success: false, error }
    }
  }

  // Get experiment results
  async getExperimentResults(experimentId: string): Promise<ExperimentResult[]> {
    try {
      const { data: assignments } = await this.supabase
        .from("ab_assignments")
        .select("*")
        .eq("experiment_id", experimentId)

      const { data: events } = await this.supabase.from("ab_events").select("*").eq("experiment_id", experimentId)

      // Calculate metrics per variant
      const variantMetrics = new Map()

      assignments?.forEach((assignment) => {
        if (!variantMetrics.has(assignment.variant_id)) {
          variantMetrics.set(assignment.variant_id, {
            variantId: assignment.variant_id,
            variantName: assignment.variant_id,
            sampleSize: 0,
            conversions: 0,
            revenue: 0,
            responseTimes: [],
          })
        }

        variantMetrics.get(assignment.variant_id).sampleSize += 1
      })

      events?.forEach((event) => {
        const assignment = assignments?.find((a) => a.user_id === event.user_id)
        if (assignment) {
          const metrics = variantMetrics.get(assignment.variant_id)
          if (metrics) {
            if (event.event_type === "conversion") {
              metrics.conversions += 1
              metrics.revenue += event.event_data.revenue || 0
            }
            if (event.event_data.responseTime) {
              metrics.responseTimes.push(event.event_data.responseTime)
            }
          }
        }
      })

      // Format results
      const results: ExperimentResult[] = Array.from(variantMetrics.values()).map((metrics) => ({
        variantId: metrics.variantId,
        variantName: metrics.variantName,
        sampleSize: metrics.sampleSize,
        conversionRate: (metrics.conversions / metrics.sampleSize) * 100,
        revenue: metrics.revenue,
        avgResponseTime: metrics.responseTimes.length
          ? metrics.responseTimes.reduce((a, b) => a + b) / metrics.responseTimes.length
          : 0,
        confidence: this.calculateConfidence(metrics.sampleSize, metrics.conversions),
      }))

      return results
    } catch (error) {
      console.error("Error getting results:", error)
      return []
    }
  }

  // Helper: Select variant based on weights
  private selectVariant(variants: Variant[]) {
    const random = Math.random() * 100
    let cumulative = 0

    for (const variant of variants) {
      cumulative += variant.weight
      if (random < cumulative) {
        return variant
      }
    }

    return variants[0]
  }

  // Helper: Calculate statistical confidence
  private calculateConfidence(sampleSize: number, conversions: number) {
    // Simplified confidence calculation (95% CI)
    if (sampleSize < 30) return 0
    if (sampleSize < 100) return 0.8
    if (sampleSize < 500) return 0.9
    return 0.95
  }
}
