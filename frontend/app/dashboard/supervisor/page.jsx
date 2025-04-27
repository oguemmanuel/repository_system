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
import { FileText, GraduationCap, LogOut, Search, User, Eye, Download, ThumbsUp, ThumbsDown, Loader2, XCircle } from 'lucide-react'
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
  const [rejectedProjects, setRejectedProjects] = useState([])
  const [processingAction, setProcessingAction] = useState(false)
  const [stats, setStats] = useState({
    totalSupervised: 0,
    pendingResources: 0,
    approvedResources: 0,
    rejectedResources: 0,
    thisMonth: 0,
  })
  const [selectedResource, setSelectedResource] = useState(null)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  // Add a new state for the approval dialog and reason
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [approvalReason, setApprovalReason] = useState("")

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

      // Fetch rejected projects
      const rejectedResponse = await fetch(
        "http://localhost:5000/api/resources?status=rejected&supervisorId=" + userData.id,
        {
          credentials: "include",
        },
      )

      // Fetch supervisor analytics
      const analyticsResponse = await fetch("http://localhost:5000/api/analytics/supervisor", {
        credentials: "include",
      })

      if (!pendingResponse.ok || !approvedResponse.ok || !rejectedResponse.ok) {
        throw new Error("Failed to fetch resources")
      }

      const pendingData = await pendingResponse.json()
      const approvedData = await approvedResponse.json()
      const rejectedData = await rejectedResponse.json()

      setPendingApprovals(pendingData.resources || [])
      setApprovedProjects(approvedData.resources || [])
      setRejectedProjects(rejectedData.resources || [])

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setStats({
          totalSupervised: analyticsData.analytics.totalSupervised || 0,
          pendingResources: analyticsData.analytics.pendingResources || 0,
          approvedResources: analyticsData.analytics.approvedResources || 0,
          rejectedResources: analyticsData.analytics.rejectedResources || 0,
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

  // Update the handleApprove function to include the approval reason
  const handleApprove = async (e) => {
    e?.preventDefault()
    if (!selectedResource || !approvalReason) return

    setProcessingAction(true)
    try {
      const response = await fetch(`http://localhost:5000/api/resources/${selectedResource.id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "approved",
          approvalReason: approvalReason,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to approve resource")
      }

      toast.success("Resource has been approved and published")
      setIsApproveDialogOpen(false)
      setApprovalReason("")
      setSelectedResource(null)

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

  const handleDownload = (resourceId) => {
    // Open the download URL in a new tab
    window.open(`http://localhost:5000/api/resources/${resourceId}/download`, "_blank")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <p className="text-lg font-medium text-blue-700">Loading dashboard...</p>
        </div>
      </div>
    )
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

  const filteredRejected = rejectedProjects.filter(
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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <div className="bg-gradient-to-b from-blue-800 to-blue-900 text-white rounded-lg shadow-lg p-4 h-full">
            <div className="mb-6 mt-2">
              <div className="flex items-center space-x-2 px-2">
                <GraduationCap className="h-6 w-6 text-blue-200" />
                <h2 className="text-xl font-bold text-blue-100">Supervisor Portal</h2>
              </div>
              <div className="mt-3 px-2">
                <p className="text-sm text-blue-300">{user?.fullName || "Supervisor"}</p>
                <p className="text-xs text-blue-400">{user?.email || ""}</p>
              </div>
            </div>
            <DashboardNav isSupervisor={true} />
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-blue-800">
                {getGreeting()}, {user?.fullName || "Supervisor"}!
              </h1>
              <p className="text-blue-600">Review and approve student submissions.</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="outline" size="icon" className="border-blue-300 text-blue-700 hover:bg-blue-100 hover:text-blue-800">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/logout">
                <Button variant="outline" size="icon" className="border-blue-300 text-blue-700 hover:bg-blue-100 hover:text-blue-800">
                  <LogOut className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-amber-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-900">Pending Approvals</CardTitle>
                <FileText className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-800">{stats.pendingResources}</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-900">Approved Projects</CardTitle>
                <GraduationCap className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-800">{stats.approvedResources}</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-rose-50 to-rose-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-rose-900">Rejected Resources</CardTitle>
                <XCircle className="h-4 w-4 text-rose-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-800">{stats.rejectedResources}</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-violet-50 to-violet-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-violet-900">This Month</CardTitle>
                <FileText className="h-4 w-4 text-violet-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-violet-800">{stats.thisMonth}</div>
              </CardContent>
            </Card>
          </div>
          <div className="my-6">
            <div className="flex items-center gap-4 bg-white rounded-lg p-2 shadow-sm">
              <Search className="h-4 w-4 text-blue-600" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
          </div>
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList className="bg-blue-100">
              <TabsTrigger value="pending" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Pending Approvals</TabsTrigger>
              <TabsTrigger value="approved" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Approved Projects</TabsTrigger>
              <TabsTrigger value="rejected" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white">Rejected Projects</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="space-y-4">
              {filteredPending.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md p-4">
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
                              <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Button
                              variant="default"
                              size="sm"
                              disabled={processingAction}
                              onClick={() => {
                                setSelectedResource(info.row.original)
                                setIsApproveDialogOpen(true)
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
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
                              className="bg-rose-600 hover:bg-rose-700"
                            >
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDownload(info.row.original.id)}
                              className="border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-lg shadow-sm">
                  <FileText className="h-12 w-12 text-amber-500 mb-4" />
                  <h3 className="text-lg font-medium text-amber-800">No pending approvals</h3>
                  <p className="text-amber-600 mt-2">
                    There are no projects waiting for your approval at this time.
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="approved" className="space-y-4">
              {filteredApproved.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md p-4">
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
                              <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDownload(info.row.original.id)}
                              className="border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-lg shadow-sm">
                  <GraduationCap className="h-12 w-12 text-emerald-500 mb-4" />
                  <h3 className="text-lg font-medium text-emerald-800">No approved projects</h3>
                  <p className="text-emerald-600 mt-2">You haven't approved any projects yet.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="rejected" className="space-y-4">
              {filteredRejected.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md p-4">
                  <DataTable
                    data={filteredRejected}
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
                        header: "Rejection Date",
                        accessorKey: "updatedAt",
                        cell: (info) => {
                          const date = new Date(info.getValue())
                          return date.toLocaleDateString()
                        },
                      },
                      {
                        header: "Rejection Reason",
                        accessorKey: "rejectionReason",
                        cell: (info) => (
                          <div className="max-w-xs truncate" title={info.getValue()}>
                            {info.getValue() || "No reason provided"}
                          </div>
                        ),
                      },
                      {
                        header: "Actions",
                        cell: (info) => (
                          <div className="flex gap-2">
                            <Link href={`/resources/${info.row.original.id}`}>
                              <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDownload(info.row.original.id)}
                              className="border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-lg shadow-sm">
                  <XCircle className="h-12 w-12 text-rose-500 mb-4" />
                  <h3 className="text-lg font-medium text-rose-800">No rejected projects</h3>
                  <p className="text-rose-600 mt-2">You haven't rejected any projects yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Rejection Dialog */}
          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogContent className="bg-white border-0 shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-rose-800">Reject Resource</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleReject} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason" className="text-slate-700">Reason for Rejection</Label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="Please provide a reason for rejecting this resource"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                    rows={4}
                    className="border-slate-300 focus:border-rose-400 focus:ring-rose-400"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" variant="destructive" disabled={processingAction} className="bg-rose-600 hover:bg-rose-700">
                    {processingAction ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      "Reject Resource"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          {/* Approval Dialog */}
          <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
            <DialogContent className="bg-white border-0 shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-emerald-800">Approve Resource</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleApprove} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="approvalReason" className="text-slate-700">Reason for Approval</Label>
                  <Textarea
                    id="approvalReason"
                    placeholder="Please provide a reason for approving this resource"
                    value={approvalReason}
                    onChange={(e) => setApprovalReason(e.target.value)}
                    required
                    rows={4}
                    className="border-slate-300 focus:border-emerald-400 focus:ring-emerald-400"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={processingAction} className="bg-emerald-600 hover:bg-emerald-700">
                    {processingAction ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      "Approve Resource"
                    )}
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
