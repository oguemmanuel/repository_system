"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { BookOpen, FileText, LogOut, Search, User, Users, Plus, Pencil, Trash2, Shield, Activity } from 'lucide-react'
import DashboardNav from "@/components/dashboard-nav"
import DataTable from "@/components/data-table"
import DashboardHeader from "@/components/dashboard-header"
import { Textarea } from "@/components/ui/textarea"

const AdminDashboard = () => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState([])
  const [resources, setResources] = useState([])
  const [pendingResources, setPendingResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalResources: 0,
    pendingApprovals: 0,
    activeUsers: 0,
  })

  // New user form state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    indexNumber: "",
    phoneNumber: "",
    role: "student",
    department: "",
  })

  // Add a new state for the approval dialog and reason
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [approvalReason, setApprovalReason] = useState("")
  const [selectedResourceForApproval, setSelectedResourceForApproval] = useState(null)

  // Fetch data on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include",
        })

        if (!response.ok) {
          router.push("/login")
          return
        }

        const data = await response.json()

        if (data.user.role !== "admin") {
          router.push(`/dashboard/${data.user.role}`)
          return
        }

        fetchData()
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch users
      const usersResponse = await fetch("http://localhost:5000/api/users", {
        credentials: "include",
      })

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users || [])
        setStats((prev) => ({ ...prev, totalUsers: usersData.total || 0 }))
      }

      // Fetch resources
      const resourcesResponse = await fetch("http://localhost:5000/api/resources", {
        credentials: "include",
      })

      if (resourcesResponse.ok) {
        const resourcesData = await resourcesResponse.json()
        setResources(resourcesData.resources || [])
        setStats((prev) => ({ ...prev, totalResources: resourcesData.total || 0 }))
      }

      // Fetch pending resources
      const pendingResponse = await fetch("http://localhost:5000/api/resources/pending/admin", {
        credentials: "include",
      })

      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json()
        setPendingResources(pendingData.resources || [])
        setStats((prev) => ({ ...prev, pendingApprovals: pendingData.count || 0 }))
      }

      // Fetch active users count
      const activeUsersResponse = await fetch("http://localhost:5000/api/users?isActive=true", {
        credentials: "include",
      })

      if (activeUsersResponse.ok) {
        const activeUsersData = await activeUsersResponse.json()
        setStats((prev) => ({ ...prev, activeUsers: activeUsersData.total || 0 }))
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newUser),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create user")
      }

      toast.success("User created successfully")
      setIsAddUserOpen(false)
      setNewUser({
        username: "",
        email: "",
        password: "",
        fullName: "",
        indexNumber: "",
        phoneNumber: "",
        role: "student",
        department: "",
      })
      fetchData() // Refresh data
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error(error.message || "Failed to create user")
    }
  }

  const handleEditUser = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:5000/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fullName: selectedUser.fullName,
          phoneNumber: selectedUser.phoneNumber,
          department: selectedUser.department,
          role: selectedUser.role,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update user")
      }

      // Update role if changed
      if (selectedUser.originalRole !== selectedUser.role) {
        const roleResponse = await fetch(`http://localhost:5000/api/users/${selectedUser.id}/role`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ role: selectedUser.role }),
        })

        if (!roleResponse.ok) {
          const errorData = await roleResponse.json()
          throw new Error(errorData.message || "Failed to update user role")
        }
      }

      toast.success("User updated successfully")
      setIsEditUserOpen(false)
      setSelectedUser(null)
      fetchData() // Refresh data
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error(error.message || "Failed to update user")
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete user")
      }

      toast.success("User deleted successfully")
      fetchData() // Refresh data
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error(error.message || "Failed to delete user")
    }
  }

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to ${currentStatus ? "deactivate" : "activate"} user`)
      }

      toast.success(`User ${currentStatus ? "deactivated" : "activated"} successfully`)
      fetchData() // Refresh data
    } catch (error) {
      console.error("Error toggling user status:", error)
      toast.error(error.message || `Failed to ${currentStatus ? "deactivate" : "activate"} user`)
    }
  }

  // Update the handleApproveResource function to include the approval reason
  const handleApproveResource = async (resourceId) => {
    if (!approvalReason) {
      toast.error("Please provide a reason for approval")
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/resources/${resourceId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          status: "approved",
          approvalReason: approvalReason 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to approve resource")
      }

      toast.success("Resource approved successfully")
      setIsApproveDialogOpen(false)
      setApprovalReason("")
      setSelectedResourceForApproval(null)
      fetchData() // Refresh data
    } catch (error) {
      console.error("Error approving resource:", error)
      toast.error(error.message || "Failed to approve resource")
    }
  }

  const handleRejectResource = async (resourceId, reason) => {
    if (!reason) {
      reason = prompt("Please provide a reason for rejection:")
      if (!reason) return // User cancelled
    }

    try {
      const response = await fetch(`http://localhost:5000/api/resources/${resourceId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: "rejected",
          rejectionReason: reason,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to reject resource")
      }

      toast.success("Resource rejected successfully")
      fetchData() // Refresh data
    } catch (error) {
      console.error("Error rejecting resource:", error)
      toast.error(error.message || "Failed to reject resource")
    }
  }

  const handleDeleteResource = async (resourceId) => {
    if (!confirm("Are you sure you want to delete this resource? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/resources/${resourceId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete resource")
      }

      toast.success("Resource deleted successfully")
      fetchData() // Refresh data
    } catch (error) {
      console.error("Error deleting resource:", error)
      toast.error(error.message || "Failed to delete resource")
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredResources = resources.filter(
    (resource) =>
      resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.uploadedByName?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredPendingResources = pendingResources.filter(
    (resource) =>
      resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.uploadedByName?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Get current time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center">
          <Activity className="h-12 w-12 text-blue-600 animate-pulse mb-4" />
          <p className="text-lg font-medium text-blue-700">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <div className="bg-gradient-to-b from-blue-800 to-blue-900 text-white rounded-lg shadow-lg p-4 h-full">
            <div className="mb-6 mt-2">
              <div className="flex items-center space-x-2 px-2">
                <Shield className="h-6 w-6 text-blue-200" />
                <h2 className="text-xl font-bold text-blue-100">Admin Portal</h2>
              </div>
              <div className="mt-3 px-2">
                <p className="text-sm text-blue-300">Administrator</p>
                <p className="text-xs text-blue-400">Full system control</p>
              </div>
            </div>
            <DashboardNav isAdmin={true} />
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-blue-800">
                {getGreeting()}, Administrator
              </h1>
              <p className="text-blue-600">Manage users, resources, and system settings.</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="outline" size="icon" className="border-blue-300 text-blue-700 hover:bg-blue-100 hover:text-blue-800">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/logout">
                <Button variant="outline" size="icon" className="border-blue-300 text-blue-700 hover:bg-blue-100 hover:text-blue-800">
                  <LogOut className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-md bg-gradient-to-br from-violet-50 to-violet-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-violet-900">Total Users</CardTitle>
                <Users className="h-4 w-4 text-violet-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-violet-800">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-900">Total Resources</CardTitle>
                <BookOpen className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-800">{stats.totalResources}</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-amber-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-900">Pending Approvals</CardTitle>
                <FileText className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-800">{stats.pendingApprovals}</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-800">{stats.activeUsers}</div>
              </CardContent>
            </Card>
          </div>
          <div className="my-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 bg-white rounded-lg p-2 shadow-sm">
                <Search className="h-4 w-4 text-blue-600" />
                <Input
                  placeholder="Search users or resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              {activeTab === "users" && (
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 gap-1">
                      <Plus className="h-4 w-4" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddUser} className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={newUser.fullName}
                          onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select
                            value={newUser.role}
                            onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="supervisor">Supervisor</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Input
                            id="department"
                            value={newUser.department}
                            onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                            required={newUser.role === "supervisor"}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="indexNumber">Index Number</Label>
                          <Input
                            id="indexNumber"
                            value={newUser.indexNumber}
                            onChange={(e) => setNewUser({ ...newUser, indexNumber: e.target.value })}
                            required={newUser.role === "student"}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                          <Input
                            id="phoneNumber"
                            value={newUser.phoneNumber}
                            onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          required
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                          Create User
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
          <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-blue-100">
              <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Users</TabsTrigger>
              <TabsTrigger value="resources" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Resources</TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">Pending Approvals</TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="space-y-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <DataTable
                  data={filteredUsers}
                  columns={[
                    { header: "Name", accessorKey: "fullName" },
                    { header: "Email", accessorKey: "email" },
                    {
                      header: "Role",
                      accessorKey: "role",
                      cell: (info) => (
                        <Badge
                          className={
                            info.getValue() === "admin"
                              ? "bg-violet-100 text-violet-800 hover:bg-violet-200"
                              : info.getValue() === "supervisor"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                          }
                        >
                          {info.getValue()}
                        </Badge>
                      ),
                    },
                    { header: "Department", accessorKey: "department" },
                    {
                      header: "Status",
                      accessorKey: "isActive",
                      cell: (info) => (
                        <Badge
                          className={info.getValue() ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "bg-rose-100 text-rose-800 hover:bg-rose-200"}
                        >
                          {info.getValue() ? "Active" : "Inactive"}
                        </Badge>
                      ),
                    },
                    {
                      header: "Actions",
                      cell: (info) => (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                            onClick={() => {
                              setSelectedUser({
                                ...info.row.original,
                                originalRole: info.row.original.role,
                              })
                              setIsEditUserOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={info.row.original.isActive ? "destructive" : "outline"}
                            size="sm"
                            className={info.row.original.isActive ? "bg-rose-600 hover:bg-rose-700" : "border-slate-300 text-slate-700 hover:bg-slate-50"}
                            onClick={() => handleToggleUserStatus(info.row.original.id, info.row.original.isActive)}
                          >
                            {info.row.original.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-rose-300 text-rose-700 hover:bg-rose-50"
                            onClick={() => handleDeleteUser(info.row.original.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>

              {/* Edit User Dialog */}
              {selectedUser && (
                <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditUser} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-fullName">Full Name</Label>
                        <Input
                          id="edit-fullName"
                          value={selectedUser.fullName}
                          onChange={(e) => setSelectedUser({ ...selectedUser, fullName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-role">Role</Label>
                          <Select
                            value={selectedUser.role}
                            onValueChange={(value) => setSelectedUser({ ...selectedUser, role: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="supervisor">Supervisor</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-department">Department</Label>
                          <Input
                            id="edit-department"
                            value={selectedUser.department || ""}
                            onChange={(e) => setSelectedUser({ ...selectedUser, department: e.target.value })}
                            required={selectedUser.role === "supervisor"}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-phoneNumber">Phone Number</Label>
                        <Input
                          id="edit-phoneNumber"
                          value={selectedUser.phoneNumber || ""}
                          onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                          Update User
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </TabsContent>
            <TabsContent value="resources" className="space-y-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <DataTable
                  data={filteredResources}
                  columns={[
                    { header: "Title", accessorKey: "title" },
                    {
                      header: "Type",
                      accessorKey: "type",
                      cell: (info) => {
                        const type = info.getValue()
                        let displayType = type

                        if (type === "past-exam") displayType = "Past Exam"
                        else if (type === "mini-project") displayType = "Mini Project"
                        else if (type === "final-project") displayType = "Final Year Project"
                        else if (type === "thesis") displayType = "Thesis"

                        return displayType
                      },
                    },
                    { header: "Department", accessorKey: "department" },
                    { header: "Uploaded By", accessorKey: "uploadedByName" },
                    {
                      header: "Status",
                      accessorKey: "status",
                      cell: (info) => (
                        <Badge
                          className={
                            info.getValue() === "approved"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : info.getValue() === "rejected"
                                ? "bg-rose-100 text-rose-800 hover:bg-rose-200"
                                : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          }
                        >
                          {info.getValue()}
                        </Badge>
                      ),
                    },
                    {
                      header: "Actions",
                      cell: (info) => (
                        <div className="flex gap-2">
                          <Link href={`/resources/${info.row.original.id}`}>
                            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                              View
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-rose-300 text-rose-700 hover:bg-rose-50"
                            onClick={() => handleDeleteResource(info.row.original.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </TabsContent>
            <TabsContent value="pending" className="space-y-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <DataTable
                  data={filteredPendingResources}
                  columns={[
                    { header: "Title", accessorKey: "title" },
                    {
                      header: "Type",
                      accessorKey: "type",
                      cell: (info) => {
                        const type = info.getValue()
                        let displayType = type

                        if (type === "past-exam") displayType = "Past Exam"
                        else if (type === "mini-project") displayType = "Mini Project"
                        else if (type === "final-project") displayType = "Final Year Project"
                        else if (type === "thesis") displayType = "Thesis"

                        return displayType
                      },
                    },
                    { header: "Department", accessorKey: "department" },
                    { header: "Uploaded By", accessorKey: "uploadedByName" },
                    { header: "Student", accessorKey: "studentName" },
                    { header: "Supervisor", accessorKey: "supervisorName" },
                    {
                      header: "Actions",
                      cell: (info) => (
                        <div className="flex gap-2">
                          <Link href={`/resources/${info.row.original.id}`}>
                            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                              View
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                            onClick={() => {
                              setSelectedResourceForApproval(info.row.original)
                              setIsApproveDialogOpen(true)
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-rose-300 text-rose-700 hover:bg-rose-50"
                            onClick={() => handleRejectResource(info.row.original.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      {/* Approval Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Resource</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            handleApproveResource(selectedResourceForApproval?.id)
          }} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="approvalReason">Reason for Approval</Label>
              <Textarea
                id="approvalReason"
                placeholder="Please provide a reason for approving this resource"
                value={approvalReason}
                onChange={(e) => setApprovalReason(e.target.value)}
                required
                rows={4}
                className="border-slate-300 focus:border-emerald-400 focus:ring-emerald-400"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                Approve Resource
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminDashboard
