import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

export default async function ChatSupportPage() {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get the user's profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  // Get escalated conversations
  const { data: escalatedConversations } = await supabase
    .from("chat_conversations")
    .select(`
      id,
      created_at,
      updated_at,
      title,
      status,
      language,
      user_id,
      profiles:profiles(business_name, email, role)
    `)
    .eq("status", "escalated")
    .order("updated_at", { ascending: false })

  // Get feedback
  const { data: feedback } = await supabase
    .from("chat_feedback")
    .select(`
      id,
      created_at,
      rating,
      comment,
      message_id,
      user_id,
      profiles:profiles(business_name, email, role),
      messages:chat_messages(content, conversation_id)
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  // Get suggested responses
  const { data: suggestedResponses } = await supabase
    .from("chat_suggested_responses")
    .select("*")
    .order("category", { ascending: true })
    .order("topic", { ascending: true })

  // Format data for tables
  const escalatedConversationsData =
    escalatedConversations?.map((conv) => ({
      id: conv.id,
      user: conv.profiles?.business_name || "Unknown",
      userRole: conv.profiles?.role || "Unknown",
      email: conv.profiles?.email || "Unknown",
      title: conv.title,
      language: getLanguageName(conv.language),
      updatedAt: formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true }),
    })) || []

  const feedbackData =
    feedback?.map((item) => ({
      id: item.id,
      user: item.profiles?.business_name || "Unknown",
      userRole: item.profiles?.role || "Unknown",
      rating: item.rating === 1 ? "Positive" : "Negative",
      comment: item.comment || "No comment",
      message: item.messages?.content || "Unknown message",
      conversationId: item.messages?.conversation_id || "Unknown",
      createdAt: formatDistanceToNow(new Date(item.created_at), { addSuffix: true }),
    })) || []

  const suggestedResponsesData =
    suggestedResponses?.map((item) => ({
      id: item.id,
      category: item.category,
      topic: item.topic,
      question: item.question,
      response: item.response,
      language: getLanguageName(item.language),
    })) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chat Support Management</h1>
        <p className="text-muted-foreground">
          Manage escalated conversations, review feedback, and edit suggested responses.
        </p>
      </div>

      <Tabs defaultValue="escalated">
        <TabsList>
          <TabsTrigger value="escalated">
            Escalated Conversations
            {escalatedConversationsData.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {escalatedConversationsData.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="responses">Suggested Responses</TabsTrigger>
        </TabsList>

        <TabsContent value="escalated" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Escalated Conversations</CardTitle>
              <CardDescription>
                These conversations have been escalated by users and require human attention.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {escalatedConversationsData.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No escalated conversations</p>
              ) : (
                <DataTable
                  columns={[
                    {
                      accessorKey: "user",
                      header: "User",
                    },
                    {
                      accessorKey: "userRole",
                      header: "Role",
                    },
                    {
                      accessorKey: "email",
                      header: "Email",
                    },
                    {
                      accessorKey: "title",
                      header: "Title",
                    },
                    {
                      accessorKey: "language",
                      header: "Language",
                    },
                    {
                      accessorKey: "updatedAt",
                      header: "Updated",
                    },
                    {
                      id: "actions",
                      cell: ({ row }) => (
                        <a
                          href={`/admin/chat-support/conversation/${row.original.id}`}
                          className="text-primary hover:underline"
                        >
                          View
                        </a>
                      ),
                    },
                  ]}
                  data={escalatedConversationsData}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Feedback</CardTitle>
              <CardDescription>Review feedback provided by users on AI responses.</CardDescription>
            </CardHeader>
            <CardContent>
              {feedbackData.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No feedback data available</p>
              ) : (
                <DataTable
                  columns={[
                    {
                      accessorKey: "user",
                      header: "User",
                    },
                    {
                      accessorKey: "userRole",
                      header: "Role",
                    },
                    {
                      accessorKey: "rating",
                      header: "Rating",
                      cell: ({ row }) => (
                        <Badge variant={row.original.rating === "Positive" ? "outline" : "destructive"}>
                          {row.original.rating}
                        </Badge>
                      ),
                    },
                    {
                      accessorKey: "message",
                      header: "Message",
                      cell: ({ row }) => (
                        <div className="max-w-md truncate" title={row.original.message}>
                          {row.original.message}
                        </div>
                      ),
                    },
                    {
                      accessorKey: "comment",
                      header: "Comment",
                      cell: ({ row }) => (
                        <div className="max-w-md truncate" title={row.original.comment}>
                          {row.original.comment}
                        </div>
                      ),
                    },
                    {
                      accessorKey: "createdAt",
                      header: "Submitted",
                    },
                    {
                      id: "actions",
                      cell: ({ row }) => (
                        <a
                          href={`/admin/chat-support/conversation/${row.original.conversationId}`}
                          className="text-primary hover:underline"
                        >
                          View Conversation
                        </a>
                      ),
                    },
                  ]}
                  data={feedbackData}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Suggested Responses</CardTitle>
              <CardDescription>
                Manage the suggested responses used by the AI to answer common questions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suggestedResponsesData.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No suggested responses available</p>
              ) : (
                <DataTable
                  columns={[
                    {
                      accessorKey: "category",
                      header: "Category",
                    },
                    {
                      accessorKey: "topic",
                      header: "Topic",
                    },
                    {
                      accessorKey: "language",
                      header: "Language",
                    },
                    {
                      accessorKey: "question",
                      header: "Question",
                      cell: ({ row }) => (
                        <div className="max-w-md truncate" title={row.original.question}>
                          {row.original.question}
                        </div>
                      ),
                    },
                    {
                      accessorKey: "response",
                      header: "Response",
                      cell: ({ row }) => (
                        <div className="max-w-md truncate" title={row.original.response}>
                          {row.original.response}
                        </div>
                      ),
                    },
                    {
                      id: "actions",
                      cell: ({ row }) => (
                        <a
                          href={`/admin/chat-support/response/${row.original.id}`}
                          className="text-primary hover:underline"
                        >
                          Edit
                        </a>
                      ),
                    },
                  ]}
                  data={suggestedResponsesData}
                  searchKey="question"
                  searchPlaceholder="Search questions..."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    mr: "Marathi",
    gu: "Gujarati",
    ta: "Tamil",
    te: "Telugu",
  }
  return languages[code] || code
}
