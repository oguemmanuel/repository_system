"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, LogOut, Search, User, Users } from "lucide-react"
import { DashboardHeader } from "@/components/DashboardHeader"
import { DashboardNav } from "@/components/DashboardNav"
import DataTable from "@/components/DataTable"

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("")

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

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredResources = resources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <DashboardNav isAdmin={true} />
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage users, resources, and system settings.</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="outline" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="icon">
                  <LogOut className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resources.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resources.filter((r) => r.status === "Pending").length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.filter((u) => u.status === "Active").length}</div>
              </CardContent>
            </Card>
          </div>
          <div className="my-6">
            <div className="flex items-center gap-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users or resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
          </div>
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
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
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
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
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        {info.row.original.status === "Pending" && (
                          <Button variant="default" size="sm">
                            Approve
                          </Button>
                        )}
                        <Button variant="destructive" size="sm">
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