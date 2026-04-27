"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { BookOpen, Loader2, Shield, EyeOff, Eye } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [loginSuccess, setLoginSuccess] = useState(false)

  useEffect(() => {
    if (loginSuccess) {
      const timer = setTimeout(() => {
        // Redirect to home page instead of role-based dashboard
        router.push("/")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [loginSuccess, router])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.email) errors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Please enter a valid email"

    if (!formData.password) errors.password = "Password is required"
    else if (formData.password.length < 8) errors.password = "Password must be at least 8 characters"

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      toast.error("Please correct the errors below")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Authentication failed")
      }

      const data = await response.json()

      // Store user data in localStorage if remember me is checked
      if (formData.rememberMe) {
        localStorage.setItem("user", JSON.stringify(data.user))
      } else {
        sessionStorage.setItem("user", JSON.stringify(data.user))
      }

      setLoginSuccess(true)
      toast.success("Authentication successful! Redirecting...")

      // Redirect to home page instead of role-based dashboard
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (error) {
      console.error("Authentication error:", error)
      const errorMessage = error.message || "Login failed. Please verify your credentials and try again."

      // Handle specific password errors
      if (error.message.toLowerCase().includes("password")) {
        setFormErrors((prev) => ({ ...prev, password: errorMessage }))
      } else if (error.message.toLowerCase().includes("email")) {
        setFormErrors((prev) => ({ ...prev, email: errorMessage }))
      }

      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loginSuccess) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full flex flex-col justify-center items-center p-6">
          <div className="w-full max-w-md">
            <div className="flex items-center justify-center gap-2 mb-8">
              <BookOpen className="h-8 w-8 text-[#00447c]" />
              <span className="text-2xl font-bold text-[#00447c]">CUG Repository</span>
            </div>

            <Card className="border-none shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-semibold text-gray-800">Login Successful</CardTitle>
                <CardDescription className="text-gray-600">You're being redirected to the home page</CardDescription>
              </CardHeader>
              <CardContent className="p-6 text-center">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  Authentication successful. Please wait while we redirect you.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left panel - Branding and information */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-[#00447c] text-white p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="h-10 w-10" />
            <span className="text-3xl font-bold tracking-tight">CUG Repository</span>
          </div>

          <h2 className="text-2xl font-semibold mb-6">Secure Access to Your Enterprise Resources</h2>

          <p className="mb-8 text-gray-200">
            Access your organization's knowledge base, research materials, and resources through our secure enterprise
            platform.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-blue-300 mt-1" />
              <div>
                <h3 className="font-medium">Enterprise-Grade Security</h3>
                <p className="text-sm text-gray-300">Advanced encryption and security protocols to protect your data</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg
                className="h-6 w-6 text-blue-300 mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <div>
                <h3 className="font-medium">Centralized Knowledge</h3>
                <p className="text-sm text-gray-300">Access all your institution's resources in one place</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg
                className="h-6 w-6 text-blue-300 mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <div>
                <h3 className="font-medium">Role-Based Access</h3>
                <p className="text-sm text-gray-300">Personalized experience based on your role and permissions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <BookOpen className="h-8 w-8 text-[#00447c]" />
            <span className="text-2xl font-bold text-[#00447c]">CUG Repository</span>
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-semibold text-gray-800">Welcome back</CardTitle>
              <CardDescription className="text-gray-600">Please enter your credentials to continue</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="your.email@organization.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`h-11 ${formErrors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                    required
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-[#00447c] hover:text-[#003366] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`h-11 pr-10 ${formErrors.password ? "border-red-500 focus:ring-red-500" : ""}`}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={togglePasswordVisibility}
                      tabIndex="-1"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, rememberMe: checked === true }))}
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me for 30 days
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-white cursor-pointer bg-[#00447c] hover:bg-[#003366] transition-colors"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </CardContent>

              <CardFooter className="flex flex-col items-center pt-0 pb-6">
                <p className="text-center flex flex-col gap-4 text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/register" className="font-medium text-[#00447c] hover:text-[#003366] hover:underline">
                    Request access
                  </Link>
                  <Link href="/" className="font-medium text-[#00447c] hover:text-[#003366] hover:underline">
                    Go back home
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>

          <div className="mt-8 text-center text-xs text-gray-500">
            <p>© 2025 CUG Repository. All rights reserved.</p>
            <div className="mt-2 flex justify-center space-x-4">
              <Link href="/privacy" className="hover:text-gray-700 hover:underline">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gray-700 hover:underline">
                Terms of Service
              </Link>
              <Link href="/help" className="hover:text-gray-700 hover:underline">
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
