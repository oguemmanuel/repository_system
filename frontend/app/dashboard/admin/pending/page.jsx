"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Search, FileText, ThumbsUp, ThumbsDown, Eye, Clock } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import DataTable from "@/components/data-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function PendingApprovalsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [pendingResources, setPendingResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processingAction, setProcessingAction] = useState(false)

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include",
        })

        if (!response.ok) {
          router.push("/login")
          return
        }

        const data = await response.json()

        if (data.user.role !== "admin") {
          router.push(`/dashboard/${data.user.role}`)
          return
        }

        fetchData()
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch pending resources
      const pendingResponse = await fetch("http://localhost:5000/api/resources/pending/admin", {
        credentials: "include",
      })

      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json()
        setPendingResources(pendingData.resources || [])
      } else {
        toast.error("Failed to fetch pending resources")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleApproveResource = async (resourceId) => {
    setProcessingAction(true)
    try {
      const response = await fetch(`http://localhost:5000/api/resources/${resourceId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: "approved" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to approve resource")
      }

      toast.success("Resource approved successfully")
      fetchData() // Refresh data
    } catch (error) {
      console.error("Error approving resource:", error)
      toast.error(error.message || "Failed to approve resource")
    } finally {
      setProcessingAction(false)
    }
  }

  const handleRejectResource = async (e) => {
    e.preventDefault()
    if (!selectedResource || !rejectionReason) {
      toast.error("Please provide a reason for rejection")
      return
    }

    setProcessingAction(true)
    try {
      const response = await fetch(`http://localhost:5000/api/resources/${selectedResource.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: "rejected",
          rejectionReason: rejectionReason,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to reject resource")
      }

      toast.success("Resource rejected successfully")
      setIsRejectDialogOpen(false)
      setRejectionReason("")
      setSelectedResource(null)
      fetchData() // Refresh data
    } catch (error) {
      console.error("Error rejecting resource:", error)
      toast.error(error.message || "Failed to reject resource")
    } finally {
      setProcessingAction(false)
    }
  }

  const filteredPendingResources = pendingResources.filter(
    (resource) =>
      resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.uploadedByName && resource.uploadedByName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (resource.studentName && resource.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (resource.supervisorName && resource.supervisorName.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const getResourceTypeName = (type) => {
    switch (type) {
      case "past-exam":
        return "Past Exam"
      case "mini-project":
        return "Mini Project"
      case "final-project":
        return "Final Year Project"
      case "thesis":
        return "Thesis"
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-amber-50 to-slate-100">
        <DashboardHeader />
        <div className="container max-w-6xl mx-auto flex-1 items-center justify-center flex">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-amber-50 to-slate-100">
      <DashboardHeader />
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Card className="border shadow-md bg-white">
          <CardHeader className="border-b bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold tracking-tight text-slate-800">Pending Approvals</CardTitle>
                <CardDescription className="text-slate-600">Review and approve pending resource submissions.</CardDescription>
              </div>
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1 px-3 py-1.5">
                <Clock className="h-4 w-4" />
                <span>{filteredPendingResources.length} Pending</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2 bg-white p-4 rounded-lg shadow-sm border max-w-md">
                <Search className="h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search pending resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <div className="bg-white rounded-lg shadow-sm border">
                {filteredPendingResources.length > 0 ? (
                  <DataTable
                    data={filteredPendingResources}
                    columns={[
                      { 
                        header: "Title", 
                        accessorKey: "title",
                        cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>
                      },
                      {
                        header: "Type",
                        accessorKey: "type",
                        cell: (info) => (
                          <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium">
                            {getResourceTypeName(info.getValue())}
                          </span>
                        ),
                      },
                      { 
                        header: "Department", 
                        accessorKey: "department",
                        cell: (info) => <span className="text-slate-700">{info.getValue()}</span>
                      },
                      {
                        header: "Uploaded By",
                        accessorKey: "uploadedByName",
                        cell: (info) => <span className="text-slate-700">{info.getValue() || "Unknown"}</span>,
                      },
                      {
                        header: "Student",
                        accessorKey: "studentName",
                        cell: (info) => <span className="text-slate-700">{info.getValue() || "N/A"}</span>,
                      },
                      {
                        header: "Supervisor",
                        accessorKey: "supervisorName",
                        cell: (info) => <span className="text-slate-700">{info.getValue() || "N/A"}</span>,
                      },
                      {
                        header: "Submission Date",
                        accessorKey: "createdAt",
                        cell: (info) => (
                          <span className="text-slate-700">
                            {new Date(info.getValue()).toLocaleDateString()}
                          </span>
                        ),
                      },
                      {
                        header: "Actions",
                        cell: (info) => (
                          <div className="flex gap-2">
                            <Link href={`/resources/${info.row.original.id}`}>
                              <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50 hover:text-blue-700">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="default"
                              size="sm"
                              disabled={processingAction}
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveResource(info.row.original.id)}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={processingAction}
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => {
                                setSelectedResource(info.row.original)
                                setIsRejectDialogOpen(true)
                              }}
                            >
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-slate-100 p-4 mb-4">
                      <FileText className="h-12 w-12 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800">No pending resources</h3>
                    <p className="text-slate-500 mt-2 max-w-md">
                      There are no resources waiting for your approval at this time.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-800">Reject Resource</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRejectResource} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason" className="text-slate-700">Reason for Rejection</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Please provide a reason for rejecting this resource"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
                rows={4}
                className="border-slate-300 focus:border-amber-500 focus:ring-amber-500"
              />
              <p className="text-xs text-slate-500">This reason will be shared with the uploader.</p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="outline" 
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
                onClick={() => setIsRejectDialogOpen(false)}
                disabled={processingAction}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="destructive" 
                disabled={processingAction}
                className="bg-red-600 hover:bg-red-700"
              >
                Reject Resource
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}