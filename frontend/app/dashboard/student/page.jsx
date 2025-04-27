"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  BookOpen,
  FileText,
  GraduationCap,
  LogOut,
  Search,
  Upload,
  User,
  Eye,
  Download,
  XCircle,
  Loader2
} from "lucide-react"
import DashboardNav from "@/components/dashboard-nav"
import DashboardHeader from "@/components/dashboard-header"
import DataTable from "@/components/data-table"

export default function StudentDashboard() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [myResources, setMyResources] = useState([])
  const [approvedResources, setApprovedResources] = useState([])
  const [stats, setStats] = useState({
    totalUploads: 0,
    pendingResources: 0,
    approvedResources: 0,
    rejectedResources: 0,
  })

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get user from localStorage first
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          if (parsedUser.role !== "student") {
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

        // If not a student, redirect
        if (data.user.role !== "student") {
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
      // Fetch student's resources
      const myResourcesResponse = await fetch("http://localhost:5000/api/resources/student/my-resources", {
        credentials: "include",
      })

      // Fetch approved resources
      const approvedResourcesResponse = await fetch("http://localhost:5000/api/resources?status=approved", {
        credentials: "include",
      })

      // Fetch user analytics
      const analyticsResponse = await fetch("http://localhost:5000/api/analytics/user", {
        credentials: "include",
      })

      if (myResourcesResponse.ok) {
        const myResourcesData = await myResourcesResponse.json()
        setMyResources(myResourcesData.resources || [])

        // Calculate stats from resources
        const pendingCount = myResourcesData.resources.filter((r) => r.status === "pending").length
        const approvedCount = myResourcesData.resources.filter((r) => r.status === "approved").length
        const rejectedCount = myResourcesData.resources.filter((r) => r.status === "rejected").length

        setStats((prev) => ({
          ...prev,
          totalUploads: myResourcesData.resources.length,
          pendingResources: pendingCount,
          approvedResources: approvedCount,
          rejectedResources: rejectedCount,
        }))
      }

      if (approvedResourcesResponse.ok) {
        const approvedResourcesData = await approvedResourcesResponse.json()
        setApprovedResources(approvedResourcesData.resources || [])
      }

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setStats((prev) => ({
          ...prev,
          ...analyticsData.analytics,
        }))
      }
    } catch (error) {
      console.error("Error fetching resources:", error)
      toast.error("Failed to load resources. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const filteredMyResources = myResources.filter(
    (resource) =>
      resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.department?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredApprovedResources = approvedResources.filter(
    (resource) =>
      resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.uploadedByName?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Get current time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
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

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <div className="bg-gradient-to-b from-blue-800 to-blue-900 text-white rounded-lg shadow-lg p-4 h-full">
            <div className="mb-6 mt-2">
              <div className="flex items-center space-x-2 px-2">
                <GraduationCap className="h-6 w-6 text-blue-200" />
                <h2 className="text-xl font-bold text-blue-100">Student Portal</h2>
              </div>
              <div className="mt-3 px-2">
                <p className="text-sm text-blue-300">{user?.fullName || "Student"}</p>
                <p className="text-xs text-blue-400">{user?.email || ""}</p>
              </div>
            </div>
            <DashboardNav isStudent={true} />
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-blue-800">
                {getGreeting()}, {user?.fullName || "Student"}!
              </h1>
              <p className="text-blue-600">Access and manage your academic resources.</p>
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
                <CardTitle className="text-sm font-medium text-amber-900">My Uploads</CardTitle>
                <Upload className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-800">{stats.totalUploads}</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-900">Approved</CardTitle>
                <BookOpen className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-800">{stats.approvedResources}</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-rose-50 to-rose-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-rose-900">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-rose-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-800">{stats.rejectedResources}</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-violet-50 to-violet-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-violet-900">Pending</CardTitle>
                <FileText className="h-4 w-4 text-violet-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-violet-800">{stats.pendingResources}</div>
              </CardContent>
            </Card>
          </div>
          <div className="my-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 bg-white rounded-lg p-2 shadow-sm">
                <Search className="h-4 w-4 text-blue-600" />
                <Input
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              <Link href="/upload">
                <Button className="bg-blue-600 hover:bg-blue-700 gap-1">
                  <Upload className="h-4 w-4" />
                  Upload Resource
                </Button>
              </Link>
            </div>
          </div>
          <Tabs defaultValue="my-resources" className="space-y-4">
            <TabsList className="bg-blue-100">
              <TabsTrigger value="my-resources" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">My Resources</TabsTrigger>
              <TabsTrigger value="approved" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Approved Resources</TabsTrigger>
            </TabsList>
            <TabsContent value="my-resources" className="space-y-4">
              {filteredMyResources.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md p-4">
                  <DataTable
                    data={filteredMyResources}
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
                      { header: "Department", accessorKey: "department" },
                      { header: "Supervisor", accessorKey: "supervisorName", cell: (info) => info.getValue() || "N/A" },
                      {
                        header: "Status",
                        accessorKey: "status",
                        cell: (info) => (
                          <Badge
                            className={
                              info.getValue() === "approved"
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : info.getValue() === "rejected"
                                  ? "bg-rose-100 text-rose-800 hover:bg-rose-200"
                                  : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                            }
                          >
                            {info.getValue()}
                          </Badge>
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
                            {info.row.original.status === "approved" && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDownload(info.row.original.id)}
                                className="border-slate-300 text-slate-700 hover:bg-slate-50"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            )}
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-lg shadow-sm">
                  <Upload className="h-12 w-12 text-amber-500 mb-4" />
                  <h3 className="text-lg font-medium text-amber-800">No resources uploaded yet</h3>
                  <p className="text-amber-600 mt-2">
                    Start by uploading your first resource using the "Upload Resource" button.
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="approved" className="space-y-4">
              {filteredApprovedResources.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md p-4">
                  <DataTable
                    data={filteredApprovedResources}
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
                      { header: "Department", accessorKey: "department" },
                      { header: "Uploaded By", accessorKey: "uploadedByName" },
                      {
                        header: "Upload Date",
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
                  <BookOpen className="h-12 w-12 text-emerald-500 mb-4" />
                  <h3 className="text-lg font-medium text-emerald-800">No approved resources found</h3>
                  <p className="text-emerald-600 mt-2">
                    Try adjusting your search or check back later for new resources.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}