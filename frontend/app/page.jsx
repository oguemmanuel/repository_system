"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  BookOpen,
  FileText,
  GraduationCap,
  Search,
  Upload,
  Users,
  ChevronRight,
  Bookmark,
  Clock,
  Star,
} from "lucide-react"
import PublicSearch from "@/components/public-search"
import FeaturedProjects from "@/components/featured-projects"

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
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-[#00447c] to-[#003366] text-white shadow-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-full">
              <BookOpen className="h-6 w-6 text-[#00447c]" />
            </div>
            <span className="text-xl font-bold">CUG Repository</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-gray-200 border-b-2 border-white"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-gray-200 transition-colors hover:text-white hover:border-b-2 hover:border-gray-200"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-gray-200 transition-colors hover:text-white hover:border-b-2 hover:border-gray-200"
            >
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white hover:text-[#00447c] font-medium"
              >
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <div className="inline-block bg-blue-100 text-[#00447c] px-3 py-1 rounded-full text-sm font-medium mb-2">
                    Official Resource Platform
                  </div>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-[#00447c]">
                    Catholic University of Ghana Repository System
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed">
                    A centralized platform for storing, organizing, and accessing past exam questions, theses, and final
                    year projects.
                  </p>
                </div>
                <div className="flex flex-col gap-3 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="gap-2 bg-gradient-to-r from-[#00447c] to-[#003366] hover:opacity-90 shadow-md font-medium"
                    >
                      <Users className="h-4 w-4" />
                      Register Now
                    </Button>
                  </Link>
                  <Link href="#search-section">
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 border-[#00447c] text-[#00447c] hover:bg-[#e6f0fa] font-medium"
                    >
                      <Search className="h-4 w-4" />
                      Search Repository
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-1 mt-6 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Updated regularly with the latest academic resources</span>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Card className="w-full max-w-md shadow-lg border-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#00447c] to-[#003366] p-4 text-white">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Key Resources Available
                    </h3>
                  </div>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                      <div className="flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors">
                        <div className="rounded-full bg-[#e6f0fa] p-3 shadow-sm">
                          <FileText className="h-6 w-6 text-[#00447c]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Past Exam Questions</h3>
                          <p className="text-sm text-muted-foreground">
                            Access previous semester exam questions for better preparation.
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300 ml-auto" />
                      </div>
                      <div className="flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors">
                        <div className="rounded-full bg-[#e6f0fa] p-3 shadow-sm">
                          <GraduationCap className="h-6 w-6 text-[#00447c]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Theses & Projects</h3>
                          <p className="text-sm text-muted-foreground">
                            Browse through final year projects and theses for research inspiration.
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300 ml-auto" />
                      </div>
                      <div className="flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors">
                        <div className="rounded-full bg-[#e6f0fa] p-3 shadow-sm">
                          <Upload className="h-6 w-6 text-[#00447c]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Easy Submission</h3>
                          <p className="text-sm text-muted-foreground">
                            Submit your work securely with our streamlined upload process.
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300 ml-auto" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Public Search Section */}
        <section id="search-section" className="w-full py-16 md:py-24 bg-[#f5f7fb]">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center mb-12">
              <div className="inline-flex items-center justify-center rounded-full bg-[#e6f0fa] px-3 py-1 text-sm font-medium text-[#00447c]">
                <Search className="mr-1 h-3 w-3" /> Explore Resources
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-[#00447c]">Browse Repository</h2>
              <p className="max-w-[85%] text-muted-foreground text-lg">
                Explore our collection of academic resources freely.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <PublicSearch />
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-gray-500 mb-4">Want to access more features?</p>
              <Link href="/register">
                <Button className="gap-2 bg-[#00447c] hover:bg-[#003366]">
                  <Users className="h-4 w-4" />
                  Create an Account
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Projects Section */}
        {/* <section className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center mb-12">
              <div className="inline-flex items-center justify-center rounded-full bg-[#e6f0fa] px-3 py-1 text-sm font-medium text-[#00447c]">
                <Star className="mr-1 h-3 w-3" /> Featured Resources
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-[#00447c]">Featured Projects</h2>
              <p className="max-w-[85%] text-muted-foreground text-lg">
                Discover highlighted academic works from our repository.
              </p>
            </div>

            <FeaturedProjects />
          </div>
        </section> */}

        <section className="w-full py-16 md:py-24 bg-[#f5f7fb]">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-[#e6f0fa] px-3 py-1 text-sm font-medium text-[#00447c]">
                <Bookmark className="mr-1 h-3 w-3" /> System Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-[#00447c]">
                Features of our Repository System
              </h2>
              <p className="max-w-[85%] text-muted-foreground text-lg">
                Our system provides a comprehensive solution for managing academic resources at CUG.
              </p>
            </div>
            <div className="mx-auto grid justify-center gap-8 sm:grid-cols-2 md:grid-cols-4 mt-12">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="flex flex-col items-center text-center hover:shadow-lg transition-shadow border-0 shadow-md overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-[#00447c] to-[#003366] h-2 w-full"></div>
                  <CardContent className="flex flex-col items-center gap-4 p-6">
                    <div className="rounded-full bg-[#e6f0fa] p-4 shadow-sm">{feature.icon}</div>
                    <h3 className="text-lg font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-gradient-to-r from-[#00447c] to-[#003366] text-white py-10">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white p-1 rounded-full">
                  <BookOpen className="h-5 w-5 text-[#00447c]" />
                </div>
                <span className="text-xl font-bold">CUG Repository</span>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                A centralized platform for storing, organizing, and accessing academic resources.
              </p>
              <p className="text-sm">© 2024 Catholic University of Ghana. All rights reserved.</p>
            </div>

            <div>
              <h3 className="font-medium mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/" className="text-sm block hover:underline">
                  Home
                </Link>
                <Link href="/about" className="text-sm block hover:underline">
                  About
                </Link>
                <Link href="/contact" className="text-sm block hover:underline">
                  Contact
                </Link>
                <Link href="/register" className="text-sm block hover:underline">
                  Register
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Legal</h3>
              <div className="space-y-2">
                <Link href="/terms" className="text-sm block hover:underline">
                  Terms of Service
                </Link>
                <Link href="/privacy" className="text-sm block hover:underline">
                  Privacy Policy
                </Link>
                <Link href="/faq" className="text-sm block hover:underline">
                  FAQ
                </Link>
                <Link href="/help" className="text-sm block hover:underline">
                  Help Center
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
