"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { 
  Search, 
  FileText, 
  ThumbsUp, 
  ThumbsDown, 
  Eye, 
  Loader2, 
  Download, 
  CheckCircle, 
  XCircle, 
  Filter, 
  SlidersHorizontal,
  Calendar,
  User,
  Bookmark,
  School,
  RefreshCw,
  ArrowUpDown
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import DashboardHeader from "@/components/dashboard-header"
import DataTable from "@/components/data-table"

export default function PendingApprovalsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [pendingResources, setPendingResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [approvalNotes, setApprovalNotes] = useState("")
  const [processingAction, setProcessingAction] = useState(false)
  const [viewMode, setViewMode] = useState("table")
  const [filterType, setFilterType] = useState("all")

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

  const handleApproveResource = async (e) => {
    if (e) e.preventDefault();
    if (!selectedResource) return;

    setProcessingAction(true)
    try {
      const response = await fetch(`http://localhost:5000/api/resources/${selectedResource.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          status: "approved",
          approvalNotes: approvalNotes 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to approve resource")
      }

      toast.success("Resource approved successfully")
      setIsApproveDialogOpen(false)
      setApprovalNotes("")
      setSelectedResource(null)
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

  const handleDownload = (resourceId) => {
    // Open the download URL in a new tab
    window.open(`http://localhost:5000/api/resources/${resourceId}/download`, "_blank")
  }

  const filteredResources = pendingResources.filter(resource => {
    // First apply the search filter
    const matchesSearch = 
      resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.uploadedByName && resource.uploadedByName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (resource.studentName && resource.studentName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Then apply the type filter
    if (filterType === "all") return matchesSearch;
    return matchesSearch && resource.type === filterType;
  });

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

  const getResourceIcon = (type) => {
    switch (type) {
      case "past-exam":
        return <FileText className="h-5 w-5 text-blue-600" />
      case "mini-project":
        return <Bookmark className="h-5 w-5 text-purple-600" />
      case "final-project":
        return <School className="h-5 w-5 text-emerald-600" />
      case "thesis":
        return <FileText className="h-5 w-5 text-amber-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const getUniqueResourceTypes = () => {
    const types = new Set(pendingResources.map(resource => resource.type));
    return Array.from(types);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <div className="container flex-1 items-center justify-center flex flex-col gap-3">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading pending resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <DashboardHeader />
      <div className="container py-8">
        <main className="flex w-full flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 mb-6 text-white">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pending Approvals</h1>
                <p className="mt-1 text-blue-100">
                  Review and approve pending resource submissions
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button 
                  variant="ghost" 
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  onClick={fetchData}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search by title, department, student name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex flex-wrap gap-3 items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                      {filterType !== "all" && <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">{getResourceTypeName(filterType)}</Badge>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-3" align="end">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Filter by type</h4>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {getUniqueResourceTypes().map(type => (
                            <SelectItem key={type} value={type}>{getResourceTypeName(type)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Tabs value={viewMode} onValueChange={setViewMode} className="ml-auto">
                  <TabsList className="grid w-36 grid-cols-2">
                    <TabsTrigger value="table" className="bg-indigo-600 py-1 px-4 rounded-md text-white cursor-pointer mr-2">Table</TabsTrigger>
                    <TabsTrigger value="cards" className="bg-indigo-600 py-1 px-4 rounded-md text-white cursor-pointer">Cards</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>

          {filteredResources.length > 0 ? (
            <>
              {viewMode === "table" ? (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <DataTable
                    data={filteredResources}
                    columns={[
                      {
                        header: ({ column }) => (
                          <div className="flex items-center">
                            Resource
                            <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
                          </div>
                        ),
                        accessorKey: "title",
                        cell: (info) => (
                          <div className="flex items-center gap-3">
                            <div className={`rounded-md p-2 ${getResourceTypeColor(info.row.original.type).replace("bg-", "bg-").replace("text-", "")}`}>
                              {getResourceIcon(info.row.original.type)}
                            </div>
                            <div>
                              <div className="font-medium">{info.getValue()}</div>
                              <Badge className={`mt-1 ${getResourceTypeColor(info.row.original.type)}`}>
                                {getResourceTypeName(info.row.original.type)}
                              </Badge>
                            </div>
                          </div>
                        ),
                      },
                      {
                        header: "Department",
                        accessorKey: "department",
                      },
                      {
                        header: "People",
                        accessorKey: "uploadedByName",
                        cell: (info) => (
                          <div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{info.row.original.uploadedByName || "Unknown"}</span>
                            </div>
                            {info.row.original.studentName && (
                              <div className="flex items-center gap-1 mt-1">
                                <School className="h-3 w-3 text-gray-400" />
                                <span className="text-sm">{info.row.original.studentName}</span>
                              </div>
                            )}
                          </div>
                        ),
                      },
                      {
                        header: "Submission Date",
                        accessorKey: "createdAt",
                        cell: (info) => (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span>{new Date(info.getValue()).toLocaleDateString()}</span>
                          </div>
                        ),
                      },
                      {
                        header: "Actions",
                        cell: (info) => (
                          <div className="flex gap-2 justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <SlidersHorizontal className="h-4 w-4 mr-1" />
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36">
                                <Link href={`/resources/${info.row.original.id}`}>
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem onClick={() => handleDownload(info.row.original.id)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                              disabled={processingAction}
                              onClick={() => {
                                setSelectedResource(info.row.original)
                                setIsApproveDialogOpen(true)
                              }}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
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
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource) => (
                    <Card key={resource.id} className="overflow-hidden border hover:border-blue-200 transition-all hover:shadow-md">
                      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-md p-2 ${getResourceTypeColor(resource.type)}`}>
                            {getResourceIcon(resource.type)}
                          </div>
                          <div>
                            <Badge className={`${getResourceTypeColor(resource.type)}`}>
                              {getResourceTypeName(resource.type)}
                            </Badge>
                            <h3 className="text-lg font-semibold mt-1 line-clamp-1">{resource.title}</h3>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <School className="h-4 w-4 text-gray-500" />
                            <span>{resource.department}</span>
                          </div>
                          
                          {resource.uploadedByName && (
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-700">Uploaded by {resource.uploadedByName}</span>
                            </div>
                          )}
                          
                          {resource.studentName && (
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-700">Student: {resource.studentName}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">
                              Submitted on {new Date(resource.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-2 flex flex-wrap gap-2 justify-between border-t bg-gray-50">
                        <div className="flex gap-2">
                          <Link href={`/resources/${resource.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" onClick={() => handleDownload(resource.id)}>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            disabled={processingAction}
                            onClick={() => {
                              setSelectedResource(resource)
                              setIsApproveDialogOpen(true)
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={processingAction}
                            onClick={() => {
                              setSelectedResource(resource)
                              setIsRejectDialogOpen(true)
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg shadow-sm border">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <FileText className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium">No pending resources</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                There are no resources waiting for your approval at this time.
              </p>
              <Button className="mt-6" variant="outline" onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          )}

          {/* Rejection Dialog */}
          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center text-red-600">
                  <XCircle className="h-5 w-5 mr-2" />
                  Reject Resource
                </DialogTitle>
                {selectedResource && (
                  <DialogDescription className="pt-2">
                    You are rejecting: <span className="font-medium">{selectedResource.title}</span>
                  </DialogDescription>
                )}
              </DialogHeader>
              <form onSubmit={handleRejectResource} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">Reason for Rejection</Label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="Please provide a detailed reason for rejecting this resource"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">This reason will be shared with the uploader to help them understand why the resource was rejected.</p>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
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
                {selectedResource && (
                  <DialogDescription className="pt-2">
                    You are approving: <span className="font-medium">{selectedResource.title}</span>
                  </DialogDescription>
                )}
              </DialogHeader>
              <form onSubmit={handleApproveResource} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="approvalNotes">Approval Notes (Optional)</Label>
                  <Textarea
                    id="approvalNotes"
                    placeholder="Add any notes about this resource (optional)"
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">These notes will be attached to the resource record for future reference.</p>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
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
        </main>
      </div>
    </div>
  )
}