"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { 
  Download, 
  ThumbsUp, 
  ThumbsDown, 
  Loader2, 
  FileText, 
  Calendar, 
  User, 
  BookOpen, 
  Tag, 
  School, 
  Clock, 
  File,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DocumentViewer from "./document-viewer"

export default function ResourcePreview({ resourceId, onApprove, onReject }) {
  const router = useRouter()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processingAction, setProcessingAction] = useState(false)
  const [activeTab, setActiveTab] = useState("preview")
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [approvalReason, setApprovalReason] = useState("")

  useEffect(() => {
    if (resourceId) {
      fetchResourceDetails()
    }
  }, [resourceId])

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
      toast.success("Resource approved successfully")
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
      toast.success("Resource rejected")
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

  const getResourceTypeColor = (type) => {
    switch (type) {
      case "past-exam":
        return "bg-blue-100 text-blue-800"
      case "mini-project":
        return "bg-purple-100 text-purple-800"
      case "final-project":
        return "bg-emerald-100 text-emerald-800"
      case "thesis":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType?.includes("pdf")) return { name: "PDF", color: "text-red-600", bgColor: "bg-red-100" }
    if (fileType?.includes("word") || fileType?.includes("doc")) return { name: "DOC", color: "text-blue-600", bgColor: "bg-blue-100" }
    if (fileType?.includes("presentation") || fileType?.includes("ppt")) return { name: "PPT", color: "text-orange-600", bgColor: "bg-orange-100" }
    if (fileType?.includes("zip") || fileType?.includes("compressed")) return { name: "ZIP", color: "text-yellow-600", bgColor: "bg-yellow-100" }
    return { name: "FILE", color: "text-gray-600", bgColor: "bg-gray-100" }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Loading resource details...</p>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center min-h-[400px] bg-gray-50 rounded-lg border border-dashed">
        <FileText className="h-16 w-16 text-muted-foreground mb-6 opacity-50" />
        <h3 className="text-xl font-medium">Resource not found</h3>
        <p className="text-muted-foreground mt-2 max-w-md">The requested resource could not be found or may have been deleted.</p>
        <Button className="mt-6" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  const fileIconDetails = getFileIcon(resource.fileType);

  return (
    <div className="relative bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-6 md:py-8">
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-4 left-4 text-white hover:bg-white/20 hover:text-white" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white">
            <div className="space-y-2">
              <Badge 
                className={`${getResourceTypeColor(resource.type)} text-xs font-medium py-1 px-2`}
              >
                {getResourceTypeName(resource.type)}
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold leading-tight text-white">{resource.title}</h1>
              <div className="flex items-center text-blue-100 text-sm">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{resource.formattedCreatedDate || new Date(resource.createdAt).toLocaleDateString()}</span>
                {resource.department && (
                  <>
                    <span className="mx-2">•</span>
                    <School className="h-4 w-4 mr-1" />
                    <span>{resource.department}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4 sm:mt-0">
              <Button 
                variant="ghost" 
                className="bg-white/10 hover:bg-white/20 text-white border-white/20" 
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-wrap items-center justify-between border-b mb-6">
              <TabsList className="h-10 bg-transparent p-0">
                <TabsTrigger 
                  value="preview" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent h-10 px-4"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Document Preview
                </TabsTrigger>
                <TabsTrigger 
                  value="details" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent h-10 px-4"
                >
                  <Info className="h-4 w-4 mr-2" />
                  Details
                </TabsTrigger>
              </TabsList>
              
              <div className="flex space-x-2 py-2">
                <Button 
                  variant="outline" 
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" 
                  onClick={() => setIsRejectDialogOpen(true)}
                  disabled={processingAction}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700" 
                  onClick={() => setIsApproveDialogOpen(true)}
                  disabled={processingAction}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>

            <TabsContent value="preview" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="bg-gray-50 border rounded-lg min-h-[500px] p-4">
                <DocumentViewer resourceId={resourceId} />
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Document Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* About Section */}
                  <div className="bg-white rounded-lg border p-6">
                    <div className="flex items-center mb-4">
                      <h2 className="text-lg font-semibold">About this Resource</h2>
                    </div>
                    <p className="text-gray-700 whitespace-pre-line">{resource.description}</p>
                    
                    {resource.tags && (
                      <div className="mt-4">
                        <div className="flex items-center mb-2">
                          <Tag className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600">Tags</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {resource.tags.split(",").map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs py-1">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Academic Info */}
                  {(resource.year || resource.semester || resource.course) && (
                    <div className="bg-white rounded-lg border p-6">
                      <div className="flex items-center mb-4">
                        <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                        <h2 className="text-lg font-semibold">Academic Information</h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {resource.course && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Course</h3>
                            <p className="text-gray-800 font-medium">{resource.course}</p>
                          </div>
                        )}
                        {resource.year && (
                          <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Year</h3>
                            <p className="text-gray-800 font-medium">{resource.year}</p>
                          </div>
                        )}
                        {resource.semester && (
                          <div className="bg-amber-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Semester</h3>
                            <p className="text-gray-800 font-medium">{resource.semester}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Right Column - People & File Info */}
                <div className="space-y-6">
                  {/* File Info */}
                  <div className="bg-white rounded-lg border p-6">
                    <div className="flex items-center mb-4">
                      <File className="h-5 w-5 mr-2 text-blue-600" />
                      <h2 className="text-lg font-semibold">File Information</h2>
                    </div>
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <div className={`${fileIconDetails.bgColor} rounded-lg p-3 mr-4`}>
                        <FileText className={`h-6 w-6 ${fileIconDetails.color}`} />
                      </div>
                      <div>
                        <p className="font-medium">{fileIconDetails.name}</p>
                        <p className="text-sm text-gray-500">{Math.round((resource.fileSize || 0) / 1024)} KB</p>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-auto" onClick={handleDownload}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* People Info */}
                  <div className="bg-white rounded-lg border p-6">
                    <div className="flex items-center mb-4">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      <h2 className="text-lg font-semibold">People</h2>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Student Info */}
                      {resource.studentName && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Student</h3>
                          <p className="font-medium">{resource.studentName}</p>
                          {resource.studentEmail && (
                            <p className="text-sm text-gray-500">{resource.studentEmail}</p>
                          )}
                          {resource.studentIndexNumber && (
                            <p className="text-sm text-gray-500">Index: {resource.studentIndexNumber}</p>
                          )}
                        </div>
                      )}
                      
                      {/* Uploader Info */}
                      {resource.uploadedByName && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Uploaded By</h3>
                          <p className="font-medium">{resource.uploadedByName}</p>
                          {resource.uploaderEmail && (
                            <p className="text-sm text-gray-500">{resource.uploaderEmail}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <XCircle className="h-5 w-5 mr-2" />
              Reject Resource
            </DialogTitle>
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
                className="resize-none"
              />
              <p className="text-xs text-gray-500">This reason will be shared with the uploader to help them understand why the resource was rejected.</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-emerald-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              Approve Resource
            </DialogTitle>
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
                className="resize-none"
              />
              <p className="text-xs text-gray-500">Add any notes about why this resource meets the approval criteria.</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={processingAction}>
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