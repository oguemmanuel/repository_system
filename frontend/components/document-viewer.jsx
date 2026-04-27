"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Download, FileText, File, Loader2, ExternalLink } from "lucide-react"

export default function DocumentViewer({ resourceId }) {
  const [loading, setLoading] = useState(true)
  const [resource, setResource] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!resourceId) return

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

        // Get resource details
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

        if (!response.ok) {
          const errorMessage = `Server returned ${response.status} ${response.statusText}`
          throw new Error(errorMessage)
        }

        const data = await response.json()
        setResource(data.resource)
      } catch (error) {
        console.error("Error fetching resource details:", error)
        setError(`Failed to load resource details: ${error.message}`)
        toast.error(`Failed to load resource details: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchResourceDetails()
  }, [resourceId])

  const handlePreview = () => {
    // Open the preview URL in a new tab
    window.open(`http://localhost:5000/api/resources/${resourceId}/preview`, "_blank")
  }

  const handleDownload = () => {
    // Open the download URL in a new tab
    window.open(`http://localhost:5000/api/resources/${resourceId}/download`, "_blank")
  }

  const getFileTypeDisplay = (fileType) => {
    if (!fileType) return "Unknown"
    if (fileType.includes("pdf")) return "PDF Document"
    if (fileType.includes("word") || fileType.includes("doc")) return "Word Document"
    if (fileType.includes("presentation") || fileType.includes("ppt")) return "PowerPoint Presentation"
    if (fileType.includes("zip") || fileType.includes("compressed")) return "Compressed Archive"
    return "Document"
  }

  const getFileIcon = (fileType) => {
    if (!fileType) return <File className="h-8 w-8" />
    if (fileType.includes("pdf")) return <FileText className="h-8 w-8 text-red-500" />
    if (fileType.includes("word") || fileType.includes("doc")) return <FileText className="h-8 w-8 text-blue-500" />
    if (fileType.includes("presentation") || fileType.includes("ppt"))
      return <FileText className="h-8 w-8 text-orange-500" />
    if (fileType.includes("zip") || fileType.includes("compressed")) return <File className="h-8 w-8 text-purple-500" />
    return <File className="h-8 w-8" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Preview Unavailable</h3>
            <p className="text-muted-foreground mt-2 mb-4">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!resource) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Resource Not Found</h3>
            <p className="text-muted-foreground mt-2">The requested resource could not be found.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center text-center">
          {getFileIcon(resource.fileType)}
          <h3 className="text-lg font-medium mt-4">{getFileTypeDisplay(resource.fileType)}</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            {resource.title} ({Math.round((resource.fileSize || 0) / 1024)} KB)
          </p>

          <div className="flex gap-4">
            <Button onClick={handlePreview} className="flex items-center">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Browser
            </Button>
            <Button variant="outline" onClick={handleDownload} className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
