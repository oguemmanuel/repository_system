"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Search, FileText, Download, Eye } from "lucide-react"
import DashboardNav from "@/components/dashboard-nav"
import DashboardHeader from "@/components/dashboard-header"
import DataTable from "@/components/data-table"

export default function RejectedResourcesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [rejectedResources, setRejectedResources] = useState([])
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
      // Fetch rejected resources
      const rejectedResponse = await fetch(
        `http://localhost:5000/api/resources?status=rejected&supervisorId=${supervisorId}`,
        {
          credentials: "include",
        },
      )

      if (rejectedResponse.ok) {
        const rejectedData = await rejectedResponse.json()
        setRejectedResources(rejectedData.resources || [])
      } else {
        toast.error("Failed to fetch rejected resources")
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

  const filteredRejectedResources = rejectedResources.filter(
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
              <h1 className="text-3xl font-bold tracking-tight">Rejected Resources</h1>
              <p className="text-muted-foreground">View resources you have rejected.</p>
            </div>
          </div>

          <div className="my-6">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rejected resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
          </div>

          {filteredRejectedResources.length > 0 ? (
            <DataTable
              data={filteredRejectedResources}
              columns={[
                { header: "Title", accessorKey: "title" },
                {
                  header: "Type",
                  accessorKey: "type",
                  cell: (info) => getResourceTypeName(info.getValue()),
                },
                { header: "Department", accessorKey: "department" },
                {
                  header: "Student",
                  accessorKey: "studentName",
                  cell: (info) => info.getValue() || "N/A",
                },
                {
                  header: "Rejection Date",
                  accessorKey: "updatedAt",
                  cell: (info) => new Date(info.getValue()).toLocaleDateString(),
                },
                {
                  header: "Rejection Reason",
                  accessorKey: "rejectionReason",
                  cell: (info) => (
                    <div className="max-w-xs truncate" title={info.getValue()}>
                      {info.getValue() || "No reason provided"}
                    </div>
                  ),
                },
                {
                  header: "Actions",
                  cell: (info) => (
                    <div className="flex gap-2">
                      <Link href={`/resources/${info.row.original.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(info.row.original.id)}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No rejected resources</h3>
              <p className="text-muted-foreground mt-2">You haven't rejected any resources yet.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
