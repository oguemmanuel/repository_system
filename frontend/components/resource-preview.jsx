"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Download, FileText, ThumbsUp, ThumbsDown, Loader2, File } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import DocumentViewer from "./document-viewer"

export default function ResourcePreview({ resourceId, onApprove, onReject }) {
  const router = useRouter()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processingAction, setProcessingAction] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  // Add a new state for the approval dialog and reason
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [approvalReason, setApprovalReason] = useState("")

  useEffect(() => {
    if (resourceId) {
      fetchResourceDetails()
    }
  }, [resourceId])

  // Update the fetchResourceDetails function to provide more detailed error information
  const fetchResourceDetails = async () => {
    setLoading(true)
    try {
      console.log("Fetching resource details for ID:", resourceId)

      // Check if the server is reachable first
      try {
        const serverCheckResponse = await fetch("http://localhost:5000/api/auth/me", {
          method: "HEAD",
          credentials: "include",
        }).catch((e) => {
          console.error("Server connection error:", e)
          throw new Error("Cannot connect to server. Please check if the server is running.")
        })

        console.log("Server is reachable, status:", serverCheckResponse.status)
      } catch (serverError) {
        console.error("Server check failed:", serverError)
        throw serverError
      }

      // Now try to fetch the resource
      const response = await fetch(`http://localhost:5000/api/resources/${resourceId}`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
      }).catch((e) => {
        console.error("Resource fetch network error:", e)
        throw new Error("Network error when fetching resource. Please check your connection.")
      })

      console.log("Resource API response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      })

      if (!response.ok) {
        const errorMessage = `Server returned ${response.status} ${response.statusText}`
        let errorDetails = ""

        try {
          // Try to parse as JSON first
          const errorData = await response.json()
          console.error("API Error Response (JSON):", errorData)
          errorDetails = errorData.message || JSON.stringify(errorData)
        } catch (jsonError) {
          // If not JSON, get as text
          try {
            const errorText = await response.text()
            console.error("API Error Response (Text):", errorText)
            errorDetails = errorText || "No error details available"
          } catch (textError) {
            console.error("Could not read error response:", textError)
            errorDetails = "Could not read error response"
          }
        }

        throw new Error(`${errorMessage}: ${errorDetails}`)
      }

      // Parse the JSON response
      let data
      try {
        data = await response.json()
        console.log("Resource data received:", data)
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError)
        throw new Error("Failed to parse server response as JSON")
      }

      if (!data || !data.resource) {
        console.error("Invalid data structure:", data)
        throw new Error("Server returned invalid data structure")
      }

      setResource(data.resource)
    } catch (error) {
      console.error("Error fetching resource details:", error)
      toast.error(`Failed to load resource details: ${error.message}`)
      setResource(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      // Open the download URL in a new tab
      window.open(`http://localhost:5000/api/resources/${resourceId}/download`, "_blank")
    } catch (error) {
      console.error("Error downloading resource:", error)
      toast.error("Failed to download resource")
    }
  }

  // Update the handleApprove function to use the dialog
  const handleApprove = async (e) => {
    if (e) e.preventDefault();
    if (!approvalReason) {
      toast.error("Please provide a reason for approval")
      return
    }

    setProcessingAction(true)
    try {
      await onApprove(resourceId, approvalReason)
      setIsApproveDialogOpen(false)
      setApprovalReason("")
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
      await onReject(resourceId, rejectionReason)
      setIsRejectDialogOpen(false)
      setRejectionReason("")
    } finally {
      setProcessingAction(false)
    }
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

  const getFileIcon = (fileType) => {
    if (fileType?.includes("pdf")) return "PDF"
    if (fileType?.includes("word") || fileType?.includes("doc")) return "DOC"
    if (fileType?.includes("presentation") || fileType?.includes("ppt")) return "PPT"
    if (fileType?.includes("zip") || fileType?.includes("compressed")) return "ZIP"
    return "FILE"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Resource not found</h3>
        <p className="text-muted-foreground mt-2">The requested resource could not be found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{resource.title}</CardTitle>
            <Badge variant="outline">{getResourceTypeName(resource.type)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="preview">Document Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Department</h3>
                  <p>{resource.department}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Submission Date</h3>
                  <p>{resource.formattedCreatedDate || new Date(resource.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Uploaded By</h3>
                  <p>{resource.uploadedByName || "Unknown"}</p>
                  {resource.uploaderEmail && <p className="text-sm text-muted-foreground">{resource.uploaderEmail}</p>}
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Student</h3>
                  <p>{resource.studentName || "N/A"}</p>
                  {resource.studentEmail && <p className="text-sm text-muted-foreground">{resource.studentEmail}</p>}
                  {resource.studentIndexNumber && (
                    <p className="text-sm text-muted-foreground">Index: {resource.studentIndexNumber}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Description</h3>
                <p className="whitespace-pre-line">{resource.description}</p>
              </div>

              {(resource.year || resource.semester || resource.course || resource.tags) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resource.year && (
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">Year</h3>
                        <p>{resource.year}</p>
                      </div>
                    )}
                    {resource.semester && (
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">Semester</h3>
                        <p>{resource.semester}</p>
                      </div>
                    )}
                    {resource.course && (
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">Course</h3>
                        <p>{resource.course}</p>
                      </div>
                    )}
                    {resource.tags && (
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">Tags</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {resource.tags.split(",").map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <Separator />

              <div className="bg-muted p-4 rounded-md flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-background rounded-md p-2 mr-3">
                    <File className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{getFileIcon(resource.fileType)}</p>
                    <p className="text-sm text-muted-foreground">{Math.round((resource.fileSize || 0) / 1024)} KB</p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="preview">
              <DocumentViewer resourceId={resourceId} />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="default" disabled={processingAction} onClick={() => setIsApproveDialogOpen(true)}>
              {processingAction ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ThumbsUp className="h-4 w-4 mr-2" />
              )}
              Approve
            </Button>
            <Button variant="destructive" disabled={processingAction} onClick={() => setIsRejectDialogOpen(true)}>
              <ThumbsDown className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
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

      {/* Approval Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Resource</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleApprove} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="approvalReason">Reason for Approval</Label>
              <Textarea
                id="approvalReason"
                placeholder="Please provide a reason for approving this resource"
                value={approvalReason}
                onChange={(e) => setApprovalReason(e.target.value)}
                required
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button type="submit" variant="default" disabled={processingAction} className="bg-emerald-600 hover:bg-emerald-700">
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
    </div>
  )
}
