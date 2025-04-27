// ResourceDetailPage.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const ResourceDetailPage = ({ params }) => {
  const { resourceId } = params
  const [resource, setResource] = useState(null)
  const { data: session, status } = useSession()
  const user = session?.user
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [approvalReason, setApprovalReason] = useState("")

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/resources/${resourceId}`, {
          credentials: "include",
        })
        if (!response.ok) {
          throw new Error("Failed to fetch resource")
        }
        const data = await response.json()
        setResource(data)
      } catch (error) {
        console.error("Error fetching resource:", error)
        toast.error("Failed to fetch resource. Please try again.")
      }
    }

    fetchResource()
  }, [resourceId])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  const handleApprove = async (resourceId, approvalReason) => {
    try {
      const response = await fetch(`http://localhost:5000/api/resources/${resourceId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: "approved",
          approvalReason: approvalReason 
        }),
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

  const handleReject = async (resourceId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/resources/${resourceId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "rejected" }),
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

  if (!resource) {
    return <div>Loading resource details...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{resource.title}</h1>
      <p className="mb-2">
        <strong>Description:</strong> {resource.description}
      </p>
      <p className="mb-2">
        <strong>URL:</strong>{" "}
        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
          {resource.url}
        </a>
      </p>
      <p className="mb-2">
        <strong>Category:</strong> {resource.category}
      </p>
      <p className="mb-2">
        <strong>Status:</strong> {resource.status}
      </p>
      {resource.status === "pending" && user?.role === "supervisor" && (
        <div className="flex gap-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Approve</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Approve Resource</DialogTitle>
                <DialogDescription>
                  Please provide a reason for approving this resource.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reason" className="text-right">
                    Reason
                  </Label>
                  <Input id="reason" value={approvalReason} onChange={(e) => setApprovalReason(e.target.value)} className="col-span-3" />
                </div>
              </div>
              <Button onClick={() => {
                handleApprove(resourceId, approvalReason)
                setOpen(false)
              }}>Approve</Button>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" onClick={() => handleReject(resourceId)}>
            Reject
          </Button>
        </div>
      )}
    </div>
  )
}

export default ResourceDetailPage
