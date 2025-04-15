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
import { Search, FileText, ThumbsUp, ThumbsDown, Eye, Loader2 } from "lucide-react"
import DashboardNav from "@/components/dashboard-nav"
import DashboardHeader from "@/components/dashboard-header"
import DataTable from "@/components/data-table"

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

        if (data.user.role !== "supervisor") {
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
      const pendingResponse = await fetch("http://localhost:5000/api/resources/pending/supervisor", {
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
      (resource.studentName && resource.studentName.toLowerCase().includes(searchQuery.toLowerCase())),
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
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <div className="container flex-1 items-center justify-center flex">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
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
              <h1 className="text-3xl font-bold tracking-tight">Pending Approvals</h1>
              <p className="text-muted-foreground">Review and approve pending resource submissions.</p>
            </div>
          </div>

          <div className="my-6">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pending resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
          </div>

          {filteredPendingResources.length > 0 ? (
            <DataTable
              data={filteredPendingResources}
              columns={[
                { header: "Title", accessorKey: "title" },
                {
                  header: "Type",
                  accessorKey: "type",
                  cell: (info) => getResourceTypeName(info.getValue()),
                },
                { header: "Department", accessorKey: "department" },
                {
                  header: "Uploaded By",
                  accessorKey: "uploadedByName",
                  cell: (info) => info.getValue() || "Unknown",
                },
                {
                  header: "Student",
                  accessorKey: "studentName",
                  cell: (info) => info.getValue() || "N/A",
                },
                {
                  header: "Submission Date",
                  accessorKey: "createdAt",
                  cell: (info) => new Date(info.getValue()).toLocaleDateString(),
                },
                {
                  header: "Actions",
                  cell: (info) => (
                    <div className="flex gap-2">
                      <Link href={`/resources/${info.row.original.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="default"
                        size="sm"
                        disabled={processingAction}
                        onClick={() => handleApproveResource(info.row.original.id)}
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
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No pending resources</h3>
              <p className="text-muted-foreground mt-2">
                There are no resources waiting for your approval at this time.
              </p>
            </div>
          )}

          {/* Rejection Dialog */}
          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Resource</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRejectResource} className="space-y-4 py-4">
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
        </main>
      </div>
    </div>
  )
}
