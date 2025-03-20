"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BookOpen, FileText, GraduationCap, LogOut, Search, Upload, User } from "lucide-react"
import { DashboardHeader } from "@/components/DashboardHeader"
import { DashboardNav } from "@/components/DashboardNav"
import DataTable from "@/components/DataTable"


export default function SupervisorDashboard() {
  const [searchQuery, setSearchQuery] = useState("")

  const pendingApprovals = [
    {
      id: 1,
      title: "Development of a Smart Attendance System using Facial Recognition",
      type: "Final Year Project",
      student: "James Wilson",
      submissionDate: "2023-06-15",
      status: "Pending",
    },
    {
      id: 2,
      title: "IoT-based Smart Home Automation System",
      type: "Final Year Project",
      student: "Emily Chen",
      submissionDate: "2023-06-12",
      status: "Pending",
    },
    {
      id: 3,
      title: "Neural Network Approach to Natural Language Processing",
      type: "Thesis",
      student: "Michael Brown",
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
      submissionDate: "2023-06-10",
      approvalDate: "2023-06-11",
      status: "Approved",
    },
    {
      id: 5,
      title: "Machine Learning Approach to Predict Student Performance",
      type: "Thesis",
      student: "Robert Johnson",
      submissionDate: "2023-05-28",
      approvalDate: "2023-05-30",
      status: "Approved",
    },
    {
      id: 6,
      title: "Cloud-based Student Information System",
      type: "Final Year Project",
      student: "Sarah Thompson",
      submissionDate: "2023-05-25",
      approvalDate: "2023-05-27",
      status: "Approved",
    },
  ]

  const filteredPending = pendingApprovals.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.type.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredApproved = approvedProjects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.type.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <DashboardNav isSupervisor={true} />
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Supervisor Dashboard</h1>
              <p className="text-muted-foreground">Review and approve student submissions.</p>
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
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingApprovals.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Projects</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedProjects.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Supervised</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingApprovals.length + approvedProjects.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
              </CardContent>
            </Card>
          </div>
          <div className="my-6">
            <div className="flex items-center gap-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
          </div>
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
              <TabsTrigger value="approved">Approved Projects</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="space-y-4">
              <DataTable
                data={filteredPending}
                columns={[
                  { header: "Title", accessorKey: "title" },
                  { header: "Type", accessorKey: "type" },
                  { header: "Student", accessorKey: "student" },
                  { header: "Submission Date", accessorKey: "submissionDate" },
                  {
                    header: "Status",
                    accessorKey: "status",
                    cell: (info) => (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        {info.getValue()}
                      </Badge>
                    ),
                  },
                  {
                    header: "Actions",
                    cell: () => (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="default" size="sm">
                          Approve
                        </Button>
                        <Button variant="destructive" size="sm">
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
                  { header: "Submission Date", accessorKey: "submissionDate" },
                  { header: "Approval Date", accessorKey: "approvalDate" },
                  {
                    header: "Status",
                    accessorKey: "status",
                    cell: (info) => (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        {info.getValue()}
                      </Badge>
                    ),
                  },
                  {
                    header: "Actions",
                    cell: () => (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm">
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