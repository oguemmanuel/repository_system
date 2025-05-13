"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ResourceUploadForm from "@/components/resource-upload-form"
import DashboardHeader from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload, FileUp, FileText, Lightbulb, BookmarkPlus } from "lucide-react"

export default function UploadPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedResourceType, setSelectedResourceType] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get user from localStorage first
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
          setLoading(false)
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
        setUser(data.user)
        setLoading(false)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  // Get available resource types based on user role
  const getResourceTypes = () => {
    if (user?.role === "admin" || user?.role === "supervisor") {
      return [
        {
          id: "past-exam",
          title: "Past Exam Paper",
          description: "Upload previous examination papers for reference",
          icon: <FileText className="h-6 w-6" />,
          color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
          borderColor: "border-blue-200 dark:border-blue-800",
        },
        {
          id: "mini-project",
          title: "Mini Project",
          description: "Share your course mini-projects and assignments",
          icon: <Lightbulb className="h-6 w-6" />,
          color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
          borderColor: "border-purple-200 dark:border-purple-800",
        },
        {
          id: "final-project",
          title: "Final Year Project",
          description: "Upload your capstone or final year project work",
          icon: <BookmarkPlus className="h-6 w-6" />,
          color: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
          borderColor: "border-orange-200 dark:border-orange-800",
        },
      ]
    } else {
      // For students, only mini-project and final-project are available
      return [
        {
          id: "mini-project",
          title: "Mini Project",
          description: "Share your course mini-projects and assignments",
          icon: <Lightbulb className="h-6 w-6" />,
          color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
          borderColor: "border-purple-200 dark:border-purple-800",
        },
        {
          id: "final-project",
          title: "Final Year Project",
          description: "Upload your capstone or final year project work",
          icon: <BookmarkPlus className="h-6 w-6" />,
          color: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
          borderColor: "border-orange-200 dark:border-orange-800",
        },
      ]
    }
  }

  const handleResourceTypeSelect = (typeId) => {
    setSelectedResourceType(typeId)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-tr from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <DashboardHeader />
        <div className="container flex-1 items-center justify-center flex">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  // Get resource types based on user role
  const resourceTypes = getResourceTypes()

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-tr from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link href="/dashboard/student">
              <Button
                variant="ghost"
                className="gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 pl-0"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Resources
              </Button>
            </Link>
          </div>

          {/* Hero Section */}
          <div className="relative mb-10 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-xl overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <svg className="h-full w-full" viewBox="0 0 800 800">
                <path d="M0,0 L800,0 L800,800 L0,800 Z" fill="none" stroke="white" strokeWidth="10"></path>
                <circle cx="400" cy="400" r="200" fill="none" stroke="white" strokeWidth="10"></circle>
                <path d="M150,0 L650,800" stroke="white" strokeWidth="10"></path>
                <path d="M650,0 L150,800" stroke="white" strokeWidth="10"></path>
              </svg>
            </div>

            <div className="relative z-10 p-8 md:p-12">
              <div className="flex items-center gap-4 mb-4 text-white">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Upload className="h-6 w-6" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white cursor-pointer">Upload Resource</h1>
              </div>
              <p className="mt-2 text-blue-100 max-w-2xl">
                Share your academic work with the community. Your contributions help fellow students learn and grow.
              </p>
            </div>
          </div>

          {/* Resource Type Selection Cards */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-6">Select Resource Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resourceTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleResourceTypeSelect(type.id)}
                  className={`p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md border-2 transition-all hover:shadow-lg flex flex-col items-center text-center ${
                    selectedResourceType === type.id
                      ? `ring-2 ring-blue-500 dark:ring-blue-400 ${type.borderColor}`
                      : "border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                  }`}
                >
                  <div className={`p-4 rounded-xl mb-4 ${type.color}`}>{type.icon}</div>
                  <h3 className="font-semibold mb-2">{type.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Resource Details</h2>
              <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 py-1 px-3 rounded-full text-sm font-medium flex items-center gap-1">
                <FileUp className="h-4 w-4" />
                {selectedResourceType
                  ? resourceTypes.find((t) => t.id === selectedResourceType)?.title
                  : "No type selected"}
              </div>
            </div>

            <ResourceUploadForm user={user} selectedType={selectedResourceType} className="space-y-6" />

            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <span className="font-semibold">Note:</span> Uploaded resources will be reviewed by supervisors before
                being approved for wider access.
              </p>
            </div>
          </div>

          {/* Upload Guidelines */}
          <div className="mt-10 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-lg mb-4">Upload Guidelines</h3>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <div className="min-w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold mt-0.5">
                  1
                </div>
                <span>Resources should be original work or properly cited if using references.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="min-w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold mt-0.5">
                  2
                </div>
                <span>Supported file formats include PDF, DOCX, PPTX, and ZIP (for code projects).</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="min-w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold mt-0.5">
                  3
                </div>
                <span>Maximum file size is 50MB per upload.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="min-w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold mt-0.5">
                  4
                </div>
                <span>All uploads will be reviewed by faculty before becoming visible to other students.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
