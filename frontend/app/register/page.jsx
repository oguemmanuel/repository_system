"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  Loader2,
  User,
  Mail,
  Lock,
  Phone,
  BookmarkIcon,
  School,
  BadgeCheck,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [departments, setDepartments] = useState([])
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    indexNumber: "",
    staffID: "",
    phoneNumber: "",
    department: "",
    role: "student", // Default to student role
  })
  const [loading, setLoading] = useState(false)
  const [loadingDepartments, setLoadingDepartments] = useState(true)
  const [formErrors, setFormErrors] = useState({})
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true)
      try {
        const response = await fetch("http://localhost:5000/api/users/departments/all")
        if (response.ok) {
          const data = await response.json()
          if (data.departments && data.departments.length > 0) {
            setDepartments(data.departments)
          } else {
            setDepartments([
              "Computer Science",
              "Information Technology",
              "Business Administration",
              "Economics",
              "Mathematics",
              "Engineering",
              "Religious Studies",
              "Education",
            ])
          }
        } else {
          setDepartments([
            "Computer Science",
            "Information Technology",
            "Business Administration",
            "Economics",
            "Mathematics",
            "Engineering",
            "Religious Studies",
            "Education",
          ])
        }
      } catch (error) {
        console.error("Error fetching departments:", error)
        setDepartments([
          "Computer Science",
          "Information Technology",
          "Business Administration",
          "Economics",
          "Mathematics",
          "Engineering",
          "Religious Studies",
          "Education",
        ])
      } finally {
        setLoadingDepartments(false)
      }
    }

    fetchDepartments()
  }, [])

  // Countdown timer for redirection after successful registration
  useEffect(() => {
    let timer
    if (registrationSuccess && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
    } else if (registrationSuccess && countdown === 0) {
      router.push("/login")
    }
    return () => clearTimeout(timer)
  }, [registrationSuccess, countdown, router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user makes a selection
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.username) errors.username = "Username is required"
    if (!formData.email) errors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Please enter a valid email"

    if (!formData.password) errors.password = "Password is required"
    else if (formData.password.length < 8) errors.password = "Password must be at least 8 characters"

    if (!formData.fullName) errors.fullName = "Full name is required"
    if (formData.role === "student" && !formData.indexNumber)
      errors.indexNumber = "Index number is required for students"
    if (formData.role === "supervisor" && !formData.staffID) errors.staffID = "Staff ID is required for supervisors"
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match"
    if (!formData.department) errors.department = "Please select your department"

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
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          name: formData.fullName, // Added for compatibility with the email service
          indexNumber: formData.role === "student" ? formData.indexNumber : null,
          staffID: formData.role === "supervisor" ? formData.staffID : null,
          phoneNumber: formData.phoneNumber,
          department: formData.department,
          role: formData.role,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Registration failed")
      }

      setRegistrationSuccess(true)
      toast.success("Registration successful! Check your email for confirmation.")
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (registrationSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white py-8">
        <div className="mb-6 flex items-center gap-2">
          <BookOpen className="h-10 w-10 text-blue-800" />
          <span className="text-3xl font-bold text-blue-800">CUG Repository</span>
        </div>

        <Card className="w-full max-w-lg border-blue-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">Registration Successful!</CardTitle>
            <CardDescription className="text-blue-100">
              You'll be redirected to the login page in {countdown} seconds.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertTitle className="text-blue-800 font-semibold">Welcome to CUG Repository!</AlertTitle>
                <AlertDescription className="text-blue-700">
                  <p>Your account has been created successfully.</p>
                  <p className="mt-2">
                    We've sent a welcome email to <strong>{formData.email}</strong> with more information.
                  </p>
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => router.push("/login")}
                className="mt-4 w-full bg-blue-700 hover:bg-blue-800 text-white py-4 font-medium"
              >
                Go to Login Page Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="mb-6 flex items-center gap-2">
        <BookOpen className="h-10 w-10 text-blue-800" />
        <span className="text-3xl font-bold text-blue-800">CUG Repository</span>
      </div>

      <Card className="w-full max-w-lg border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription className="text-blue-100">Join the CUG Repository community</CardDescription>
        </CardHeader>

        <Tabs defaultValue="student" className="w-full" onValueChange={(value) => handleSelectChange("role", value)}>
          <div className="px-6 pt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <School className="mr-2 h-4 w-4" />
                Student
              </TabsTrigger>
              <TabsTrigger
                value="supervisor"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <BadgeCheck className="mr-2 h-4 w-4" />
                Supervisor
              </TabsTrigger>
            </TabsList>
          </div>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Full Name *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={`pl-10 ${formErrors.fullName ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                </div>
                {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
              </div>

              <TabsContent value="student" className="mt-0 space-y-2">
                <Label htmlFor="indexNumber" className="text-sm font-medium">
                  Index Number *
                </Label>
                <div className="relative">
                  <BookmarkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="indexNumber"
                    name="indexNumber"
                    value={formData.indexNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., CUG/001/19"
                    className={`pl-10 ${formErrors.indexNumber ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                </div>
                {formErrors.indexNumber && <p className="text-red-500 text-xs mt-1">{formErrors.indexNumber}</p>}
              </TabsContent>

              <TabsContent value="supervisor" className="mt-0 space-y-2">
                <Label htmlFor="staffID" className="text-sm font-medium">
                  Staff ID *
                </Label>
                <div className="relative">
                  <BadgeCheck className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="staffID"
                    name="staffID"
                    value={formData.staffID}
                    onChange={handleInputChange}
                    placeholder="e.g., CUG/STAFF/001"
                    className={`pl-10 ${formErrors.staffID ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                </div>
                {formErrors.staffID && <p className="text-red-500 text-xs mt-1">{formErrors.staffID}</p>}
              </TabsContent>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium">
                  Department *
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleSelectChange("department", value)}
                  disabled={loadingDepartments}
                >
                  <SelectTrigger className={`${formErrors.department ? "border-red-500 focus:ring-red-500" : ""}`}>
                    <SelectValue placeholder={loadingDepartments ? "Loading departments..." : "Select department"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {departments.map((department) => (
                      <SelectItem key={department} value={department} className="hover:bg-blue-50 focus:bg-blue-50">
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.department && <p className="text-red-500 text-xs mt-1">{formErrors.department}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="johndoe"
                    className={`pl-10 ${formErrors.username ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                </div>
                {formErrors.username && <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john.doe@example.com"
                    className={`pl-10 ${formErrors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                </div>
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className={`pl-10 ${formErrors.password ? "border-red-500 focus:ring-red-500" : ""}`}
                    />
                  </div>
                  {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className={`pl-10 ${formErrors.confirmPassword ? "border-red-500 focus:ring-red-500" : ""}`}
                    />
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+233 XX XXX XXXX"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pb-6">
              <Button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800 text-white py-6 font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating your account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-700 font-medium hover:underline">
                  Login instead
                </Link>
              </div>

              <div className="text-center text-xs text-gray-500 mt-2">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-blue-700 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-700 hover:underline">
                  Privacy Policy
                </Link>
              </div>
            </CardFooter>
          </form>
        </Tabs>
      </Card>
    </div>
  )
}
