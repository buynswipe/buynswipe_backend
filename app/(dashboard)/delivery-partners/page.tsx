"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { UserProfile } from "@/types/database.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, MapPin, Phone, CheckCircle, XCircle, Search, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [role, setRole] = useState("all")
  const [isApproving, setIsApproving] = useState(false)
  const [approveError, setApproveError] = useState<string | null>(null)
  const [approveSuccess, setApproveSuccess] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const supabase = createClientComponentClient()

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)

        // Get user session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          throw new Error("Not authenticated")
        }

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()

        if (profileError) throw profileError

        if (profile.role !== "admin") {
          throw new Error("Unauthorized")
        }

        // Fetch all users
        const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

        if (error) throw error

        setUsers(data)
        setFilteredUsers(data)
      } catch (error: any) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [supabase])

  // Filter users based on search term and role
  useEffect(() => {
    let filtered = [...users]

    // Filter by search term (business name or email)
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by role
    if (role && role !== "all") {
      filtered = filtered.filter((u) => u.role === role)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, role])

  // Approve or block user
  const approveUser = async (userId: string, approve: boolean) => {
    try {
      setIsApproving(true)
      setApproveError(null)
      setApproveSuccess(null)

      // Update user approval status
      const response = await fetch("/api/admin/approve-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          approve,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user approval status")
      }

      // Update local state
      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, is_approved: approve } : user)))

      setApproveSuccess(`User ${approve ? "approved" : "blocked"} successfully`)

      // Close dialog after a delay
      setTimeout(() => {
        setCurrentUser(null)
        setApproveSuccess(null)
      }, 2000)
    } catch (error: any) {
      setApproveError(error.message)
    } finally {
      setIsApproving(false)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  // Get role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Admin</Badge>
      case "retailer":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Retailer</Badge>
      case "wholesaler":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Wholesaler</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  // Get approval status badge
  const getApprovalBadge = (isApproved: boolean) => {
    return isApproved ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>
    ) : (
      <Badge variant="destructive">Pending</Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-500 rounded-md">Error: {error}</div>
  }

  // Group users by approval status
  const pendingUsers = filteredUsers.filter((user) => !user.is_approved)
  const approvedUsers = filteredUsers.filter((user) => user.is_approved)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">Manage and approve users on the platform.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-auto">
          <Input
            placeholder="Search users"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-[300px]"
            prefix={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Tabs value={role} onValueChange={setRole} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="retailer">Retailers</TabsTrigger>
              <TabsTrigger value="wholesaler">Wholesalers</TabsTrigger>
              <TabsTrigger value="admin">Admins</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="pending">
            Pending Approval ({pendingUsers.length})
            {pendingUsers.length > 0 && <span className="ml-2 flex h-2 w-2 rounded-full bg-red-500"></span>}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedUsers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingUsers.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Pending Approvals</h3>
              <p className="mt-2 text-sm text-muted-foreground">All users have been approved.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingUsers.map((user) => (
                <Card key={user.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{user.business_name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getRoleBadge(user.role)}
                        {getApprovalBadge(user.is_approved)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm">{user.address}</p>
                          <p className="text-sm">
                            {user.city}, {user.pincode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{user.phone}</p>
                      </div>
                      {user.role === "wholesaler" && user.gst_number && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">GST:</span>
                          <p className="text-sm">{user.gst_number}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Registered:</span>
                        <p className="text-sm">{formatDate(user.created_at)}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex w-full gap-2">
                      <Button className="flex-1" onClick={() => approveUser(user.id, true)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => setCurrentUser(user)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Block
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-6">
          {approvedUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Approved Users</h3>
              <p className="mt-2 text-sm text-muted-foreground">There are no approved users yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {approvedUsers.map((user) => (
                <Card key={user.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{user.business_name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getRoleBadge(user.role)}
                        {getApprovalBadge(user.is_approved)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm">{user.address}</p>
                          <p className="text-sm">
                            {user.city}, {user.pincode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{user.phone}</p>
                      </div>
                      {user.role === "wholesaler" && user.gst_number && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">GST:</span>
                          <p className="text-sm">{user.gst_number}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Registered:</span>
                        <p className="text-sm">{formatDate(user.created_at)}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex w-full gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setCurrentUser(user)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Block User
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!currentUser} onOpenChange={(open) => !open && setCurrentUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block User</DialogTitle>
            <DialogDescription>
              Are you sure you want to block this user? They will no longer be able to access the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {currentUser && (
              <div className="space-y-2">
                <p>
                  <strong>Business Name:</strong> {currentUser.business_name}
                </p>
                <p>
                  <strong>Email:</strong> {currentUser.email}
                </p>
                <p>
                  <strong>Role:</strong> {currentUser.role}
                </p>
              </div>
            )}
            {approveError && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{approveError}</AlertDescription>
              </Alert>
            )}
            {approveSuccess && (
              <Alert className="bg-green-50 text-green-800 border-green-200 mt-4">
                <AlertDescription>{approveSuccess}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCurrentUser(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => currentUser && approveUser(currentUser.id, false)}
              disabled={isApproving}
            >
              {isApproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Block User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
