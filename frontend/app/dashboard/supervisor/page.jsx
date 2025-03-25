"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, LogOut, Search, User, Users, Filter, X, Menu, X as XIcon } from "lucide-react"
import { DashboardHeader } from "@/components/DashboardHeader"
import { DashboardNav } from "@/components/DashboardNav"
import DataTable from "@/components/DataTable"
import { cn } from "@/lib/utils"

export default function SupervisorDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("pending")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const pendingApprovals = [
    {
      id: 1,
      title: "Development of a Smart Attendance System using Facial Recognition",
      type: "Final Year Project",
      student: "James Wilson",
      department: "Computer Science",
      submissionDate: "2023-06-15",
      status: "Pending",
    },
    {
      id: 2,
      title: "IoT-based Smart Home Automation System",
      type: "Final Year Project",
      student: "Emily Chen",
      department: "Computer Science", 
      submissionDate: "2023-06-12",
      status: "Pending",
    },
    {
      id: 3,
      title: "Neural Network Approach to Natural Language Processing",
      type: "Thesis",
      student: "Michael Brown",
      department: "Computer Science",
      submissionDate: "2023-06-10",
      status: "Pending",
    },
  ]

  const approvedProjects = [
    {
      id: 4,
      title: "Blockchain-based Secure Voting System",
      type: "Final Year Project",
      student: "Emily Davis",
      department: "Computer Science",
      submissionDate: "2023-06-10",
      approvalDate: "2023-06-11",
      status: "Approved",
    },
    {
      id: 5,
      title: "Machine Learning Approach to Predict Student Performance",
      type: "Thesis",
      student: "Robert Johnson",
      department: "Computer Science",
      submissionDate: "2023-05-28",
      approvalDate: "2023-05-30",
      status: "Approved",
    },
    {
      id: 6,
      title: "Cloud-based Student Information System",
      type: "Final Year Project",
      student: "Sarah Thompson",
      department: "Computer Science",
      submissionDate: "2023-05-25",
      approvalDate: "2023-05-27",
      status: "Approved",
    },
  ]

  const filteredPending = useMemo(() => {
    return pendingApprovals.filter(
      (project) =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.department.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [pendingApprovals, searchQuery])

  const filteredApproved = useMemo(() => {
    return approvedProjects.filter(
      (project) =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.department.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [approvedProjects, searchQuery])

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
              <DashboardNav isSupervisor={true} />
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
          <DashboardNav isSupervisor={true} />
        </aside>

        <main className="flex w-full flex-col overflow-hidden p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-blue-800 tracking-tight">Supervisor Dashboard</h1>
              <p className="text-sm text-blue-600">Review and approve student submissions.</p>
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
              { title: "Pending Approvals", icon: FileText, value: pendingApprovals.length, color: "yellow" },
              { title: "Approved Projects", icon: BookOpen, value: approvedProjects.length, color: "green" },
              { title: "Total Supervised", icon: Users, value: pendingApprovals.length + approvedProjects.length, color: "blue" },
              { title: "This Month", icon: User, value: 5, color: "purple" }
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
                  placeholder="Search projects..."
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
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-blue-100 hover:bg-blue-200"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="h-4 w-4 text-blue-700" />
              </Button>
            </div>
            {isFilterOpen && (
              <div className="mt-4 p-4 bg-white border border-blue-100 rounded-lg shadow-sm">
                {/* Advanced filter options can be added here */}
                <p className="text-sm text-blue-600">Advanced filtering coming soon!</p>
              </div>
            )}
          </div>

          <Tabs 
            defaultValue="pending" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="w-full bg-blue-100">
              <TabsTrigger 
                value="pending" 
                className={cn(
                  "w-1/2 data-[state=active]:bg-blue-600 data-[state=active]:text-white",
                  activeTab === "pending" ? "text-white bg-blue-600" : "text-blue-800"
                )}
              >
                Pending Approvals
              </TabsTrigger>
              <TabsTrigger 
                value="approved" 
                className={cn(
                  "w-1/2 data-[state=active]:bg-blue-600 data-[state=active]:text-white",
                  activeTab === "approved" ? "text-white bg-blue-600" : "text-blue-800"
                )}
              >
                Approved Projects
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="space-y-4">
              <DataTable
                data={filteredPending}
                columns={[
                  { header: "Title", accessorKey: "title" },
                  { header: "Type", accessorKey: "type" },
                  { header: "Student", accessorKey: "student" },
                  { header: "Department", accessorKey: "department" },
                  { header: "Submission Date", accessorKey: "submissionDate" },
                  { header: "Status", accessorKey: "status" },
                  {
                    header: "Actions",
                    cell: () => (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-blue-100 hover:bg-blue-200 text-blue-800">
                          View
                        </Button>
                        <Button variant="default" size="sm" className="bg-green-500 hover:bg-green-600">
                          Approve
                        </Button>
                        <Button variant="destructive" size="sm" className="bg-red-500 hover:bg-red-600">
                          Reject
                        </Button>
                      </div>
                    ),
                  },
                ]}
              />
            </TabsContent>
            <TabsContent value="approved" className="space-y-4">
              <DataTable
                data={filteredApproved}
                columns={[
                  { header: "Title", accessorKey: "title" },
                  { header: "Type", accessorKey: "type" },
                  { header: "Student", accessorKey: "student" },
                  { header: "Department", accessorKey: "department" },
                  { header: "Submission Date", accessorKey: "submissionDate" },
                  { header: "Approval Date", accessorKey: "approvalDate" },
                  { header: "Status", accessorKey: "status" },
                  {
                    header: "Actions",
                    cell: () => (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-blue-100 hover:bg-blue-200 text-blue-800">
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="bg-blue-100 hover:bg-blue-200 text-blue-800">
                          Download
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