"use client"

import Link from "next/link"
import { CardFooter } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { BookOpen, Loader2 } from "lucide-react"

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
            // If no departments are returned, add some default ones
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
          // If API fails, set default departments
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
        // Set default departments on error
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormErrors({})

    // Validate form
    const errors = {}
    if (!formData.username) errors.username = "Username is required"
    if (!formData.email) errors.email = "Email is required"
    if (!formData.password) errors.password = "Password is required"
    if (!formData.fullName) errors.fullName = "Full name is required"
    if (formData.role === "student" && !formData.indexNumber)
      errors.indexNumber = "Index number is required for students"
    if (formData.role === "supervisor" && !formData.staffID) errors.staffID = "Staff ID is required for supervisors"
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match"

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

      toast.success("Registration successful! Please log in.")
      router.push("/login")
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f5] py-8">
      <div className="mb-8 flex items-center gap-2">
        <BookOpen className="h-8 w-8 text-[#00447c]" />
        <span className="text-2xl font-bold text-[#00447c]">CUG Repository</span>
      </div>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Create a new account to access the repository</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                />
                {formErrors.fullName && <p className="text-red-500 text-sm">{formErrors.fullName}</p>}
              </div>
              {formData.role === "student" ? (
                <div className="space-y-2">
                  <Label htmlFor="indexNumber">Index Number *</Label>
                  <Input
                    id="indexNumber"
                    name="indexNumber"
                    value={formData.indexNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., CUG/001/19"
                    required
                  />
                  {formErrors.indexNumber && <p className="text-red-500 text-sm">{formErrors.indexNumber}</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="staffID">Staff ID *</Label>
                  <Input
                    id="staffID"
                    name="staffID"
                    value={formData.staffID}
                    onChange={handleInputChange}
                    placeholder="e.g., 12345"
                    required
                  />
                  {formErrors.staffID && <p className="text-red-500 text-sm">{formErrors.staffID}</p>}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleSelectChange("department", value)}
                disabled={loadingDepartments}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingDepartments ? "Loading departments..." : "Select department"} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="johndoe"
                  required
                />
                {formErrors.username && <p className="text-red-500 text-sm">{formErrors.username}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john.doe@example.com"
                  required
                />
                {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                />
                {formErrors.password && <p className="text-red-500 text-sm">{formErrors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                />
                {formErrors.confirmPassword && <p className="text-red-500 text-sm">{formErrors.confirmPassword}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+233 XX XXX XXXX"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-[#00447c] hover:bg-[#003366]" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-[#00447c] hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
