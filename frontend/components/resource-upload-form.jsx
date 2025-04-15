"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Upload, Loader2, AlertCircle, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const ResourceUploadForm = ({ user }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState([])
  const [supervisors, setSupervisors] = useState([])
  const [loadingSupervisors, setLoadingSupervisors] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    department: user?.department || "",
    supervisorId: "",
    year: new Date().getFullYear().toString(),
    semester: "",
    course: "",
    tags: "",
  })

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users/departments/all", {
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          setDepartments(data.departments || [])
        } else {
          // Fallback departments if API fails
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
        // Fallback departments on error
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
    }

    fetchDepartments()
  }, [])

  // Fetch supervisors when department changes
  useEffect(() => {
    const fetchSupervisors = async () => {
      if (!formData.department) return

      setLoadingSupervisors(true)
      setSupervisors([]) // Clear previous supervisors

      try {
        // Fetch supervisors from the API
        const response = await fetch(`http://localhost:5000/api/users/role/supervisor`, {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()

          if (data.users && Array.isArray(data.users)) {
            // Filter supervisors by department if needed
            const filteredSupervisors = formData.department
              ? data.users.filter((user) => user.department === formData.department)
              : data.users

            setSupervisors(
              filteredSupervisors.map((user) => ({
                id: user.id,
                fullName: user.fullName,
              })),
            )

            if (filteredSupervisors.length === 0) {
              toast.info(`No supervisors found for ${formData.department}.`)
            }
          } else {
            toast.error("Invalid supervisor data format received from server.")
            setSupervisors([])
          }
        } else {
          toast.error("Failed to fetch supervisors. Please try again.")
          setSupervisors([])
        }
      } catch (error) {
        console.error("Error fetching supervisors:", error)
        toast.error("Error loading supervisors. Please try again later.")
        setSupervisors([])
      } finally {
        setLoadingSupervisors(false)
      }
    }

    if (formData.department) {
      fetchSupervisors()
    }
  }, [formData.department])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit")
        return
      }

      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedFile) {
      toast.error("Please select a file to upload")
      return
    }

    // Validate required fields
    if (!formData.title || !formData.description || !formData.type || !formData.department) {
      toast.error("Please fill in all required fields")
      return
    }

    // For final year projects, supervisor is required
    if (formData.type === "final-project" && !formData.supervisorId && user.role === "student") {
      toast.error("Please select a supervisor for your final year project")
      return
    }

    setLoading(true)

    try {
      const formDataToSend = new FormData()

      // Append form fields
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key])
        }
      })

      // Append file
      formDataToSend.append("file", selectedFile)

      const response = await fetch("http://localhost:5000/api/resources", {
        method: "POST",
        credentials: "include",
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to upload resource")
      }

      const data = await response.json()

      toast.success("Resource uploaded successfully")

      // Redirect based on user role
      if (user.role === "admin") {
        router.push("/dashboard/admin")
      } else if (user.role === "supervisor") {
        router.push("/dashboard/supervisor")
      } else {
        router.push("/dashboard/student")
      }
    } catch (error) {
      console.error("Error uploading resource:", error)
      toast.error(error.message || "Failed to upload resource")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle>Upload Academic Resource</CardTitle>
        <CardDescription>
          Share your academic work with the CUG community. All uploads will be reviewed before being published.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter resource title"
                  required
                />
                <p className="text-xs text-muted-foreground">Provide a clear, descriptive title for your resource</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">
                  Resource Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select resource type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="past-exam">Past Exam</SelectItem>
                    <SelectItem value="mini-project">Mini Project</SelectItem>
                    <SelectItem value="final-project">Final Year Project</SelectItem>
                    <SelectItem value="thesis">Thesis</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Choose the category that best describes your resource</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter resource description"
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              Provide a detailed description of your resource (minimum 20 characters)
            </p>
          </div>

          {/* Department and Supervisor Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Department & Supervision</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="department">
                  Department <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleSelectChange("department", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Select the department this resource belongs to</p>
              </div>

              {formData.type === "final-project" && user.role === "student" && (
                <div className="space-y-2">
                  <Label htmlFor="supervisorId">
                    Supervisor <span className="text-red-500">*</span>
                    {loadingSupervisors && <span className="ml-2 inline-block animate-spin">⟳</span>}
                  </Label>
                  <Select
                    value={formData.supervisorId}
                    onValueChange={(value) => handleSelectChange("supervisorId", value)}
                    required
                    disabled={loadingSupervisors}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={loadingSupervisors ? "Loading supervisors..." : "Select supervisor"} />
                    </SelectTrigger>
                    <SelectContent>
                      {supervisors.length > 0 ? (
                        supervisors.map((supervisor) => (
                          <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                            {supervisor.fullName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-supervisors" disabled>
                          No supervisors available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Select your project supervisor</p>

                  {supervisors.length === 0 && !loadingSupervisors && formData.department && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No supervisors found for {formData.department}. Please contact administration or select a
                        different department.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Additional Details Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  placeholder="e.g., 2024"
                />
                <p className="text-xs text-muted-foreground">Year of creation/publication</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select value={formData.semester} onValueChange={(value) => handleSelectChange("semester", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="First">First</SelectItem>
                    <SelectItem value="Second">Second</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Applicable semester (if relevant)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Input
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  placeholder="e.g., Computer Science 101"
                />
                <p className="text-xs text-muted-foreground">Related course (if applicable)</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="e.g., programming, database, research"
            />
            <p className="text-xs text-muted-foreground">Add relevant tags to help others find your resource</p>
          </div>

          {/* File Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="file">
              File Upload <span className="text-red-500">*</span>
            </Label>
            <div
              className={`border-2 border-dashed rounded-md p-8 text-center transition-colors ${selectedFile ? "bg-muted/50 border-primary/50" : "hover:border-primary/50"}`}
            >
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                required
              />
              <Label htmlFor="file" className="cursor-pointer flex flex-col items-center gap-3">
                {selectedFile ? (
                  <>
                    <FileText className="h-10 w-10 text-primary" />
                    <span className="text-base font-medium">{selectedFile.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    <Button type="button" variant="outline" size="sm" onClick={() => setSelectedFile(null)}>
                      Change file
                    </Button>
                  </>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <span className="text-base font-medium">Click to upload or drag and drop</span>
                    <span className="text-sm text-muted-foreground">PDF, DOC, DOCX, PPT, PPTX, ZIP (Max 10MB)</span>
                  </>
                )}
              </Label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>Upload Resource</>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default ResourceUploadForm
