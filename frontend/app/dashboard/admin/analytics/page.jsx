"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, LineChart, PieChart } from "@/components/charts"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { DownloadCloud, Eye, FileText, Users } from "lucide-react"

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState("30days")

  // Mock data for charts
  const resourceViewsData = [
    { name: "Jan", "Past Exams": 120, Projects: 80, Theses: 40 },
    { name: "Feb", "Past Exams": 150, Projects: 100, Theses: 60 },
    { name: "Mar", "Past Exams": 180, Projects: 120, Theses: 70 },
    { name: "Apr", "Past Exams": 220, Projects: 150, Theses: 90 },
    { name: "May", "Past Exams": 280, Projects: 180, Theses: 110 },
    { name: "Jun", "Past Exams": 310, Projects: 200, Theses: 130 },
  ]

  const resourceDownloadsData = [
    { name: "Jan", "Past Exams": 80, Projects: 50, Theses: 20 },
    { name: "Feb", "Past Exams": 100, Projects: 70, Theses: 30 },
    { name: "Mar", "Past Exams": 130, Projects: 90, Theses: 40 },
    { name: "Apr", "Past Exams": 150, Projects: 110, Theses: 60 },
    { name: "May", "Past Exams": 190, Projects: 140, Theses: 80 },
    { name: "Jun", "Past Exams": 220, Projects: 160, Theses: 90 },
  ]

  const resourceTypeData = [
    { name: "Past Exams", value: 310 },
    { name: "Projects", value: 200 },
    { name: "Theses", value: 130 },
  ]

  const departmentDistributionData = [
    { name: "Computer Science", value: 250 },
    { name: "Mathematics", value: 150 },
    { name: "Engineering", value: 240 },
  ]

  const userActivityData = [
    { name: "Mon", "Active Users": 45 },
    { name: "Tue", "Active Users": 52 },
    { name: "Wed", "Active Users": 49 },
    { name: "Thu", "Active Users": 63 },
    { name: "Fri", "Active Users": 58 },
    { name: "Sat", "Active Users": 48 },
    { name: "Sun", "Active Users": 40 },
  ]

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
              <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Monitor repository usage and user engagement.</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="year">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,845</div>
                <p className="text-xs text-muted-foreground">+18.2% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                <DownloadCloud className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,257</div>
                <p className="text-xs text-muted-foreground">+12.5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">358</div>
                <p className="text-xs text-muted-foreground">+7.4% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Uploads</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85</div>
                <p className="text-xs text-muted-foreground">+24.3% from last month</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="mt-6 space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Resource Views</CardTitle>
                    <CardDescription>Number of views per resource type over time</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <LineChart data={resourceViewsData} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Resource Downloads</CardTitle>
                    <CardDescription>Number of downloads per resource type over time</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <LineChart data={resourceDownloadsData} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="resources" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Resource Type Distribution</CardTitle>
                    <CardDescription>Distribution of resources by type</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <PieChart data={resourceTypeData} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Department Distribution</CardTitle>
                    <CardDescription>Distribution of resources by department</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <PieChart data={departmentDistributionData} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>Daily active users over the past week</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <BarChart data={userActivityData} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

export default AnalyticsDashboard