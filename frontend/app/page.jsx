import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, FileText, GraduationCap, Search, Upload, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-bold">CUG Repository</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-muted/50 to-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                    Catholic University of Ghana Repository System
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    A centralized platform for storing, organizing, and accessing past exam questions, theses, and final
                    year projects.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button size="lg" className="gap-1">
                      <Users className="h-4 w-4" />
                      Register Now
                    </Button>
                  </Link>
                  <Link href="/search">
                    <Button size="lg" variant="outline" className="gap-1">
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
                        <div className="rounded-full bg-primary/10 p-3">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Past Exam Questions</h3>
                          <p className="text-sm text-muted-foreground">
                            Access previous semester exam questions for better preparation.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary/10 p-3">
                          <GraduationCap className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Theses & Projects</h3>
                          <p className="text-sm text-muted-foreground">
                            Browse through final year projects and theses for research inspiration.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary/10 p-3">
                          <Upload className="h-6 w-6 text-primary" />
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
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Features of our Repository System
              </h2>
              <p className="max-w-[85%] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our system provides a comprehensive solution for managing academic resources at CUG.
              </p>
            </div>
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8 xl:gap-10 mt-8">
              {features.map((feature) => (
                <Card key={feature.title} className="flex flex-col items-center text-center">
                  <CardContent className="flex flex-col items-center gap-2 p-6">
                    <div className="rounded-full bg-primary/10 p-3">{feature.icon}</div>
                    <h3 className="text-lg font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-background py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">© 2024 Catholic University of Ghana. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: "Centralized Storage",
    description: "Store all academic resources in one secure location for easy access.",
    icon: <BookOpen className="h-6 w-6 text-primary" />,
  },
  {
    title: "Advanced Search",
    description: "Find resources quickly with our powerful search functionality.",
    icon: <Search className="h-6 w-6 text-primary" />,
  },
  {
    title: "User Management",
    description: "Role-based access control for students, faculty, and administrators.",
    icon: <Users className="h-6 w-6 text-primary" />,
  },
  {
    title: "File Management",
    description: "Upload, download, and organize files with ease.",
    icon: <FileText className="h-6 w-6 text-primary" />,
  },
]

