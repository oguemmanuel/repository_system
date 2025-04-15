"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00447c]"></div>
      <p className="mt-4 text-lg">Logging out...</p>
    </div>
  )
}
