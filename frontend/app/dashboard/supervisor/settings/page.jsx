"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Save, Loader2 } from "lucide-react"
import DashboardNav from "@/components/dashboard-nav"
import DashboardHeader from "@/components/dashboard-header"

export default function SupervisorSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoApproveMinorProjects: false,
    defaultDepartment: "",
    displayNameFormat: "fullName", // fullName, username, or custom
    customDisplayName: "",
    showContactInfo: true,
  })
  const [departments, setDepartments] = useState([])

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

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <div className="container flex-1 items-center justify-center flex">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <DashboardNav isSupervisor={true} />
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Supervisor Settings</h1>
              <p className="text-muted-foreground">Configure your supervisor account settings and preferences.</p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings}>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Configure how you receive notifications about resources.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications when new resources are submitted for your approval.
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSwitchChange("emailNotifications", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Approval Settings</CardTitle>
                  <CardDescription>Configure how resource approvals are handled.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoApproveMinorProjects">Auto-Approve Mini Projects</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically approve mini projects without manual review.
                      </p>
                    </div>
                    <Switch
                      id="autoApproveMinorProjects"
                      checked={settings.autoApproveMinorProjects}
                      onCheckedChange={(checked) => handleSwitchChange("autoApproveMinorProjects", checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultDepartment">Default Department</Label>
                    <Select
                      value={settings.defaultDepartment}
                      onValueChange={(value) => handleSelectChange("defaultDepartment", value)}
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
                    <p className="text-xs text-muted-foreground">The default department for resources you supervise.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Display Settings</CardTitle>
                  <CardDescription>Configure how your information is displayed to students.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayNameFormat">Display Name Format</Label>
                    <Select
                      value={settings.displayNameFormat}
                      onValueChange={(value) => handleSelectChange("displayNameFormat", value)}
                    >
                      <SelectTrigger>
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
                    <div className="space-y-2">
                      <Label htmlFor="customDisplayName">Custom Display Name</Label>
                      <Input
                        id="customDisplayName"
                        name="customDisplayName"
                        value={settings.customDisplayName}
                        onChange={handleInputChange}
                        placeholder="Dr. John Doe"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="showContactInfo">Show Contact Information</Label>
                      <p className="text-sm text-muted-foreground">Allow students to see your contact information.</p>
                    </div>
                    <Switch
                      id="showContactInfo"
                      checked={settings.showContactInfo}
                      onCheckedChange={(checked) => handleSwitchChange("showContactInfo", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
