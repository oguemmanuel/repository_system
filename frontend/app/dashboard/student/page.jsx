"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, GraduationCap, LogOut, Search, Upload, User } from "lucide-react"
import { DashboardNav } from "@/components/DashboardNav"
import { DashboardHeader } from "@/components/DashboardHeader"
import ResourceCard from "@/components/ResourceCard"


export default function StudentDashboard() {
  const [searchQuery, setSearchQuery] = useState("")

  const pastExams = [
    {
      id: 1,
      title: "Introduction to Computer Science - Final Exam 2023",
      type: "Past Exam",
      department: "Computer Science",
      uploadedBy: "Dr. John Smith",
      uploadDate: "2023-12-15",
    },
    {
      id: 2,
      title: "Data Structures and Algorithms - Midterm 2023",
      type: "Past Exam",
      department: "Computer Science",
      uploadedBy: "Dr. Sarah Johnson",
      uploadDate: "2023-10-20",
    },
    {
      id: 3,
      title: "Database Management Systems - Final Exam 2023",
      type: "Past Exam",
      department: "Computer Science",
      uploadedBy: "Prof. Michael Brown",
      uploadDate: "2023-12-10",
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
    },
    {
      id: 2,
      title: "Blockchain-based Secure Voting System",
      type: "Final Year Project",
      department: "Computer Science",
      uploadedBy: "Emily Davis",
      uploadDate: "2023-06-10",
    },
    {
      id: 3,
      title: "Machine Learning Approach to Predict Student Performance",
      type: "Thesis",
      department: "Computer Science",
      uploadedBy: "Robert Johnson",
      uploadDate: "2023-05-28",
    },
  ]

  const filteredExams = pastExams.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.department.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.department.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <DashboardNav />
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, Student! Access your academic resources here.</p>
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
                <CardTitle className="text-sm font-medium">Available Past Exams</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pastExams.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Projects</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Downloads</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Uploads</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
              </CardContent>
            </Card>
          </div>
          <div className="my-6">
            <div className="flex items-center gap-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
          </div>
          <Tabs defaultValue="past-exams" className="space-y-4">
            <TabsList>
              <TabsTrigger value="past-exams">Past Exams</TabsTrigger>
              <TabsTrigger value="projects">Projects & Theses</TabsTrigger>
            </TabsList>
            <TabsContent value="past-exams" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredExams.length > 0 ? (
                  filteredExams.map((exam) => <ResourceCard key={exam.id} resource={exam} />)
                ) : (
                  <div className="col-span-full text-center py-6">
                    <p className="text-muted-foreground">No past exams found matching your search.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="projects" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => <ResourceCard key={project.id} resource={project} />)
                ) : (
                  <div className="col-span-full text-center py-6">
                    <p className="text-muted-foreground">No projects or theses found matching your search.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}