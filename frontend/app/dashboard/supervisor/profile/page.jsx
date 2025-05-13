"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { 
  User, Mail, Phone, Building, Save, Loader2, Key, 
  ShieldCheck, Briefcase, Settings, LogOut, Bell, 
  Moon, Sun, UserCircle
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export default function SupervisorProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    department: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appNotifications: true,
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

        if (data.user.role !== "supervisor") {
          router.push(`/dashboard/${data.user.role}`)
          return
        }

        setUser(data.user)
        setProfileData({
          fullName: data.user.fullName || "",
          email: data.user.email || "",
          phoneNumber: data.user.phoneNumber || "",
          department: data.user.department || "",
        })
        
        // Check system preference for dark mode
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setDarkMode(true)
          document.documentElement.classList.add('dark')
        }
        
        setLoading(false)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (name) => {
    setNotificationSettings(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fullName: profileData.fullName,
          phoneNumber: profileData.phoneNumber,
          department: profileData.department,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update profile")
      }

      // Update user in state
      setUser((prev) => ({
        ...prev,
        fullName: profileData.fullName,
        phoneNumber: profileData.phoneNumber,
        department: profileData.department,
      }))

      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error(error.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setChangingPassword(true)

    try {
      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error("New passwords do not match")
      }

      if (passwordData.newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long")
      }

      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          password: passwordData.newPassword,
          currentPassword: passwordData.currentPassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to change password")
      }

      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast.success("Password changed successfully")
    } catch (error) {
      console.error("Error changing password:", error)
      toast.error(error.message || "Failed to change password")
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-950 dark:to-blue-900">
        <div className="container flex-1 items-center justify-center flex">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      </div>
    )
  }

  const initials = profileData.fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-950 dark:to-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur dark:bg-indigo-950/90 dark:border-indigo-800">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
              {profileData.fullName}
          </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="text-indigo-700 hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-indigo-100">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <Button variant="ghost" size="icon" className="relative text-indigo-700 hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-indigo-100">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative curssor-pointer h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {/* <AvatarImage src="/placeholder-avatar.jpg" alt={profileData.fullName} /> */}
                    <AvatarFallback className="bg-indigo-600 text-white">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-blue-600 text-white" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profileData.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{profileData.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <Link href="/dashboard/supervisor/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Briefcase className="mr-2 h-4 w-4" />
                  <Link href="/dashboard/supervisor">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <Link href="/dashboard/supervisor/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <Link href="/logout">Log out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container flex-1 py-8">
        <div className="flex flex-col">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* Sidebar */}
            <div className="hidden md:block md:col-span-3 lg:col-span-3">
              <div className="sticky top-24 space-y-6">
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-indigo-900 dark:text-indigo-100">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/placeholder-avatar.jpg" alt={profileData.fullName} />
                      <AvatarFallback className="bg-indigo-600 text-white text-2xl">{initials}</AvatarFallback>
                    </Avatar>
                    <h2 className="mt-4 text-xl font-bold text-indigo-800 dark:text-indigo-200">{profileData.fullName}</h2>
                    <p className="text-sm text-indigo-600 dark:text-indigo-300">{profileData.department || "Department"}</p>
                    <div className="mt-2 flex items-center justify-center space-x-1">
                      <span className="inline-block h-3 w-3 rounded-full bg-green-500"></span>
                      <span className="text-xs font-medium text-indigo-500 dark:text-indigo-300">Online</span>
                    </div>
                    <Button className="mt-4 w-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-800 dark:text-indigo-200 dark:hover:bg-indigo-700" variant="outline">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Upload Photo
                    </Button>
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                        <span className="text-sm text-indigo-700 dark:text-indigo-200">Email</span>
                      </div>
                      <span className="text-sm font-medium text-indigo-800 dark:text-indigo-100">{profileData.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                        <span className="text-sm text-indigo-700 dark:text-indigo-200">Phone</span>
                      </div>
                      <span className="text-sm font-medium text-indigo-800 dark:text-indigo-100">{profileData.phoneNumber || "Not set"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                        <span className="text-sm text-indigo-700 dark:text-indigo-200">Department</span>
                      </div>
                      <span className="text-sm font-medium text-indigo-800 dark:text-indigo-100">{profileData.department || "Not set"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-9 lg:col-span-9">
              <div className="space-y-6">
                <Tabs defaultValue="profile" className="w-full">
                  <div className="mb-6 rounded-lg bg-white p-2 shadow-sm dark:bg-indigo-900">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="profile" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </TabsTrigger>
                      <TabsTrigger value="security" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Security
                      </TabsTrigger>
                      <TabsTrigger value="notifications" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="profile">
                    <div className="mb-8">
                      <h1 className="text-3xl font-bold text-indigo-800 dark:text-indigo-200">Profile Information</h1>
                      <p className="text-indigo-600 dark:text-indigo-300">Update your personal and contact information</p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-indigo-900 dark:text-indigo-100">
                      <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-base text-indigo-800 dark:text-indigo-200">Full Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500 dark:text-indigo-300" />
                              <Input
                                id="fullName"
                                name="fullName"
                                value={profileData.fullName}
                                onChange={handleProfileInputChange}
                                className="pl-10 h-12 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-indigo-700 dark:bg-indigo-800 dark:text-indigo-100 dark:focus:border-indigo-500"
                                placeholder="Enter your full name"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-base text-indigo-800 dark:text-indigo-200">Email Address</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500 dark:text-indigo-300" />
                              <Input
                                id="email"
                                name="email"
                                value={profileData.email}
                                className="pl-10 h-12 bg-indigo-50 border-indigo-200 dark:bg-indigo-800/50 dark:border-indigo-700 dark:text-indigo-200"
                                disabled
                              />
                            </div>
                            <p className="text-xs text-indigo-500 dark:text-indigo-300">
                              Email cannot be changed. Contact system administrator for assistance.
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phoneNumber" className="text-base text-indigo-800 dark:text-indigo-200">Phone Number</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500 dark:text-indigo-300" />
                              <Input
                                id="phoneNumber"
                                name="phoneNumber"
                                value={profileData.phoneNumber}
                                onChange={handleProfileInputChange}
                                className="pl-10 h-12 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-indigo-700 dark:bg-indigo-800 dark:text-indigo-100 dark:focus:border-indigo-500"
                                placeholder="Enter your phone number"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="department" className="text-base text-indigo-800 dark:text-indigo-200">Department</Label>
                            <div className="relative">
                              <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500 dark:text-indigo-300" />
                              <Input
                                id="department"
                                name="department"
                                value={profileData.department}
                                onChange={handleProfileInputChange}
                                className="pl-10 h-12 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-indigo-700 dark:bg-indigo-800 dark:text-indigo-100 dark:focus:border-indigo-500"
                                placeholder="Enter your department"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            disabled={saving}
                            className="h-12 px-6 font-medium bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-700 dark:hover:bg-indigo-600"
                          >
                            {saving ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Saving Changes...
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-5 w-5" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </TabsContent>

                  <TabsContent value="security">
                    <div className="mb-8">
                      <h1 className="text-3xl font-bold text-indigo-800 dark:text-indigo-200">Security Settings</h1>
                      <p className="text-indigo-600 dark:text-indigo-300">Manage your password and account security</p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-indigo-900 dark:text-indigo-100">
                      <form onSubmit={handleChangePassword} className="space-y-6">
                        <div className="space-y-4">
                          <Label htmlFor="currentPassword" className="text-base text-indigo-800 dark:text-indigo-200">Current Password</Label>
                          <div className="relative">
                            <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500 dark:text-indigo-300" />
                            <Input
                              id="currentPassword"
                              name="currentPassword"
                              type="password"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordInputChange}
                              className="pl-10 h-12 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-indigo-700 dark:bg-indigo-800 dark:text-indigo-100 dark:focus:border-indigo-500"
                              required
                              placeholder="Enter your current password"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-base text-indigo-800 dark:text-indigo-200">New Password</Label>
                            <div className="relative">
                              <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500 dark:text-indigo-300" />
                              <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={handlePasswordInputChange}
                                className="pl-10 h-12 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-indigo-700 dark:bg-indigo-800 dark:text-indigo-100 dark:focus:border-indigo-500"
                                required
                                placeholder="Enter your new password"
                              />
                            </div>
                            <p className="text-xs text-indigo-500 dark:text-indigo-300">
                              Password must be at least 6 characters long
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-base text-indigo-800 dark:text-indigo-200">Confirm New Password</Label>
                            <div className="relative">
                              <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500 dark:text-indigo-300" />
                              <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordInputChange}
                                className="pl-10 h-12 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-indigo-700 dark:bg-indigo-800 dark:text-indigo-100 dark:focus:border-indigo-500"
                                required
                                placeholder="Confirm your new password"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            disabled={changingPassword}
                            className="h-12 px-6 font-medium bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-700 dark:hover:bg-indigo-600"
                          >
                            {changingPassword ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Updating Password...
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="mr-2 h-5 w-5" />
                                Change Password
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </TabsContent>

                  <TabsContent value="notifications">
                    <div className="mb-8">
                      <h1 className="text-3xl font-bold text-indigo-800 dark:text-indigo-200">Notification Preferences</h1>
                      <p className="text-indigo-600 dark:text-indigo-300">Customize how you receive notifications</p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-indigo-900 dark:text-indigo-100">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <h3 className="text-lg font-medium text-indigo-800 dark:text-indigo-200">Email Notifications</h3>
                            <p className="text-sm text-indigo-600 dark:text-indigo-300">
                              Receive notifications about account activity via email
                            </p>
                          </div>
                          <Switch
                            checked={notificationSettings.emailNotifications}
                            onCheckedChange={() => handleNotificationChange('emailNotifications')}
                            className="data-[state=checked]:bg-indigo-600 data-[state=checked]:dark:bg-indigo-500"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <h3 className="text-lg font-medium text-indigo-800 dark:text-indigo-200">SMS Notifications</h3>
                            <p className="text-sm text-indigo-600 dark:text-indigo-300">
                              Receive text messages for important updates
                            </p>
                          </div>
                          <Switch
                            checked={notificationSettings.smsNotifications}
                            onCheckedChange={() => handleNotificationChange('smsNotifications')}
                            className="data-[state=checked]:bg-indigo-600 data-[state=checked]:dark:bg-indigo-500"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <h3 className="text-lg font-medium text-indigo-800 dark:text-indigo-200">App Notifications</h3>
                            <p className="text-sm text-indigo-600 dark:text-indigo-300">
                              Receive in-app notifications and alerts
                            </p>
                          </div>
                          <Switch
                            checked={notificationSettings.appNotifications}
                            onCheckedChange={() => handleNotificationChange('appNotifications')}
                            className="data-[state=checked]:bg-indigo-600 data-[state=checked]:dark:bg-indigo-500"
                          />
                        </div>
                        
                        <div className="pt-4">
                          <Button className="h-12 px-6 font-medium bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-700 dark:hover:bg-indigo-600">
                            Save Notification Settings
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-200">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-indigo-600 dark:text-indigo-300">
            &copy; {new Date().getFullYear()} SuperVisor. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm" className="text-indigo-700 hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-indigo-100">Terms</Button>
            <Button variant="ghost" size="sm" className="text-indigo-700 hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-indigo-100">Privacy</Button>
            <Button variant="ghost" size="sm" className="text-indigo-700 hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-indigo-100">Help</Button>
          </div>
        </div>
      </footer>
    </div>
  )
}