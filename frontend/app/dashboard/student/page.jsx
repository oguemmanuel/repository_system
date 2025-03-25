"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, GraduationCap, LogOut, Search, Upload, User, Users, X, Menu, X as XIcon } from "lucide-react"
import { DashboardHeader } from "@/components/DashboardHeader"
import { DashboardNav } from "@/components/DashboardNav"
import DataTable from "@/components/DataTable"
import { cn } from "@/lib/utils"

export default function StudentDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("past-exams")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const pastExams = [
    {
      id: 1,
      title: "Introduction to Computer Science - Final Exam 2023",
      type: "Past Exam",
      department: "Computer Science",
      uploadedBy: "Dr. John Smith",
      uploadDate: "2023-12-15",
      status: "Approved",
    },
    {
      id: 2,
      title: "Data Structures and Algorithms - Midterm 2023",
      type: "Past Exam",
      department: "Computer Science",
      uploadedBy: "Dr. Sarah Johnson",
      uploadDate: "2023-10-20",
      status: "Approved",
    },
    {
      id: 3,
      title: "Database Management Systems - Final Exam 2023",
      type: "Past Exam",
      department: "Computer Science",
      uploadedBy: "Prof. Michael Brown",
      uploadDate: "2023-12-10",
      status: "Approved",
    },
  ]

  const projects = [
    {
      id: 1,
      title: "Development of a Smart Attendance System using Facial Recognition",
      type: "Final Year Project",
      department: "Computer Science",
      uploadedBy: "James Wilson",
      uploadDate: "2023-06-15",
      status: "Pending",
    },
    {
      id: 2,
      title: "Blockchain-based Secure Voting System",
      type: "Final Year Project",
      department: "Computer Science",
      uploadedBy: "Emily Davis",
      uploadDate: "2023-06-10",
      status: "Approved",
    },
    {
      id: 3,
      title: "Machine Learning Approach to Predict Student Performance",
      type: "Thesis",
      department: "Computer Science",
      uploadedBy: "Robert Johnson",
      uploadDate: "2023-05-28",
      status: "Approved",
    },
  ]

  const filteredExams = useMemo(() => {
    return pastExams.filter(
      (exam) =>
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [pastExams, searchQuery])

  const filteredProjects = useMemo(() => {
    return projects.filter(
      (project) =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [projects, searchQuery])

  return (
    <div className="flex min-h-screen flex-col bg-blue-50">
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg animate-slide-in-left">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <XIcon className="h-6 w-6" />
              </Button>
            </div>
            <div className="p-4">
              <DashboardNav />
            </div>
          </div>
        </div>
      )}

      <DashboardHeader />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-0 lg:grid-cols-[240px_1fr] pt-16">
        {/* Mobile Menu Toggle */}
        <div className="md:hidden absolute top-16 left-4 z-40">
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-blue-100 hover:bg-blue-200"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6 text-blue-700" />
          </Button>
        </div>

        {/* Desktop Sidebar */}
        <aside className="-ml-2 hidden h-full w-full shrink-0 md:block">
          <DashboardNav />
        </aside>

        <main className="flex w-full flex-col overflow-hidden p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-blue-800 tracking-tight">Student Dashboard</h1>
              <p className="text-sm text-blue-600">Access your academic resources and track your progress.</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="outline" size="icon" className="bg-blue-100 hover:bg-blue-200">
                  <User className="h-4 w-4 text-blue-700" />
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="icon" className="bg-red-100 hover:bg-red-200">
                  <LogOut className="h-4 w-4 text-red-700" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { title: "Past Exams", icon: FileText, value: pastExams.length, color: "blue" },
              { title: "Projects", icon: GraduationCap, value: projects.length, color: "green" },
              { title: "Downloads", icon: BookOpen, value: 12, color: "yellow" },
              { title: "Uploads", icon: Upload, value: 2, color: "purple" }
            ].map(({ title, icon: Icon, value, color }) => (
              <Card key={title} className={`bg-${color}-100 border-${color}-200 hover:shadow-md transition-shadow`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`text-sm font-medium text-${color}-800`}>{title}</CardTitle>
                  <Icon className={`h-4 w-4 text-${color}-600`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold text-${color}-900`}>{value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mb-6 relative">
            <div className="flex items-center gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                <Input
                  placeholder="Search exams or projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-blue-200 focus:ring-2 focus:ring-blue-300"
                />
                {searchQuery && (
                  <X 
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700" 
                    onClick={() => setSearchQuery("")} 
                  />
                )}
              </div>
            </div>
          </div>

          <Tabs 
            defaultValue="past-exams" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="w-full bg-blue-100">
              <TabsTrigger 
                value="past-exams" 
                className={cn(
                  "w-1/2 data-[state=active]:bg-blue-600 data-[state=active]:text-white",
                  activeTab === "past-exams" ? "text-white bg-blue-600" : "text-blue-800"
                )}
              >
                Past Exams
              </TabsTrigger>
              <TabsTrigger 
                value="projects" 
                className={cn(
                  "w-1/2 data-[state=active]:bg-blue-600 data-[state=active]:text-white",
                  activeTab === "projects" ? "text-white bg-blue-600" : "text-blue-800"
                )}
              >
                Projects & Theses
              </TabsTrigger>
            </TabsList>
            <TabsContent value="past-exams" className="space-y-4">
              <DataTable
                data={filteredExams}
                columns={[
                  { header: "Title", accessorKey: "title" },
                  { header: "Type", accessorKey: "type" },
                  { header: "Department", accessorKey: "department" },
                  { header: "Uploaded By", accessorKey: "uploadedBy" },
                  { header: "Upload Date", accessorKey: "uploadDate" },
                  { header: "Status", accessorKey: "status" },
                  {
                    header: "Actions",
                    cell: () => (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-blue-100 hover:bg-blue-200 text-blue-800">
                          Download
                        </Button>
                      </div>
                    ),
                  },
                ]}
              />
            </TabsContent>
            <TabsContent value="projects" className="space-y-4">
              <DataTable
                data={filteredProjects}
                columns={[
                  { header: "Title", accessorKey: "title" },
                  { header: "Type", accessorKey: "type" },
                  { header: "Department", accessorKey: "department" },
                  { header: "Uploaded By", accessorKey: "uploadedBy" },
                  { header: "Upload Date", accessorKey: "uploadDate" },
                  { header: "Status", accessorKey: "status" },
                  {
                    header: "Actions",
                    cell: () => (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-blue-100 hover:bg-blue-200 text-blue-800">
                          View
                        </Button>
                      </div>
                    ),
                  },
                ]}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}