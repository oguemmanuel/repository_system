"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Search, FileText, Download, Trash2, Eye, Upload } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import DataTable from "@/components/data-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import AISummaryButton from "@/components/ai-summary-button"

export default function ResourcesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [departments, setDepartments] = useState([])
  const [filters, setFilters] = useState({
    type: "",
    department: "",
    status: "",
  })

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
        fetchDepartments()
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
      // Build query string from filters
      const queryParams = new URLSearchParams()

      if (filters.type) queryParams.append("type", filters.type)
      if (filters.department) queryParams.append("department", filters.department)
      if (filters.status) queryParams.append("status", filters.status)
      if (searchQuery) queryParams.append("search", searchQuery)

      // Fetch resources
      const resourcesResponse = await fetch(`http://localhost:5000/api/resources?${queryParams.toString()}`, {
        credentials: "include",
      })

      if (resourcesResponse.ok) {
        const resourcesData = await resourcesResponse.json()
        setResources(resourcesData.resources || [])
      } else {
        toast.error("Failed to fetch resources")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users/departments/all", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setDepartments(data.departments || [])
      }
    } catch (error) {
      console.error("Error fetching departments:", error)
    }
  }

  const handleDeleteResource = async (resourceId) => {
    if (!confirm("Are you sure you want to delete this resource? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/resources/${resourceId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete resource")
      }

      toast.success("Resource deleted successfully")
      fetchData() // Refresh data
    } catch (error) {
      console.error("Error deleting resource:", error)
      toast.error(error.message || "Failed to delete resource")
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchData()
  }

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const resetFilters = () => {
    setFilters({
      type: "",
      department: "",
      status: "",
    })
    setSearchQuery("")
    // Fetch data with reset filters
    setTimeout(fetchData, 0)
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

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-50 text-green-700 border-green-200"
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200"
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-slate-100">
        <DashboardHeader />
        <div className="container max-w-6xl mx-auto flex-1 items-center justify-center flex">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-slate-100">
      <DashboardHeader />
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Card className="border shadow-md bg-white">
          <CardHeader className="border-b bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold tracking-tight text-slate-800">Resource Management</CardTitle>
                <CardDescription className="text-slate-600">Manage all resources in the repository.</CardDescription>
              </div>
              <Link href="/upload">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New Resource
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <form
                onSubmit={handleSearch}
                className="flex flex-col gap-4 md:flex-row bg-white p-4 rounded-lg shadow-sm border"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                  <SelectTrigger className="w-full md:w-[180px] border-slate-300">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="past-exam">Past Exams</SelectItem>
                    <SelectItem value="mini-project">Mini Projects</SelectItem>
                    <SelectItem value="final-project">Final Year Projects</SelectItem>
                    <SelectItem value="thesis">Theses</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.department} onValueChange={(value) => handleFilterChange("department", value)}>
                  <SelectTrigger className="w-full md:w-[180px] border-slate-300">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger className="w-full md:w-[180px] border-slate-300">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                    Search
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetFilters}
                    className="border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    Reset
                  </Button>
                </div>
              </form>

              <div className="bg-white rounded-lg shadow-sm border">
                {resources.length > 0 ? (
                  <DataTable
                    data={resources}
                    columns={[
                      {
                        header: "Title",
                        accessorKey: "title",
                        cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
                      },
                      {
                        header: "Type",
                        accessorKey: "type",
                        cell: (info) => (
                          <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                            {getResourceTypeName(info.getValue())}
                          </span>
                        ),
                      },
                      {
                        header: "Department",
                        accessorKey: "department",
                        cell: (info) => <span className="text-slate-700">{info.getValue()}</span>,
                      },
                      {
                        header: "Uploaded By",
                        accessorKey: "uploadedByName",
                        cell: (info) => <span className="text-slate-700">{info.getValue() || "Unknown"}</span>,
                      },
                      {
                        header: "Status",
                        accessorKey: "status",
                        cell: (info) => (
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(
                              info.getValue(),
                            )}`}
                          >
                            {info.getValue()}
                          </span>
                        ),
                      },
                      {
                        header: "Actions",
                        cell: (info) => (
                          <div className="flex gap-2">
                            <Link href={`/resources/${info.row.original.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-200 hover:bg-slate-50 hover:text-blue-700"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <AISummaryButton resourceId={info.row.original.id} title={info.row.original.title} />
                            <Link
                              href={`/resources/${info.row.original.id}/download`}
                              passHref
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-200 hover:bg-slate-50 hover:text-blue-700"
                                asChild
                              >
                                <div>
                                  <Download className="h-4 w-4" />
                                </div>
                              </Button>
                            </Link>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border border-red-200"
                              onClick={() => handleDeleteResource(info.row.original.id)}
                            >
                              <Trash2 className="h-4 w-4" />
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
                    <h3 className="text-lg font-medium text-slate-800">No resources found</h3>
                    <p className="text-slate-500 mt-2 max-w-md">
                      Try adjusting your search or filters to find what you're looking for.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
