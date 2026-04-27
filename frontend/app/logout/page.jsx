"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { BookOpen, Loader2 } from "lucide-react"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call the logout API endpoint
        const response = await fetch("http://localhost:5000/api/auth/logout", {
          method: "GET",
          credentials: "include",
        })

        if (response.ok) {
          // Clear user data from localStorage
          localStorage.removeItem("user")

          // Show success message
          toast.success("Logged out successfully")
        } else {
          throw new Error("Logout failed")
        }
      } catch (error) {
        console.error("Logout error:", error)
        toast.error("Logout failed. Please try again.")
      } finally {
        // Redirect to login page regardless of success or failure
        router.push("/login")
      }
    }

    performLogout()
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="mb-8 flex items-center gap-2">
        <BookOpen className="h-10 w-10 text-blue-800" />
        <span className="text-3xl font-bold text-blue-800">CUG Repository</span>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-md border border-blue-100 flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-blue-700 animate-spin" />
        <p className="mt-4 text-lg font-medium text-gray-800">Logging out...</p>
        <p className="text-sm text-gray-500 mt-2">You will be redirected to the login page shortly.</p>
      </div>
    </div>
  )
}