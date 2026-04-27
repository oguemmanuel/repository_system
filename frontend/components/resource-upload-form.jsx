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
import { Upload, Loader2, AlertCircle, FileText, Info, Calendar, Tag } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import SuccessDialog from "@/components/success-dialog"

const ResourceUploadForm = ({ user }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)
  const [supervisors, setSupervisors] = useState([])
  const [loadingSupervisors, setLoadingSupervisors] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [uploadedResource, setUploadedResource] = useState(null)
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

  // Determine available resource types based on user role
  const getAvailableResourceTypes = () => {
    if (user?.role === "admin" || user?.role === "supervisor") {
      return [
        { id: "past-exam", name: "Past Exam" },
        { id: "mini-project", name: "Mini Project" },
        { id: "final-project", name: "Final Year Project" },
      ]
    } else {
      // For students, only mini-project and final-project are available
      return [
        { id: "mini-project", name: "Mini Project" },
        { id: "final-project", name: "Final Year Project" },
      ]
    }
  }

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true)
      try {
        console.log("Fetching departments...")
        const response = await fetch("http://localhost:5000/api/users/departments/all", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("Department fetch response status:", response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("Department fetch response data:", data)

          if (data.success && Array.isArray(data.departments) && data.departments.length > 0) {
            console.log("Setting departments from API:", data.departments)
            setDepartments(data.departments)
            console.log("Departments state should now be:", data.departments)
          } else {
            console.warn("No departments returned from API or invalid format:", data)
            // Use fallback departments
            const fallbackDepartments = [
              "Computing and Information Sciences",
              "Economics and Business Administration",
              "Engineering",
              "Natural Sciences",
              "Social Sciences",
              "Arts and Humanities",
            ]
            console.log("Using fallback departments:", fallbackDepartments)
            setDepartments(fallbackDepartments)
          }
        } else {
          console.error("Failed to fetch departments, status:", response.status)
          const errorText = await response.text()
          console.error("Error response:", errorText)

          // Fallback departments if API fails
          setDepartments([
            "Computing and Information Sciences",
            "Economics and Business Administration",
            "Engineering",
            "Natural Sciences",
            "Social Sciences",
            "Arts and Humanities",
          ])
          toast.error("Could not load departments from server. Using default list.")
        }
      } catch (error) {
        console.error("Error fetching departments:", error)
        // Fallback departments on error
        setDepartments([
          "Computing and Information Sciences",
          "Economics and Business Administration",
          "Engineering",
          "Natural Sciences",
          "Social Sciences",
          "Arts and Humanities",
        ])
        toast.error("Error loading departments. Using default list.")
      } finally {
        setLoadingDepartments(false)
      }
    }

    fetchDepartments()
  }, [])

  // Fetch supervisors when department changes
  useEffect(() => {
    const fetchSupervisors = async () => {
      if (!formData.department) {
        setSupervisors([])
        return
      }

      setLoadingSupervisors(true)
      setSupervisors([]) // Clear previous supervisors

      try {
        console.log("Fetching supervisors for department:", formData.department)
        const response = await fetch(
          `http://localhost:5000/api/users/supervisors/available?department=${encodeURIComponent(formData.department)}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          },
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Supervisors fetch response:", data)

        // The backend returns { success: true, supervisors: [...] }
        if (data.success && Array.isArray(data.supervisors)) {
          setSupervisors(
            data.supervisors.map((supervisor) => ({
              id: supervisor.id,
              fullName: supervisor.fullName,
              department: supervisor.department,
            })),
          )

          if (data.supervisors.length === 0) {
            toast.info(`No supervisors found for ${formData.department}.`)
          }
        } else {
          throw new Error("Invalid data format received from server")
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

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false)

    // Redirect based on user role
    if (user.role === "admin") {
      router.push("/dashboard/admin")
    } else if (user.role === "supervisor") {
      router.push("/dashboard/supervisor")
    } else {
      router.push("/dashboard/student")
    }
  }

  const getResourceTypeName = (type) => {
    switch (type) {
      case "past-exam":
        return "Past Exam"
      case "mini-project":
        return "Mini Project"
      case "final-project":
        return "Final Year Project"
      default:
        return "Resource"
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

    // Validate resource type permissions
    if (formData.type === "past-exam" && user.role === "student") {
      toast.error("Students are not allowed to upload past exam papers")
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

      // Store the uploaded resource data
      setUploadedResource({
        id: data.resource.id,
        title: data.resource.title,
        type: data.resource.type,
      })

      // Show success dialog instead of immediate redirect
      setShowSuccessDialog(true)
    } catch (error) {
      console.error("Error uploading resource:", error)
      toast.error(error.message || "Failed to upload resource")
    } finally {
      setLoading(false)
    }
  }

  // Custom input styles for enhanced appearance
  const inputClasses =
    "shadow-sm border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-all duration-200 text-base rounded-lg px-4 py-3"
  const selectTriggerClasses =
    "shadow-sm border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-all duration-200 text-base rounded-lg px-4 py-3 h-auto"
  const textareaClasses =
    "shadow-sm border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-all duration-200 text-base rounded-lg px-4 py-3"
  const fieldGroupClasses =
    "bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-gray-100 dark:border-gray-700 shadow-md"
  const fieldLabelClasses = "font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-2.5"
  const sectionHeaderClasses =
    "text-lg font-semibold mb-4 text-blue-700 dark:text-blue-400 flex items-center gap-2 border-b-2 border-blue-100 dark:border-blue-900 pb-2"

  // Get available resource types based on user role
  const availableResourceTypes = getAvailableResourceTypes()

  return (
    <>
      <Card className="w-full mb-8 border-2 border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b-2 border-blue-100 dark:border-blue-900">
          <CardTitle className="text-2xl text-blue-800 dark:text-blue-300">Upload Academic Resource</CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-400">
            Share your academic work with the CUG community. All uploads will be reviewed before being published.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 p-6">
            {/* Basic Information Section */}
            <div className={fieldGroupClasses}>
              <h3 className={sectionHeaderClasses}>
                <Info className="h-5 w-5" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className={fieldLabelClasses}>
                    Title <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter resource title"
                      required
                      className={`${inputClasses} pl-4 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700`}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-1">
                    Provide a clear, descriptive title for your resource
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className={fieldLabelClasses}>
                    Resource Type <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)} required>
                    <SelectTrigger
                      className={`${selectTriggerClasses} border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700`}
                    >
                      <SelectValue placeholder="Select resource type" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-purple-200 dark:border-purple-800 rounded-lg shadow-lg">
                      {availableResourceTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id} className="py-2.5 text-base">
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-1">
                    Choose the category that best describes your resource
                  </p>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className={fieldGroupClasses}>
              <Label htmlFor="description" className={fieldLabelClasses}>
                Description <span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter resource description"
                rows={5}
                required
                className={`${textareaClasses} border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700`}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-1">
                Provide a detailed description of your resource (minimum 20 characters)
              </p>
            </div>

            {/* Department and Supervisor Section */}
            <div className={fieldGroupClasses}>
              <h3 className={sectionHeaderClasses}>
                <Info className="h-5 w-5" />
                Department & Supervision
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department Select */}
                <div className="space-y-2">
                  <Label htmlFor="department" className={fieldLabelClasses}>
                    Department <span className="text-red-500 ml-1">*</span>
                    {loadingDepartments && <Loader2 className="ml-2 h-4 w-4 inline-block animate-spin" />}
                  </Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => {
                      handleSelectChange("department", value)
                      // Clear supervisor when department changes
                      handleSelectChange("supervisorId", "")
                    }}
                    required
                    disabled={loadingDepartments}
                  >
                    <SelectTrigger
                      className={`${selectTriggerClasses} border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-700`}
                    >
                      {loadingDepartments ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading departments...
                        </span>
                      ) : (
                        <SelectValue placeholder="Select department" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="border-2 border-indigo-200 dark:border-indigo-800 rounded-lg shadow-lg">
                      {departments.length > 0 ? (
                        departments.map((department) => (
                          <SelectItem key={department} value={department} className="py-2.5 text-base">
                            {department}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-departments" disabled className="py-2.5 text-base">
                          No departments available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-1">
                    Select the department this resource belongs to
                  </p>

                  {/* Show warning if no departments found */}
                  {departments.length === 0 && !loadingDepartments && (
                    <Alert
                      variant="destructive"
                      className="mt-2 border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No departments found. Please contact administration or try refreshing the page.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Supervisor Select - Only shown for final projects by students */}
                {formData.type === "final-project" && user.role === "student" && (
                  <div className="space-y-2">
                    <Label htmlFor="supervisorId" className={fieldLabelClasses}>
                      Supervisor <span className="text-red-500 ml-1">*</span>
                      {loadingSupervisors && <Loader2 className="ml-2 h-4 w-4 inline-block animate-spin" />}
                    </Label>
                    <Select
                      value={formData.supervisorId}
                      onValueChange={(value) => handleSelectChange("supervisorId", value)}
                      required
                      disabled={loadingSupervisors || !formData.department || supervisors.length === 0}
                    >
                      <SelectTrigger
                        className={`${selectTriggerClasses} border-teal-200 dark:border-teal-800 hover:border-teal-300 dark:hover:border-teal-700`}
                      >
                        {loadingSupervisors ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading supervisors...
                          </span>
                        ) : (
                          <SelectValue
                            placeholder={
                              !formData.department
                                ? "Select department first"
                                : supervisors.length === 0
                                  ? "No supervisors available"
                                  : "Select supervisor"
                            }
                          />
                        )}
                      </SelectTrigger>
                      <SelectContent className="border-2 border-teal-200 dark:border-teal-800 rounded-lg shadow-lg">
                        {supervisors.length > 0 ? (
                          supervisors.map((supervisor) => (
                            <SelectItem
                              key={supervisor.id}
                              value={supervisor.id.toString()}
                              className="py-2.5 text-base"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{supervisor.fullName}</span>
                                {supervisor.department && (
                                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                                    {supervisor.department}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-supervisors" disabled className="py-2.5 text-base">
                            No supervisors available in {formData.department}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-1">
                      Select your project supervisor
                    </p>

                    {/* Show warning if no supervisors found */}
                    {supervisors.length === 0 && !loadingSupervisors && formData.department && (
                      <Alert
                        variant="destructive"
                        className="mt-2 border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No active supervisors found in {formData.department} department. Please contact administration
                          or select a different department.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Additional Details Section */}
            <div className={fieldGroupClasses}>
              <h3 className={sectionHeaderClasses}>
                <Calendar className="h-5 w-5" />
                Additional Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="year" className={fieldLabelClasses}>
                    Year
                  </Label>
                  <Input
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="e.g., 2024"
                    className={`${inputClasses} border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700`}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-1">Year of creation/publication</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester" className={fieldLabelClasses}>
                    Semester
                  </Label>
                  <Select value={formData.semester} onValueChange={(value) => handleSelectChange("semester", value)}>
                    <SelectTrigger
                      className={`${selectTriggerClasses} border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700`}
                    >
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-orange-200 dark:border-orange-800 rounded-lg shadow-lg">
                      <SelectItem value="First" className="py-2.5 text-base">
                        First
                      </SelectItem>
                      <SelectItem value="Second" className="py-2.5 text-base">
                        Second
                      </SelectItem>
                      <SelectItem value="Summer" className="py-2.5 text-base">
                        Summer
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-1">
                    Applicable semester (if relevant)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course" className={fieldLabelClasses}>
                    Course
                  </Label>
                  <Input
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    placeholder="e.g., Computer Science 101"
                    className={`${inputClasses} border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700`}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-1">Related course (if applicable)</p>
                </div>
              </div>
            </div>

            {/* Tags Section */}
            <div className={fieldGroupClasses}>
              <Label htmlFor="tags" className={fieldLabelClasses}>
                <Tag className="h-5 w-5" />
                Tags (comma separated)
              </Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., programming, database, research"
                className={`${inputClasses} border-violet-200 dark:border-violet-800 hover:border-violet-300 dark:hover:border-violet-700`}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-1">
                Add relevant tags to help others find your resource
              </p>
            </div>

            {/* File Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="file" className={fieldLabelClasses}>
                File Upload <span className="text-red-500 ml-1">*</span>
              </Label>
              <div
                className={`border-3 border-dashed rounded-xl p-8 text-center transition-all ${
                  selectedFile
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                }`}
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
                      <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-4">
                        <FileText className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-lg font-medium text-blue-700 dark:text-blue-300">{selectedFile.name}</span>
                      <span className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          setSelectedFile(null)
                        }}
                        className="mt-2 border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                      >
                        Change file
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-2">
                        <Upload className="h-12 w-12 text-gray-500 dark:text-gray-400" />
                      </div>
                      <span className="text-lg font-medium">Click to upload or drag and drop</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        PDF, DOC, DOCX, PPT, PPTX, ZIP (Max 10MB)
                      </span>
                    </>
                  )}
                </Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end gap-4 p-6 pt-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="w-full sm:w-auto border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 py-6 rounded-xl text-base"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || loadingDepartments}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-6 rounded-xl text-base font-medium shadow-md text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Resource
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        title="Upload Successful!"
        message={
          uploadedResource
            ? `Your ${getResourceTypeName(uploadedResource.type)} "${uploadedResource.title}" has been uploaded successfully.`
            : "Your resource has been uploaded successfully."
        }
        resourceType={uploadedResource?.type}
      />
    </>
  )
}

export default ResourceUploadForm
