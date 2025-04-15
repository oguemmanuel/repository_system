"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { BookOpen, FileText, GraduationCap, LogOut, Search, User } from "lucide-react"
import DashboardNav from "@/components/dashboard-nav"
import DashboardHeader from "@/components/dashboard-header"
import DataTable from "@/components/data-table"
import { useRouter } from "next/navigation"

export default function SupervisorDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pendingApprovals, setPendingApprovals] = useState([])
  const [approvedProjects, setApprovedProjects] = useState([])
  const [processingAction, setProcessingAction] = useState(false)
  const [stats, setStats] = useState({
    totalSupervised: 0,
    pendingResources: 0,
    approvedResources: 0,
    thisMonth: 0,
  })
  const [selectedResource, setSelectedResource] = useState(null)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  const router = useRouter()

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get user from localStorage first
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          if (parsedUser.role !== "supervisor") {
            // Redirect to appropriate dashboard
            router.push(`/dashboard/${parsedUser.role}`)
            return
          }
          setUser(parsedUser)
        }

        // Verify with backend
        const response = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include",
        })

        if (!response.ok) {
          // If backend check fails, clear localStorage and redirect to login
          localStorage.removeItem("user")
          router.push("/login")
          return
        }

        const data = await response.json()

        // Update localStorage with fresh data
        localStorage.setItem("user", JSON.stringify(data.user))

        // If not a supervisor, redirect
        if (data.user.role !== "supervisor") {
          router.push(`/dashboard/${data.user.role}`)
          return
        }

        setUser(data.user)

        fetchData(data.user)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  const fetchData = async (userData) => {
    setLoading(true)
    try {
      // Fetch pending approvals
      const pendingResponse = await fetch("http://localhost:5000/api/resources/pending/supervisor", {
        credentials: "include",
      })

      // Fetch approved projects
      const approvedResponse = await fetch(
        "http://localhost:5000/api/resources?status=approved&supervisorId=" + userData.id,
        {
          credentials: "include",
        },
      )

      // Fetch supervisor analytics
      const analyticsResponse = await fetch("http://localhost:5000/api/analytics/supervisor", {
        credentials: "include",
      })

      if (!pendingResponse.ok || !approvedResponse.ok) {
        throw new Error("Failed to fetch resources")
      }

      const pendingData = await pendingResponse.json()
      const approvedData = await approvedResponse.json()

      setPendingApprovals(pendingData.resources || [])
      setApprovedProjects(approvedData.resources || [])

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setStats({
          totalSupervised: analyticsData.analytics.totalSupervised || 0,
          pendingResources: analyticsData.analytics.pendingResources || 0,
          approvedResources: analyticsData.analytics.approvedResources || 0,
          thisMonth: pendingData.resources.filter((p) => {
            const date = new Date(p.createdAt)
            const now = new Date()
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
          }).length,
        })
      }
    } catch (error) {
      console.error("Error fetching resources:", error)
      toast.error("Failed to load resources. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (resourceId) => {
    setProcessingAction(true)
    try {
      const response = await fetch(`http://localhost:5000/api/resources/${resourceId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "approved" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to approve resource")
      }

      toast.success("Resource has been approved and published")

      // Refresh data
      if (user) {
        fetchData(user)
      }
    } catch (error) {
      console.error("Error approving resource:", error)
      toast.error(error.message || "Failed to approve resource. Please try again.")
    } finally {
      setProcessingAction(false)
    }
  }

  const handleReject = async (e) => {
    e.preventDefault()
    if (!selectedResource || !rejectionReason) return

    setProcessingAction(true)
    try {
      const response = await fetch(`http://localhost:5000/api/resources/${selectedResource.id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "rejected",
          rejectionReason: rejectionReason,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to reject resource")
      }

      toast.success("Resource has been rejected")
      setIsRejectDialogOpen(false)
      setRejectionReason("")
      setSelectedResource(null)

      // Refresh data
      if (user) {
        fetchData(user)
      }
    } catch (error) {
      console.error("Error rejecting resource:", error)
      toast.error(error.message || "Failed to reject resource. Please try again.")
    } finally {
      setProcessingAction(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  const filteredPending = pendingApprovals.filter(
    (project) =>
      project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.studentName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.type?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredApproved = approvedProjects.filter(
    (project) =>
      project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.studentName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.type?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Get current time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <DashboardNav isSupervisor={true} />
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {getGreeting()}, {user?.fullName || "Supervisor"}!
              </h1>
              <p className="text-muted-foreground">Review and approve student submissions.</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="outline" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/logout">
                <Button variant="outline" size="icon">
                  <LogOut className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingResources}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Projects</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approvedResources}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Supervised</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSupervised}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.thisMonth}</div>
              </CardContent>
            </Card>
          </div>
          <div className="my-6">
            <div className="flex items-center gap-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
          </div>
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
              <TabsTrigger value="approved">Approved Projects</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="space-y-4">
              {filteredPending.length > 0 ? (
                <DataTable
                  data={filteredPending}
                  columns={[
                    { header: "Title", accessorKey: "title" },
                    {
                      header: "Type",
                      accessorKey: "type",
                      cell: (info) => {
                        const type = info.getValue()
                        let displayType = type

                        if (type === "past-exam") displayType = "Past Exam"
                        else if (type === "mini-project") displayType = "Mini Project"
                        else if (type === "final-project") displayType = "Final Year Project"
                        else if (type === "thesis") displayType = "Thesis"

                        return displayType
                      },
                    },
                    {
                      header: "Student",
                      accessorKey: "studentName",
                      cell: (info) => info.getValue() || "N/A",
                    },
                    {
                      header: "Department",
                      accessorKey: "department",
                    },
                    {
                      header: "Submission Date",
                      accessorKey: "createdAt",
                      cell: (info) => {
                        const date = new Date(info.getValue())
                        return date.toLocaleDateString()
                      },
                    },
                    {
                      header: "Actions",
                      cell: (info) => (
                        <div className="flex gap-2">
                          <Link href={`/resources/${info.row.original.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                          <Button
                            variant="default"
                            size="sm"
                            disabled={processingAction}
                            onClick={() => handleApprove(info.row.original.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={processingAction}
                            onClick={() => {
                              setSelectedResource(info.row.original)
                              setIsRejectDialogOpen(true)
                            }}
                          >
                            Reject
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No pending approvals</h3>
                  <p className="text-muted-foreground mt-2">
                    There are no projects waiting for your approval at this time.
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="approved" className="space-y-4">
              {filteredApproved.length > 0 ? (
                <DataTable
                  data={filteredApproved}
                  columns={[
                    { header: "Title", accessorKey: "title" },
                    {
                      header: "Type",
                      accessorKey: "type",
                      cell: (info) => {
                        const type = info.getValue()
                        let displayType = type

                        if (type === "past-exam") displayType = "Past Exam"
                        else if (type === "mini-project") displayType = "Mini Project"
                        else if (type === "final-project") displayType = "Final Year Project"
                        else if (type === "thesis") displayType = "Thesis"

                        return displayType
                      },
                    },
                    {
                      header: "Student",
                      accessorKey: "studentName",
                      cell: (info) => info.getValue() || "N/A",
                    },
                    {
                      header: "Department",
                      accessorKey: "department",
                    },
                    {
                      header: "Approval Date",
                      accessorKey: "updatedAt",
                      cell: (info) => {
                        const date = new Date(info.getValue())
                        return date.toLocaleDateString()
                      },
                    },
                    {
                      header: "Actions",
                      cell: (info) => (
                        <div className="flex gap-2">
                          <Link href={`/resources/${info.row.original.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                          <Link href={`/resources/${info.row.original.id}/download`}>
                            <Button variant="outline" size="sm">
                              Download
                            </Button>
                          </Link>
                        </div>
                      ),
                    },
                  ]}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No approved projects</h3>
                  <p className="text-muted-foreground mt-2">You haven't approved any projects yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Rejection Dialog */}
          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Resource</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleReject} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">Reason for Rejection</Label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="Please provide a reason for rejecting this resource"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                    rows={4}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" variant="destructive" disabled={processingAction}>
                    Reject Resource
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
