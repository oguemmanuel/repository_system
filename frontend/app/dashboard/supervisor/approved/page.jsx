"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Search, BookOpen, Download, Eye, FileText, Filter } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import DataTable from "@/components/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

export default function ApprovedResourcesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [approvedResources, setApprovedResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

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

        setUser(data.user)
        fetchData(data.user.id)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  const fetchData = async (supervisorId) => {
    setLoading(true)
    try {
      // Fetch approved resources
      const approvedResponse = await fetch(
        `http://localhost:5000/api/resources?status=approved&supervisorId=${supervisorId}`,
        {
          credentials: "include",
        },
      )

      if (approvedResponse.ok) {
        const approvedData = await approvedResponse.json()
        setApprovedResources(approvedData.resources || [])
      } else {
        toast.error("Failed to fetch approved resources")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (resourceId) => {
    // Open the download URL in a new tab
    window.open(`http://localhost:5000/api/resources/${resourceId}/download`, "_blank")
  }

  const filteredApprovedResources = approvedResources.filter(
    (resource) =>
      resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const getResourceTypeIcon = (type) => {
    switch (type) {
      case "past-exam":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "mini-project":
        return <FileText className="h-4 w-4 text-green-500" />
      case "final-project":
        return <FileText className="h-4 w-4 text-purple-500" />
      case "thesis":
        return <BookOpen className="h-4 w-4 text-amber-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getResourceTypeBadgeStyle = (type) => {
    switch (type) {
      case "past-exam":
        return "bg-blue-100 text-blue-800"
      case "mini-project":
        return "bg-green-100 text-green-800"
      case "final-project":
        return "bg-purple-100 text-purple-800"
      case "thesis":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <DashboardHeader />
        <div className="container flex-1 items-center justify-center flex">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading resources...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <DashboardHeader />
      <div className="container py-8 flex-1">
        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="bg-white pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold text-gray-900">
                  Approved Resources
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  View and manage resources you have approved
                </p>
              </div>
              <div className="flex gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Filter className="h-4 w-4" />
                      <span>Filter</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuGroup>
                      <DropdownMenuItem>Past Exams</DropdownMenuItem>
                      <DropdownMenuItem>Mini Projects</DropdownMenuItem>
                      <DropdownMenuItem>Final Year Projects</DropdownMenuItem>
                      <DropdownMenuItem>Theses</DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, type, department or student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200"
                />
              </div>
            </div>

            {filteredApprovedResources.length > 0 ? (
              <div className="rounded-lg border border-gray-100 overflow-hidden">
                <DataTable
                  data={filteredApprovedResources}
                  columns={[
                    { 
                      header: "Title", 
                      accessorKey: "title",
                      cell: (info) => (
                        <div className="font-medium text-gray-900 hover:text-primary transition-colors">
                          {info.getValue()}
                        </div>
                      )
                    },
                    {
                      header: "Type",
                      accessorKey: "type",
                      cell: (info) => (
                        <div className="flex items-center gap-2">
                          {getResourceTypeIcon(info.getValue())}
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getResourceTypeBadgeStyle(info.getValue())}`}>
                            {getResourceTypeName(info.getValue())}
                          </span>
                        </div>
                      ),
                    },
                    { 
                      header: "Department", 
                      accessorKey: "department",
                      cell: (info) => (
                        <span className="text-gray-700">{info.getValue()}</span>
                      )
                    },
                    {
                      header: "Student",
                      accessorKey: "studentName",
                      cell: (info) => (
                        <span className="text-gray-700">{info.getValue() || "N/A"}</span>
                      )
                    },
                    {
                      header: "Approval Date",
                      accessorKey: "updatedAt",
                      cell: (info) => (
                        <span className="text-gray-600 text-sm">
                          {new Date(info.getValue()).toLocaleDateString()}
                        </span>
                      )
                    },
                    {
                      header: "Views",
                      accessorKey: "views",
                      cell: (info) => (
                        <div className="flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-600">{info.getValue() || 0}</span>
                        </div>
                      )
                    },
                    {
                      header: "Downloads",
                      accessorKey: "downloads",
                      cell: (info) => (
                        <div className="flex items-center gap-1.5">
                          <Download className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-600">{info.getValue() || 0}</span>
                        </div>
                      )
                    },
                    {
                      header: "Actions",
                      cell: (info) => (
                        <div className="flex gap-2">
                          <Link href={`/resources/${info.row.original.id}`}>
                            <Button variant="outline" size="sm" className="bg-gray-50 hover:bg-gray-100 text-gray-700">
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDownload(info.row.original.id)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                          >
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Download
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            ) : (
              <Card className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 border-dashed border-2 border-gray-200">
                <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-800">No approved resources</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  You haven't approved any resources yet. Resources that you approve will appear here.
                </p>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}