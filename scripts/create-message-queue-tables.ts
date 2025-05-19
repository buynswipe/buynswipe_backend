/**
 * Script to create the message queue tables
 */
import { QueueService } from "@/lib/queue/queue-service"

async function createMessageQueueTables() {
  console.log("Creating message queue tables...")

  const result = await QueueService.initialize()

  if (result.success) {
    console.log("Message queue tables created successfully")
  } else {
    console.error("Error creating message queue tables:", result.error)
  }

  return result
}

// Run the function if this script is executed directly
if (require.main === module) {
  createMessageQueueTables()
    .then((result) => {
      console.log(result)
      process.exit(result.success ? 0 : 1)
    })
    .catch((error) => {
      console.error("Unexpected error:", error)
      process.exit(1)
    })
}

export default createMessageQueueTables
