"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, FileText, GraduationCap, Search, Upload, Users, User, LogOut, X } from "lucide-react"
import PublicSearch from "@/components/public-search"
import FeaturedProjects from "@/components/featured-projects"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const features = [
  {
    title: "Centralized Storage",
    description: "Store all academic resources in one secure location for easy access.",
    icon: <BookOpen className="h-6 w-6 text-[#00447c]" />,
  },
  {
    title: "Advanced Search",
    description: "Find resources quickly with our powerful search functionality.",
    icon: <Search className="h-6 w-6 text-[#00447c]" />,
  },
  {
    title: "User Management",
    description: "Role-based access control for students, faculty, and administrators.",
    icon: <Users className="h-6 w-6 text-[#00447c]" />,
  },
  {
    title: "File Management",
    description: "Upload, download, and organize files with ease.",
    icon: <FileText className="h-6 w-6 text-[#00447c]" />,
  },
]

const Home = () => {
  const [user, setUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: "GET",
        credentials: "include",
      })

      // Clear local storage regardless of API response
      localStorage.removeItem("user")
      localStorage.removeItem("userSettings")

      if (response.ok) {
        toast.success("Logged out successfully")
      } else {
        console.error("Logout API error:", response.statusText)
        toast.error("There was an issue with the logout process, but you've been logged out locally")
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("There was an issue with the logout process, but you've been logged out locally")
    } finally {
      // Close modal and reset user state
      setIsModalOpen(false)
      setUser(null)
      // Refresh the page to reflect logged out state
      router.refresh()
    }
  }

  // Function to get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.fullName) return "U"

    const nameParts = user.fullName.split(" ")
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase()

    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
  }

  // Function to get role display name
  const getRoleDisplayName = (role) => {
    if (!role) return "User"

    switch (role) {
      case "student":
        return "Student"
      case "supervisor":
        return "Supervisor"
      case "admin":
        return "Administrator"
      default:
        return role.charAt(0).toUpperCase() + role.slice(1)
    }
  }

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isModalOpen && !event.target.closest(".user-modal") && !event.target.closest(".avatar-button")) {
        setIsModalOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isModalOpen])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-[#00447c] text-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-bold">CUG Repository</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-gray-200">
              Home
            </Link>
            <Link href="/about" className="text-sm font-medium text-gray-200 transition-colors hover:text-white">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium text-gray-200 transition-colors hover:text-white">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  className="avatar-button flex items-center gap-2 hover:bg-[#003366] px-3 py-2 rounded-md transition-colors"
                  onClick={() => setIsModalOpen(!isModalOpen)}
                >
                  <span className="hidden sm:inline text-sm font-medium">
                    {user.fullName ? user.fullName.split(" ")[0] : "User"}
                  </span>
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.fullName || "User"} />
                    <AvatarFallback className="bg-[#003366]">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </button>

                {isModalOpen && (
                  <div className="user-modal absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">User Profile</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.fullName || "User"} />
                          <AvatarFallback className="bg-[#00447c] text-white">{getUserInitials()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{user.fullName || "User"}</p>
                          <p className="text-sm text-gray-500">{getRoleDisplayName(user.role)}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm text-gray-900">{user.email}</p>
                        </div>

                        {user.indexNumber && (
                          <div>
                            <p className="text-xs text-gray-500">Index Number</p>
                            <p className="text-sm text-gray-900">{user.indexNumber}</p>
                          </div>
                        )}

                        {user.department && (
                          <div>
                            <p className="text-xs text-gray-500">Department</p>
                            <p className="text-sm text-gray-900">{user.department}</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 space-y-2">
                        <Link href={`/dashboard/${user.role}`} className="w-full">
                          <Button variant="outline" className="w-full justify-start gap-2">
                            <User className="h-4 w-4" />
                            Dashboard
                          </Button>
                        </Link>
                        <Button variant="destructive"  className="w-full justify-start gap-2 text-black" onClick={handleLogout}>
                          <LogOut className="h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="bg-transparent text-white border-white hover:bg-white hover:text-[#00447c]"
                  >
                    Log in
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-16 bg-[#f5f5f5]">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-[#00447c]">
                    Catholic University of Ghana Repository System
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    A centralized platform for storing, organizing, and accessing past exam questions, theses, and final
                    year projects.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  {!user ? (
                    <Link href="/register">
                      <Button size="lg" className="gap-1 bg-[#00447c] hover:bg-[#003366]">
                        <Users className="h-4 w-4" />
                        Register Now
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/dashboard/${user.role}`}>
                      <Button size="lg" className="gap-1 bg-[#00447c] hover:bg-[#003366]">
                        <User className="h-4 w-4" />
                        Go to Dashboard
                      </Button>
                    </Link>
                  )}
                  <Link href="#search-section">
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-1 border-[#00447c] text-[#00447c] hover:bg-[#e6f0fa]"
                    >
                      <Search className="h-4 w-4" />
                      Search Repository
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Card className="w-full max-w-md">
                  <CardContent className="p-6">
                    <div className="grid gap-4">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-[#e6f0fa] p-3">
                          <FileText className="h-6 w-6 text-[#00447c]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Past Exam Questions</h3>
                          <p className="text-sm text-muted-foreground">
                            Access previous semester exam questions for better preparation.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-[#e6f0fa] p-3">
                          <GraduationCap className="h-6 w-6 text-[#00447c]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Theses & Projects</h3>
                          <p className="text-sm text-muted-foreground">
                            Browse through final year projects and theses for research inspiration.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-[#e6f0fa] p-3">
                          <Upload className="h-6 w-6 text-[#00447c]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Easy Submission</h3>
                          <p className="text-sm text-muted-foreground">
                            Submit your work securely with our streamlined upload process.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Projects Section */}
        <section className="w-full py-12 md:py-16 bg-white">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl text-[#00447c]">Featured Projects</h2>
              <p className="max-w-[85%] text-muted-foreground">
                Explore our collection of outstanding academic projects and resources.
              </p>
            </div>

            <FeaturedProjects />
          </div>
        </section>

        {/* Public Search Section */}
        <section id="search-section" className="w-full py-12 md:py-16 bg-[#f5f5f5]">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl text-[#00447c]">Browse Repository</h2>
              <p className="max-w-[85%] text-muted-foreground">
                Explore our collection of academic resources without logging in.
              </p>
            </div>

            <PublicSearch />
          </div>
        </section>

        <section className="w-full py-12 md:py-16 bg-white">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl text-[#00447c]">
                Features of our Repository System
              </h2>
              <p className="max-w-[85%] text-muted-foreground">
                Our system provides a comprehensive solution for managing academic resources at CUG.
              </p>
            </div>
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8 xl:gap-10 mt-8">
              {features.map((feature) => (
                <Card key={feature.title} className="flex flex-col items-center text-center">
                  <CardContent className="flex flex-col items-center gap-2 p-6">
                    <div className="rounded-full bg-[#e6f0fa] p-3">{feature.icon}</div>
                    <h3 className="text-lg font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-[#00447c] text-white py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm">© 2024 Catholic University of Ghana. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm hover:underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-sm hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
