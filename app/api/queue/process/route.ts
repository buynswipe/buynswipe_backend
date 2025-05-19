import { NextResponse } from "next/server"
import { QueueService } from "@/lib/queue/queue-service"

export async function POST(request: Request) {
  try {
    // Check if request has a valid secret token
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (token !== process.env.SETUP_SECRET_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { batchSize = 10, processorId, messageTypes } = body

    // Process the next batch of messages
    const result = await QueueService.processNextBatch({
      batchSize,
      processorId,
      messageTypes,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      processedCount: result.processedCount,
    })
  } catch (error: any) {
    console.error("Error processing queue:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
