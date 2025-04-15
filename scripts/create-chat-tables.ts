import { createClient } from "@supabase/supabase-js"

export async function createChatTables() {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables")
  }

  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log("Creating chat support tables...")

  try {
    // Create conversations table
    const { error: conversationsError } = await supabase.rpc("create_conversations_table")
    if (conversationsError) throw conversationsError

    // Create messages table
    const { error: messagesError } = await supabase.rpc("create_messages_table")
    if (messagesError) throw messagesError

    // Create chat_feedback table
    const { error: feedbackError } = await supabase.rpc("create_chat_feedback_table")
    if (feedbackError) throw feedbackError

    // Create suggested_responses table
    const { error: responsesError } = await supabase.rpc("create_suggested_responses_table")
    if (responsesError) throw responsesError

    console.log("Chat support tables created successfully!")
    return { success: true }
  } catch (error) {
    console.error("Error creating chat support tables:", error)
    throw error
  }
}

// For direct execution from command line
if (typeof require !== "undefined" && require.main === module) {
  createChatTables()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error:", error)
      process.exit(1)
    })
}
