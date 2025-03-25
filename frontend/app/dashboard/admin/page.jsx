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

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("users")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@cug.edu.gh",
      role: "Student",
      department: "Computer Science",
      registrationDate: "2023-09-01",
      status: "Active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@cug.edu.gh",
      role: "Student",
      department: "Computer Science",
      registrationDate: "2023-09-02",
      status: "Active",
    },
    {
      id: 3,
      name: "Dr. Michael Brown",
      email: "michael.brown@cug.edu.gh",
      role: "Faculty",
      department: "Computer Science",
      registrationDate: "2023-08-15",
      status: "Active",
    },
    {
      id: 4,
      name: "Prof. Sarah Johnson",
      email: "sarah.johnson@cug.edu.gh",
      role: "Supervisor",
      department: "Computer Science",
      registrationDate: "2023-08-10",
      status: "Active",
    },
    {
      id: 5,
      name: "Robert Wilson",
      email: "robert.wilson@cug.edu.gh",
      role: "Student",
      department: "Computer Science",
      registrationDate: "2023-09-05",
      status: "Inactive",
    },
  ]

  const resources = [
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
      title: "Development of a Smart Attendance System using Facial Recognition",
      type: "Final Year Project",
      department: "Computer Science",
      uploadedBy: "James Wilson",
      uploadDate: "2023-06-15",
      status: "Pending",
    },
    {
      id: 4,
      title: "Blockchain-based Secure Voting System",
      type: "Final Year Project",
      department: "Computer Science",
      uploadedBy: "Emily Davis",
      uploadDate: "2023-06-10",
      status: "Approved",
    },
    {
      id: 5,
      title: "Machine Learning Approach to Predict Student Performance",
      type: "Thesis",
      department: "Computer Science",
      uploadedBy: "Robert Johnson",
      uploadDate: "2023-05-28",
      status: "Approved",
    },
  ]

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [users, searchQuery])

  const filteredResources = useMemo(() => {
    return resources.filter(
      (resource) =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [resources, searchQuery])

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
              <DashboardNav isAdmin={true} />
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
          <DashboardNav isAdmin={true} />
        </aside>

        <main className="flex w-full flex-col overflow-hidden p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-blue-800 tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-blue-600">Manage users, resources, and system settings.</p>
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
              { title: "Total Users", icon: Users, value: users.length, color: "blue" },
              { title: "Total Resources", icon: BookOpen, value: resources.length, color: "green" },
              { title: "Pending Approvals", icon: FileText, value: resources.filter((r) => r.status === "Pending").length, color: "yellow" },
              { title: "Active Users", icon: User, value: users.filter((u) => u.status === "Active").length, color: "purple" }
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
                  placeholder="Search users or resources..."
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
            defaultValue="users" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="w-full bg-blue-100">
              <TabsTrigger 
                value="users" 
                className={cn(
                  "w-1/2 data-[state=active]:bg-blue-600 data-[state=active]:text-white",
                  activeTab === "users" ? "text-white bg-blue-600" : "text-blue-800"
                )}
              >
                Users
              </TabsTrigger>
              <TabsTrigger 
                value="resources" 
                className={cn(
                  "w-1/2 data-[state=active]:bg-blue-600 data-[state=active]:text-white",
                  activeTab === "resources" ? "text-white bg-blue-600" : "text-blue-800"
                )}
              >
                Resources
              </TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="space-y-4">
              <DataTable
                data={filteredUsers}
                columns={[
                  { header: "Name", accessorKey: "name" },
                  { header: "Email", accessorKey: "email" },
                  { header: "Role", accessorKey: "role" },
                  { header: "Department", accessorKey: "department" },
                  { header: "Registration Date", accessorKey: "registrationDate" },
                  { header: "Status", accessorKey: "status" },
                  {
                    header: "Actions",
                    cell: () => (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-blue-100 hover:bg-blue-200 text-blue-800">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" className="bg-red-500 hover:bg-red-600">
                          Delete
                        </Button>
                      </div>
                    ),
                  },
                ]}
              />
            </TabsContent>
            <TabsContent value="resources" className="space-y-4">
              <DataTable
                data={filteredResources}
                columns={[
                  { header: "Title", accessorKey: "title" },
                  { header: "Type", accessorKey: "type" },
                  { header: "Department", accessorKey: "department" },
                  { header: "Uploaded By", accessorKey: "uploadedBy" },
                  { header: "Upload Date", accessorKey: "uploadDate" },
                  { header: "Status", accessorKey: "status" },
                  {
                    header: "Actions",
                    cell: (info) => (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-blue-100 hover:bg-blue-200 text-blue-800">
                          View
                        </Button>
                        {info.row.original.status === "Pending" && (
                          <Button variant="default" size="sm" className="bg-green-500 hover:bg-green-600">
                            Approve
                          </Button>
                        )}
                        <Button variant="destructive" size="sm" className="bg-red-500 hover:bg-red-600">
                          Delete
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