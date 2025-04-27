"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import DashboardHeader from "@/components/dashboard-header"
import DashboardNav from "@/components/dashboard-nav"
import ResourcePreview from "@/components/resource-preview"

export default function ResourceDetailPage({ params }) {
  const router = useRouter()
  const unwrappedParams = React.use(params)
  const resourceId = unwrappedParams.id
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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
        setUser(data.user)
        setLoading(false)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  const handleApprove = async (resourceId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/resources/${resourceId}/status`, {
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

      // Redirect back to pending approvals page
      if (user?.role === "supervisor") {
        router.push("/dashboard/supervisor/pending")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error approving resource:", error)
      toast.error(error.message || "Failed to approve resource. Please try again.")
      return false
    }
    return true
  }

  const handleReject = async (resourceId, rejectionReason) => {
    try {
      const response = await fetch(`http://localhost:5000/api/resources/${resourceId}/status`, {
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

      // Redirect back to pending approvals page
      if (user?.role === "supervisor") {
        router.push("/dashboard/supervisor/pending")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error rejecting resource:", error)
      toast.error(error.message || "Failed to reject resource. Please try again.")
      return false
    }
    return true
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
          <DashboardNav isSupervisor={user?.role === "supervisor"} />
        </aside>
        <main className="flex w-full flex-col overflow-hidden py-6">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Resource Details</h1>
          <ResourcePreview resourceId={resourceId} onApprove={handleApprove} onReject={handleReject} />
        </main>
      </div>
    </div>
  )
}
