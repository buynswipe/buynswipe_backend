import { NextResponse } from "next/server"
import { QueueService } from "@/lib/queue/queue-service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const configuredKey = process.env.CRON_API_KEY
    const authorization = request.headers.get("authorization")
    if (!configuredKey || authorization !== `Bearer ${configuredKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Process the next batch of messages
    const result = await QueueService.processNextBatch({
      batchSize: 20, // Process more messages in a cron job
    })

    // Clean up old processed messages
    const cleanupResult = await QueueService.cleanupProcessedMessages({
      olderThan: 7, // Clean up messages older than 7 days
    })

    return NextResponse.json({
      success: true,
      processedCount: result.processedCount,
      cleanedUp: cleanupResult.deletedCount,
    })
  } catch (error: any) {
    console.error("Error processing queue:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
