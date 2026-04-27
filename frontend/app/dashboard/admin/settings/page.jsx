"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Save, Loader2, Settings as SettingsIcon } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    siteTitle: "CUG Repository",
    siteDescription: "Catholic University of Ghana Repository System",
    allowRegistration: true,
    requireApproval: true,
    maxFileSize: 10, // in MB
    allowedFileTypes: ".pdf,.doc,.docx,.ppt,.pptx,.zip",
    emailNotifications: true,
    maintenanceMode: false,
  })

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

        if (data.user.role !== "admin") {
          router.push(`/dashboard/${data.user.role}`)
          return
        }

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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name, checked) => {
    setSettings((prev) => ({ ...prev, [name]: checked }))
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
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white">
        <DashboardHeader />
        <div className="container flex-1 items-center justify-center flex">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white">
      <DashboardHeader />
      <div className="container max-w-4xl mx-auto py-8 px-4 flex-1">
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex flex-col items-center justify-center py-6 text-center mb-6">
            <div className="bg-blue-500 rounded-full p-3 mb-4">
              <SettingsIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-800">System Settings</h1>
            <p className="text-blue-600 max-w-lg mx-auto">
              Configure system-wide settings and preferences for the CUG Repository platform.
            </p>
          </div>

          <Card className="border-none shadow-lg rounded-xl overflow-hidden">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="w-full grid grid-cols-4 bg-blue-50 rounded-none">
                <TabsTrigger value="general" className="data-[state=active]:bg-white rounded-t-lg">General</TabsTrigger>
                <TabsTrigger value="uploads" className="data-[state=active]:bg-white rounded-t-lg">Uploads</TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-white rounded-t-lg">Notifications</TabsTrigger>
                <TabsTrigger value="maintenance" className="data-[state=active]:bg-white rounded-t-lg">Maintenance</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="p-6 bg-white">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteTitle" className="text-blue-800">Site Title</Label>
                    <Input 
                      id="siteTitle" 
                      name="siteTitle" 
                      value={settings.siteTitle} 
                      onChange={handleInputChange}
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription" className="text-blue-800">Site Description</Label>
                    <Input
                      id="siteDescription"
                      name="siteDescription"
                      value={settings.siteDescription}
                      onChange={handleInputChange}
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowRegistration" className="text-blue-800">Allow Public Registration</Label>
                      <p className="text-sm text-blue-600">Allow users to register accounts on the site.</p>
                    </div>
                    <Switch
                      id="allowRegistration"
                      checked={settings.allowRegistration}
                      onCheckedChange={(checked) => handleSwitchChange("allowRegistration", checked)}
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="uploads" className="p-6 bg-white">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="requireApproval" className="text-blue-800">Require Approval</Label>
                      <p className="text-sm text-blue-600">
                        Require admin approval for all resource submissions.
                      </p>
                    </div>
                    <Switch
                      id="requireApproval"
                      checked={settings.requireApproval}
                      onCheckedChange={(checked) => handleSwitchChange("requireApproval", checked)}
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxFileSize" className="text-blue-800">Maximum File Size (MB)</Label>
                    <Input
                      id="maxFileSize"
                      name="maxFileSize"
                      type="number"
                      min="1"
                      max="100"
                      value={settings.maxFileSize}
                      onChange={handleInputChange}
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allowedFileTypes" className="text-blue-800">Allowed File Types</Label>
                    <Input
                      id="allowedFileTypes"
                      name="allowedFileTypes"
                      value={settings.allowedFileTypes}
                      onChange={handleInputChange}
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="text-xs text-blue-600">
                      Comma-separated list of file extensions (e.g., .pdf,.doc,.docx)
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="p-6 bg-white">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications" className="text-blue-800">Email Notifications</Label>
                      <p className="text-sm text-blue-600">
                        Send email notifications for important system events.
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSwitchChange("emailNotifications", checked)}
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="maintenance" className="p-6 bg-white">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="maintenanceMode" className="font-medium text-red-600">
                        Maintenance Mode
                      </Label>
                      <p className="text-sm text-red-500">
                        Put the site in maintenance mode. Only administrators can access the site.
                      </p>
                    </div>
                    <Switch
                      id="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => handleSwitchChange("maintenanceMode", checked)}
                      className="data-[state=checked]:bg-red-500"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          <div className="mt-6 flex justify-center">
            <Button 
              onClick={handleSaveSettings} 
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg shadow-md transition-all"
            >
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
        </main>
      </div>
    </div>
  )
}