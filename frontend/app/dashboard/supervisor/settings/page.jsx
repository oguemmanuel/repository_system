"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Save, Loader2, Bell, CheckCircle, User, ArrowLeft, Settings, ChevronDown } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function SupervisorSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("notifications")
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoApproveMinorProjects: false,
    defaultDepartment: "",
    displayNameFormat: "fullName", // fullName, username, or custom
    customDisplayName: "",
    showContactInfo: true,
  })
  const [departments, setDepartments] = useState([])
  const [expanded, setExpanded] = useState(false)

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include",
        })

        if (!response.ok) {
          router.push("/login")
          return
        }

        const data = await response.json()

        if (data.user.role !== "supervisor") {
          router.push(`/dashboard/${data.user.role}`)
          return
        }

        // Set default department from user data
        if (data.user.department) {
          setSettings((prev) => ({
            ...prev,
            defaultDepartment: data.user.department,
          }))
        }

        fetchDepartments()

        // In a real application, you would fetch settings from the backend
        // For now, we'll just simulate loading
        setTimeout(() => {
          setLoading(false)
        }, 500)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  const fetchDepartments = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users/departments/all", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setDepartments(data.departments || [])
      }
    } catch (error) {
      console.error("Error fetching departments:", error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name, checked) => {
    setSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name, value) => {
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      // In a real application, you would save settings to the backend
      // For now, we'll just simulate saving
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("Settings saved successfully")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium text-gray-700">Loading your settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header with gradient background */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-white/10 hover:bg-white/20"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Supervisor Settings</h1>
                <p className="text-sm text-white/80">Customize your supervisor profile and preferences</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-white/20 hover:bg-white/30 cursor-pointer text-white">
                Supervisor
              </Badge>
              <Avatar className="h-10 w-10 border-2 border-white/30">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-white/20 text-white">SV</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto flex-1 px-4 py-8">
        <form onSubmit={handleSaveSettings} className="max-w-4xl mx-auto">
          <Card className="mb-8 overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl font-bold text-gray-800">Settings Overview</h2>
                  <p className="text-sm text-gray-600">Configure your account to match your workflow</p>
                </div>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Changes
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save All Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-12">
              <Tabs 
                defaultValue="notifications" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="mb-8"
              >
                <div className="mb-6 flex flex-wrap gap-2 md:flex-nowrap md:justify-center">
                  <TabsList className="grid w-full grid-cols-1 gap-2 md:grid-cols-3 p-1 rounded-xl bg-white shadow-md">
                    <TabsTrigger 
                      value="notifications" 
                      className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </TabsTrigger>
                    <TabsTrigger 
                      value="approvals" 
                      className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approvals
                    </TabsTrigger>
                    <TabsTrigger 
                      value="display" 
                      className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Display
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="notifications" className="mt-0">
                  <Card className="overflow-hidden border-0 shadow-lg">
                    <CardContent className="p-0">
                      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-indigo-100 p-2">
                            <Bell className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">Notification Preferences</h3>
                            <p className="text-sm text-gray-600">Configure how you receive notifications about resources</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-lg bg-white border border-gray-100">
                          <div>
                            <Label htmlFor="emailNotifications" className="text-base font-medium">Email Notifications</Label>
                            <p className="text-sm text-gray-600">Receive email notifications when new resources are submitted for your approval</p>
                          </div>
                          <Switch
                            id="emailNotifications"
                            checked={settings.emailNotifications}
                            onCheckedChange={(checked) => handleSwitchChange("emailNotifications", checked)}
                            className="data-[state=checked]:bg-indigo-600"
                          />
                        </div>
                        
                        <div className="mt-4">
                          <button 
                            type="button" 
                            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            onClick={toggleExpanded}
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                            {expanded ? 'Hide Advanced Options' : 'Show Advanced Options'}
                          </button>
                          
                          {expanded && (
                            <div className="mt-4 space-y-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                              <p className="text-sm text-gray-600">Additional notification settings will appear here</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="approvals" className="mt-0">
                  <Card className="overflow-hidden border-0 shadow-lg">
                    <CardContent className="p-0">
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-purple-100 p-2">
                            <CheckCircle className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">Approval Workflow</h3>
                            <p className="text-sm text-gray-600">Configure how resource approvals are handled</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-lg bg-white border border-gray-100">
                          <div>
                            <Label htmlFor="autoApproveMinorProjects" className="text-base font-medium">Auto-Approve Mini Projects</Label>
                            <p className="text-sm text-gray-600">Automatically approve mini projects without manual review</p>
                          </div>
                          <Switch
                            id="autoApproveMinorProjects"
                            checked={settings.autoApproveMinorProjects}
                            onCheckedChange={(checked) => handleSwitchChange("autoApproveMinorProjects", checked)}
                            className="data-[state=checked]:bg-purple-600"
                          />
                        </div>
                        
                        <div className="space-y-3 p-4 rounded-lg bg-white border border-gray-100">
                          <Label htmlFor="defaultDepartment" className="text-base font-medium">Default Department</Label>
                          <Select
                            value={settings.defaultDepartment}
                            onValueChange={(value) => handleSelectChange("defaultDepartment", value)}
                          >
                            <SelectTrigger className="bg-white border-gray-200">
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
                          <p className="text-xs text-gray-600">The default department for resources you supervise</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="display" className="mt-0">
                  <Card className="overflow-hidden border-0 shadow-lg">
                    <CardContent className="p-0">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-blue-100 p-2">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">Display Preferences</h3>
                            <p className="text-sm text-gray-600">Configure how your information is displayed to students</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="space-y-3 p-4 rounded-lg bg-white border border-gray-100">
                          <Label htmlFor="displayNameFormat" className="text-base font-medium">Display Name Format</Label>
                          <Select
                            value={settings.displayNameFormat}
                            onValueChange={(value) => handleSelectChange("displayNameFormat", value)}
                          >
                            <SelectTrigger className="bg-white border-gray-200">
                              <SelectValue placeholder="Select display name format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fullName">Full Name</SelectItem>
                              <SelectItem value="username">Username</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {settings.displayNameFormat === "custom" && (
                          <div className="space-y-3 p-4 rounded-lg bg-white border border-gray-100">
                            <Label htmlFor="customDisplayName" className="text-base font-medium">Custom Display Name</Label>
                            <Input
                              id="customDisplayName"
                              name="customDisplayName"
                              value={settings.customDisplayName}
                              onChange={handleInputChange}
                              placeholder="Dr. John Doe"
                              className="bg-white border-gray-200"
                            />
                          </div>
                        )}

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-lg bg-white border border-gray-100">
                          <div>
                            <Label htmlFor="showContactInfo" className="text-base font-medium">Show Contact Information</Label>
                            <p className="text-sm text-gray-600">Allow students to see your contact information</p>
                          </div>
                          <Switch
                            id="showContactInfo"
                            checked={settings.showContactInfo}
                            onCheckedChange={(checked) => handleSwitchChange("showContactInfo", checked)}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </form>
      </main>
      
      <footer className="py-6 text-center text-sm text-gray-600">
        <p>© {new Date().getFullYear()} Resource Management System. All rights reserved.</p>
      </footer>
    </div>
  )
}