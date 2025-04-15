"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { BookOpen, Search, Upload } from "lucide-react"
import DashboardNav from "@/components/dashboard-nav"
import DashboardHeader from "@/components/dashboard-header"
import DataTable from "@/components/data-table"

export default function StudentResources() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [myResources, setMyResources] = useState([])
  const [approvedResources, setApprovedResources] = useState([])

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
        fetchResources()
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  const fetchResources = async () => {
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

      if (myResourcesResponse.ok) {
        const myResourcesData = await myResourcesResponse.json()
        setMyResources(myResourcesData.resources || [])
      }

      if (approvedResourcesResponse.ok) {
        const approvedResourcesData = await approvedResourcesResponse.json()
        setApprovedResources(approvedResourcesData.resources || [])
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
          <DashboardNav isStudent={true} />
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
              <p className="text-muted-foreground">Manage and explore academic resources</p>
            </div>
            <Link href="/upload">
              <Button className="gap-1">
                <Upload className="h-4 w-4" />
                Upload Resource
              </Button>
            </Link>
          </div>
          <div className="my-6">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
          </div>
          <Tabs defaultValue="my-resources" className="space-y-4">
            <TabsList>
              <TabsTrigger value="my-resources">My Resources</TabsTrigger>
              <TabsTrigger value="approved">Approved Resources</TabsTrigger>
            </TabsList>
            <TabsContent value="my-resources" className="space-y-4">
              {filteredMyResources.length > 0 ? (
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
                          variant={
                            info.getValue() === "approved"
                              ? "success"
                              : info.getValue() === "rejected"
                                ? "destructive"
                                : "outline"
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
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                          {info.row.original.status === "approved" && (
                            <Link href={`/resources/${info.row.original.id}/download`}>
                              <Button variant="outline" size="sm">
                                Download
                              </Button>
                            </Link>
                          )}
                        </div>
                      ),
                    },
                  ]}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No resources uploaded yet</h3>
                  <p className="text-muted-foreground mt-2">
                    Start by uploading your first resource using the "Upload Resource" button.
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="approved" className="space-y-4">
              {filteredApprovedResources.length > 0 ? (
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
                      header: "Actions",
                      cell: (info) => (
                        <div className="flex gap-2">
                          <Link href={`/resources/${info.row.original.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                          <Link href={`/resources/${info.row.original.id}/download`}>
                            <Button variant="outline" size="sm">
                              Download
                            </Button>
                          </Link>
                        </div>
                      ),
                    },
                  ]}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No approved resources found</h3>
                  <p className="text-muted-foreground mt-2">
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
