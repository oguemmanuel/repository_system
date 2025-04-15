"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ArrowLeft, Download, Eye, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ResourceDetail({ params }) {
  const router = useRouter()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processingAction, setProcessingAction] = useState(false)

  useEffect(() => {
    const fetchUserAndResource = async () => {
      try {
        // Try to get user from localStorage first
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }

        // Fetch current user from API
        const userResponse = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include",
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData.user)
          localStorage.setItem("user", JSON.stringify(userData.user))
        }

        // Fetch resource details
        const resourceResponse = await fetch(`http://localhost:5000/api/resources/${params.id}`, {
          credentials: "include",
        })

        if (resourceResponse.ok) {
          const resourceData = await resourceResponse.json()
          setResource(resourceData.resource)
        } else {
          toast.error("Resource not found or you don't have permission to view it")
          router.push("/")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Error loading resource details")
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndResource()
  }, [params.id, router])

  const handleApprove = async () => {
    setProcessingAction(true)
    try {
      const response = await fetch(`http://localhost:5000/api/resources/${resource.id}/status`, {
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

      // Update resource status in state
      setResource({ ...resource, status: "approved" })
    } catch (error) {
      console.error("Error approving resource:", error)
      toast.error(error.message || "Failed to approve resource")
    } finally {
      setProcessingAction(false)
    }
  }

  const handleReject = async (e) => {
    e.preventDefault()
    if (!rejectionReason) {
      toast.error("Please provide a reason for rejection")
      return
    }

    setProcessingAction(true)
    try {
      const response = await fetch(`http://localhost:5000/api/resources/${resource.id}/status`, {
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

      // Update resource status in state
      setResource({ ...resource, status: "rejected", rejectionReason })
    } catch (error) {
      console.error("Error rejecting resource:", error)
      toast.error(error.message || "Failed to reject resource")
    } finally {
      setProcessingAction(false)
    }
  }

  const handleDownload = () => {
    window.location.href = `http://localhost:5000/api/resources/${resource.id}/download`
  }

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

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "approved":
        return "success"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00447c]"></div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Resource Not Found</h1>
        <p className="mb-6">The resource you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    )
  }

  const canApprove =
    user &&
    (user.role === "admin" ||
      (user.role === "supervisor" &&
        (resource.type === "mini-project" ||
          (resource.type === "final-project" &&
            (resource.supervisorId === user.id || resource.department === user.department)))))

  const isPending = resource.status === "pending"

  return (
    <div className="container py-8">
      <Button asChild variant="outline" className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-2xl">{resource.title}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{getResourceTypeName(resource.type)}</Badge>
              <Badge variant="outline">{resource.department}</Badge>
              <Badge variant={getStatusBadgeVariant(resource.status)}>{resource.status}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-muted-foreground">{resource.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Details</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Uploaded By:</span>
                  <span className="font-medium">{resource.uploadedByName || "Unknown"}</span>
                </li>
                {resource.studentName && (
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Student:</span>
                    <span className="font-medium">{resource.studentName}</span>
                  </li>
                )}
                {resource.supervisorName && (
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Supervisor:</span>
                    <span className="font-medium">{resource.supervisorName}</span>
                  </li>
                )}
                {resource.year && (
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Year:</span>
                    <span className="font-medium">{resource.year}</span>
                  </li>
                )}
                {resource.semester && (
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Semester:</span>
                    <span className="font-medium">{resource.semester}</span>
                  </li>
                )}
                {resource.course && (
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Course:</span>
                    <span className="font-medium">{resource.course}</span>
                  </li>
                )}
                {resource.tags && (
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Tags:</span>
                    <span className="font-medium">{resource.tags}</span>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Statistics</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Views:</span>
                  <span className="font-medium flex items-center">
                    <Eye className="h-4 w-4 mr-1" /> {resource.views || 0}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Downloads:</span>
                  <span className="font-medium flex items-center">
                    <Download className="h-4 w-4 mr-1" /> {resource.downloads || 0}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Uploaded:</span>
                  <span className="font-medium">{new Date(resource.createdAt).toLocaleDateString()}</span>
                </li>
                {resource.status === "rejected" && resource.rejectionReason && (
                  <li className="mt-4">
                    <span className="text-destructive font-medium">Rejection Reason:</span>
                    <p className="text-muted-foreground mt-1 p-2 bg-destructive/10 rounded-md">
                      {resource.rejectionReason}
                    </p>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {resource.fileType && resource.fileType.includes("pdf") && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Document Preview</h3>
              <div className="border rounded-md overflow-hidden">
                <iframe
                  src={`http://localhost:5000/uploads/resources/${resource.filePath.split("/").pop()}#toolbar=0`}
                  className="w-full h-[500px]"
                  title="Document Preview"
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap justify-between gap-4">
          <div>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>

          {canApprove && isPending && (
            <div className="flex gap-2">
              <Button variant="default" onClick={handleApprove} disabled={processingAction}>
                {processingAction ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ThumbsUp className="mr-2 h-4 w-4" />
                )}
                Approve
              </Button>
              <Button variant="destructive" onClick={() => setIsRejectDialogOpen(true)} disabled={processingAction}>
                <ThumbsDown className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Resource</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReject} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="rejectionReason" className="text-sm font-medium">
                Reason for Rejection
              </label>
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
                {processingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reject Resource"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
