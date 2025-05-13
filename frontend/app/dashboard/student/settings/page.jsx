"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { 
  Bell, 
  Moon, 
  Sun, 
  Monitor, 
  User, 
  Settings, 
  LogOut,
  Palette,
  Lock,
  Accessibility
} from "lucide-react"

// UI components
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StudentSettings() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    theme: "light",
    notifications: {
      resourceApproved: true,
      resourceRejected: true,
      newComments: true,
      systemUpdates: false,
    },
    privacy: {
      showEmail: false,
      showPhone: false,
    },
    accessibility: {
      highContrast: false,
      largeText: false,
    },
  })

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

        // Load settings from localStorage if available
        const savedSettings = localStorage.getItem("userSettings")
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings))
        }

        setLoading(false)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  // Apply theme on component mount and when theme changes
  useEffect(() => {
    const applyTheme = () => {
      if (settings.theme === "dark") {
        document.documentElement.classList.add("dark")
      } else if (settings.theme === "light") {
        document.documentElement.classList.remove("dark")
      } else if (settings.theme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        document.documentElement.classList.toggle("dark", prefersDark)
      }
    }

    applyTheme()

    // Listen for system theme changes if theme is set to "system"
    if (settings.theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e) => {
        document.documentElement.classList.toggle("dark", e.matches)
      }
      
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [settings.theme])

  const updateSettings = (category, setting, value) => {
    const newSettings = { ...settings }

    if (category) {
      newSettings[category][setting] = value
    } else {
      newSettings[setting] = value
    }

    setSettings(newSettings)

    // Save to localStorage
    localStorage.setItem("userSettings", JSON.stringify(newSettings))

    toast.success("Settings updated", {
      position: "bottom-right",
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-primary"></div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading your settings...</p>
        </div>
      </div>
    )
  }

  const themeIcons = {
    light: <Sun className="h-5 w-5" />,
    dark: <Moon className="h-5 w-5" />,
    system: <Monitor className="h-5 w-5" />
  }

  const categoryIcons = {
    general: <Palette className="h-5 w-5" />,
    notifications: <Bell className="h-5 w-5" />,
    privacy: <Lock className="h-5 w-5" />,
    accessibility: <Accessibility className="h-5 w-5" />
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md dark:bg-gray-900/80 dark:border-gray-800">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-blue-300">CUG Repository</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                const newTheme = settings.theme === "light" ? "dark" : "light"
                updateSettings(null, "theme", newTheme)
              }}
              className="rounded-full"
            >
              {settings.theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative flex items-center gap-2 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || ""} alt={user?.name || "User"} />
                    {/* <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback> */}
                  </Avatar>
                  <span className="hidden md:inline-block font-medium">{user?.name || "User"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => router.push("/dashboard/student/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/student/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  localStorage.removeItem("user")
                  router.push("/login")
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container flex-1 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
            <p className="text-muted-foreground">Customize your experience and manage your account preferences</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
            {/* Sidebar - Mobile Tabs */}
            <div className="md:hidden">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid grid-cols-4 mb-6">
                  {Object.entries(categoryIcons).map(([key, icon]) => (
                    <TabsTrigger key={key} value={key} className="flex items-center gap-2 capitalize">
                      {icon}
                      <span className="hidden sm:inline">{key}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {/* Content for tabs - mobile */}
                <RenderTabsContent 
                  settings={settings} 
                  updateSettings={updateSettings} 
                  themeIcons={themeIcons} 
                />
              </Tabs>
            </div>

            {/* Sidebar - Desktop */}
            <div className="hidden md:block">
              <Tabs defaultValue="general" orientation="vertical" className="w-full">
                <div className="rounded-lg bg-white dark:bg-gray-800/50 shadow-sm">
                  <TabsList className="flex flex-col items-stretch h-auto bg-transparent">
                    {Object.entries(categoryIcons).map(([key, icon]) => (
                      <TabsTrigger 
                        key={key} 
                        value={key} 
                        className="flex items-center justify-start gap-3 px-4 py-3 border-l-2 border-transparent data-[state=active]:border-primary rounded-none text-left"
                      >
                        {icon}
                        <span className="capitalize">{key}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </Tabs>
            </div>

            {/* Main Content Area - Desktop */}
            <div className="hidden md:block">
              <Tabs defaultValue="general" className="w-full">
                <RenderTabsContent 
                  settings={settings} 
                  updateSettings={updateSettings} 
                  themeIcons={themeIcons} 
                />
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Separated component to avoid duplication
function RenderTabsContent({ settings, updateSettings, themeIcons }) {
  return (
    <>
      <TabsContent value="general" className="space-y-6 mt-0">
        <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800/50">
          <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-4">
            <h2 className="text-lg font-medium text-white">Appearance</h2>
            <p className="text-indigo-100 text-sm">Customize how the application looks</p>
          </div>
          <CardContent className="p-6">
            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-base">Theme</Label>
                <div className="grid grid-cols-3 gap-4">
                  {["light", "dark", "system"].map((theme) => (
                    <div 
                      key={theme}
                      onClick={() => updateSettings(null, "theme", theme)}
                      className={`
                        flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer
                        transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50
                        ${settings.theme === theme 
                          ? "border-primary bg-primary/5 dark:bg-primary/10" 
                          : "border-gray-200 dark:border-gray-700"}
                      `}
                    >
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                        {themeIcons[theme]}
                      </div>
                      <span className="capitalize">{theme}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6 mt-0">
        <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800/50">
          <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-4">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </h2>
            <p className="text-indigo-100 text-sm">Control which notifications you receive</p>
          </div>
          <CardContent className="p-6">
            <div className="space-y-6">
              {[
                {
                  id: "resourceApproved",
                  title: "Resource Approved",
                  description: "Receive notifications when your resources are approved"
                },
                {
                  id: "resourceRejected",
                  title: "Resource Rejected",
                  description: "Receive notifications when your resources are rejected"
                },
                {
                  id: "newComments",
                  title: "New Comments",
                  description: "Receive notifications for new comments on your resources"
                },
                {
                  id: "systemUpdates",
                  title: "System Updates",
                  description: "Receive notifications about system updates and maintenance"
                }
              ].map((item, idx, arr) => (
                <div key={item.id}>
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                      <Label htmlFor={item.id} className="text-base font-medium">{item.title}</Label>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                      id={item.id}
                      checked={settings.notifications[item.id]}
                      onCheckedChange={(checked) => updateSettings("notifications", item.id, checked)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  {idx < arr.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="privacy" className="space-y-6 mt-0">
        <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800/50">
          <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-4">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Privacy Settings
            </h2>
            <p className="text-indigo-100 text-sm">Control what information is visible to others</p>
          </div>
          <CardContent className="p-6">
            <div className="space-y-6">
              {[
                {
                  id: "showEmail",
                  title: "Show Email Address",
                  description: "Allow other users to see your email address"
                },
                {
                  id: "showPhone",
                  title: "Show Phone Number",
                  description: "Allow other users to see your phone number"
                }
              ].map((item, idx, arr) => (
                <div key={item.id}>
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                      <Label htmlFor={item.id} className="text-base font-medium">{item.title}</Label>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                      id={item.id}
                      checked={settings.privacy[item.id]}
                      onCheckedChange={(checked) => updateSettings("privacy", item.id, checked)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  {idx < arr.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="accessibility" className="space-y-6 mt-0">
        <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800/50">
          <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-4">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <Accessibility className="h-5 w-5" />
              Accessibility Settings
            </h2>
            <p className="text-indigo-100 text-sm">Customize your experience for better accessibility</p>
          </div>
          <CardContent className="p-6">
            <div className="space-y-6">
              {[
                {
                  id: "highContrast",
                  title: "High Contrast",
                  description: "Increase contrast for better visibility"
                },
                {
                  id: "largeText",
                  title: "Large Text",
                  description: "Increase text size for better readability"
                }
              ].map((item, idx, arr) => (
                <div key={item.id}>
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                      <Label htmlFor={item.id} className="text-base font-medium">{item.title}</Label>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                      id={item.id}
                      checked={settings.accessibility[item.id]}
                      onCheckedChange={(checked) => updateSettings("accessibility", item.id, checked)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  {idx < arr.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  )
}