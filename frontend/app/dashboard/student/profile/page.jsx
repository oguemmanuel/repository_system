"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { 
  AtSign, BookOpen, FileText, Phone, 
  School, User, PenLine, Lock, BookMarked,
  ChevronRight, Upload, Download, Eye, Clock
} from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

export default function StudentProfile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalViews: 0,
    totalDownloads: 0,
    pendingResources: 0,
  })
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get user from localStorage first
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          if (parsedUser.role !== "student") {
            // Redirect to appropriate dashboard
            router.push(`/dashboard/${parsedUser.role}`)
            return
          }
          setUser(parsedUser)
          setFormData({
            ...formData,
            fullName: parsedUser.fullName || "",
            phoneNumber: parsedUser.phoneNumber || "",
          })
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

        // If not a student, redirect
        if (data.user.role !== "student") {
          router.push(`/dashboard/${data.user.role}`)
          return
        }

        setUser(data.user)
        setFormData({
          ...formData,
          fullName: data.user.fullName || "",
          phoneNumber: data.user.phoneNumber || "",
        })
        fetchUserStats(data.user)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  const fetchUserStats = async (userData) => {
    setLoading(true)
    try {
      // Fetch user analytics
      const analyticsResponse = await fetch("http://localhost:5000/api/analytics/user", {
        credentials: "include",
      })

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setStats(analyticsData.analytics)
      }
    } catch (error) {
      console.error("Error fetching user stats:", error)
      toast.error("Failed to load user statistics. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
        }),
      })

      if (response.ok) {
        // Update local user data
        const updatedUser = {
          ...user,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
        }
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
        toast.success("Profile updated successfully")
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Profile update error:", error)
      toast.error("An error occurred while updating your profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          password: formData.newPassword,
        }),
      })

      if (response.ok) {
        toast.success("Password updated successfully")
        // Clear password fields
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Failed to update password")
      }
    } catch (error) {
      console.error("Password update error:", error)
      toast.error("An error occurred while updating your password")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate completion percentage
  const calculateProfileCompletion = () => {
    let total = 0;
    let completed = 0;
    
    // Check each field
    if (user?.fullName) completed++;
    if (user?.email) completed++;
    if (user?.indexNumber) completed++;
    if (user?.phoneNumber) completed++;
    if (user?.profileImage) completed++;
    
    total = 5; // Total number of profile fields
    
    return Math.round((completed / total) * 100);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute h-full w-full animate-ping rounded-full bg-indigo-400 opacity-20"></div>
            <div className="absolute h-10 w-10 animate-pulse rounded-full bg-indigo-600"></div>
            <div className="text-white">Loading</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero section with user info */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 shadow-xl">
          <div className="absolute bottom-0 right-0 opacity-10">
            <svg width="300" height="300" viewBox="0 0 100 100" fill="white">
              <path d="M50,5 C75,5 95,25 95,50 C95,75 75,95 50,95 C25,95 5,75 5,50 C5,25 25,5 50,5 Z" />
            </svg>
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-white/20 shadow-lg">
                <AvatarImage src={user?.profileImage || ""} alt={user?.fullName} />
                <AvatarFallback className="bg-indigo-800 text-2xl text-white">
                  {user?.fullName?.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-white">
                <h1 className="text-3xl font-bold">{user?.fullName || "Student"}</h1>
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white hover:bg-white/30">{user?.role}</Badge>
                  <div className="flex items-center gap-1">
                    <School className="h-4 w-4" />
                    <span>{user?.indexNumber || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
              <Button 
                variant="outline" 
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                onClick={() => setActiveTab("edit")}
              >
                <PenLine className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <Button
                className="bg-white text-indigo-600 hover:bg-white/90"
                onClick={() => router.push('/dashboard/student/resources')}
              >
                <BookMarked className="mr-2 h-4 w-4" />
                My Resources
              </Button>
            </div>
          </div>
        </div>
        
        {/* Statistics cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="overflow-hidden border-none bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-800">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Uploads</p>
                <h3 className="text-2xl font-bold">{stats.totalUploads}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-none bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-800">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-purple-100 p-3 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resource Views</p>
                <h3 className="text-2xl font-bold">{stats.totalViews}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-none bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-800">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Downloads</p>
                <h3 className="text-2xl font-bold">{stats.totalDownloads}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-none bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-800">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-amber-100 p-3 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <h3 className="text-2xl font-bold">{stats.pendingResources}</h3>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <Tabs 
          defaultValue="profile" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="space-y-6"
        >
          <TabsList className="inline-flex h-10 w-full justify-start rounded-md border border-input bg-white p-1 text-muted-foreground dark:bg-gray-800 sm:w-auto">
            <TabsTrigger 
              value="profile" 
              className="rounded-sm data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="edit" 
              className="rounded-sm data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              <PenLine className="mr-2 h-4 w-4" />
              Edit Profile
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="rounded-sm data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              <Lock className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Profile details */}
              <Card className="col-span-2 border-none bg-white shadow-lg dark:bg-gray-800">
                <CardContent className="p-6">
                  <h2 className="mb-6 text-2xl font-bold">Profile Details</h2>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Profile Completion</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{calculateProfileCompletion()}% Complete</span>
                          <span className="text-muted-foreground">{calculateProfileCompletion() < 100 ? "Add missing info" : "Complete"}</span>
                        </div>
                        <Progress value={calculateProfileCompletion()} className="h-2" />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                        <p className="mt-1 font-medium">{user?.fullName || "Not set"}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                        <p className="mt-1 font-medium">{user?.email}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Index Number</p>
                        <p className="mt-1 font-medium">{user?.indexNumber || "Not available"}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                        <p className="mt-1 font-medium">{user?.phoneNumber || "Not set"}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                        <Badge className="mt-1 bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50">
                          Active
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">User Role</p>
                        <Badge className="mt-1 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50">
                          {user?.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent activity */}
              <Card className="border-none bg-white shadow-lg dark:bg-gray-800">
                <CardContent className="p-6">
                  <h2 className="mb-6 text-2xl font-bold">Recent Activity</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <Upload className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">Uploaded a new resource</p>
                        <p className="text-sm text-muted-foreground">2 days ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-green-100 p-2 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        <Download className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">Downloaded "Calculus II Notes"</p>
                        <p className="text-sm text-muted-foreground">3 days ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                        <PenLine className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">Updated profile information</p>
                        <p className="text-sm text-muted-foreground">1 week ago</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="mt-2 w-full"
                      onClick={() => router.push('/dashboard/student/activity')}
                    >
                      View All Activity
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="edit" className="mt-6 space-y-6">
            <Card className="border-none bg-white shadow-lg dark:bg-gray-800">
              <CardContent className="p-6">
                <h2 className="mb-6 text-2xl font-bold">Edit Profile</h2>
                
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="mb-8 flex flex-col items-center sm:flex-row sm:gap-6">
                    <Avatar className="h-24 w-24 border-2 border-muted">
                      <AvatarImage src={user?.profileImage || ""} alt={user?.fullName} />
                      <AvatarFallback className="bg-indigo-600 text-2xl text-white">
                        {user?.fullName?.charAt(0) || "S"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="mt-4 flex w-full flex-col gap-2 sm:mt-0">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="border-dashed"
                      >
                        Upload New Picture
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Upload a photo (max 2MB). JPG, PNG formats supported.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium">
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        className="h-12 rounded-md"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <Input 
                        id="email" 
                        value={user?.email || ""} 
                        disabled 
                        className="h-12 rounded-md bg-gray-50 dark:bg-gray-700" 
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="indexNumber" className="text-sm font-medium">
                        Index Number
                      </Label>
                      <Input 
                        id="indexNumber" 
                        value={user?.indexNumber || ""} 
                        disabled 
                        className="h-12 rounded-md bg-gray-50 dark:bg-gray-700" 
                      />
                      <p className="text-xs text-muted-foreground">Index number cannot be changed</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-sm font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Your phone number"
                        className="h-12 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="mt-4 h-12 bg-indigo-600 px-6 font-medium hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
                  >
                    {isSubmitting ? "Updating..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="mt-6 space-y-6">
            <Card className="border-none bg-white shadow-lg dark:bg-gray-800">
              <CardContent className="p-6">
                <h2 className="mb-6 text-2xl font-bold">Password & Security</h2>
                
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="h-12 rounded-md"
                      />
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 6 characters long
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="h-12 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="mt-4 h-12 bg-indigo-600 px-6 font-medium hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
                  >
                    {isSubmitting ? "Updating..." : "Update Password"}
                  </Button>
                </form>
                
                <Separator className="my-8" />
                
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Account Security</h3>
                  
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
                    <h4 className="mb-2 font-medium text-amber-800 dark:text-amber-400">Security Recommendations</h4>
                    <ul className="ml-6 list-disc space-y-1 text-sm text-amber-800 dark:text-amber-400">
                      <li>Use a strong, unique password</li>
                      <li>Change your password regularly</li>
                      <li>Don't share your account credentials</li>
                    </ul>
                  </div>
                  
                  {/* This would be linked to actual login activity in a real app */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Logins</h4>
                    <div className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-green-100 p-2 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-muted-foreground">Now • Chrome on Windows</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}