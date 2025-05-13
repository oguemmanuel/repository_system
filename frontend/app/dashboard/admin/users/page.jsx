"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Search, Plus, Pencil, Trash2, Users, UserPlus, Sliders } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import DataTable from "@/components/data-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function UsersPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [departments, setDepartments] = useState([])
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

  // Check authentication on component mount
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
        fetchDepartments()
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
      } else {
        toast.error("Failed to fetch users")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users/departments/all", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        if (data.departments && data.departments.length > 0) {
          setDepartments(data.departments)
        } else {
          // If no departments are returned, add some default ones
          setDepartments([
            "Computer Science",
            "Information Technology",
            "Business Administration",
            "Economics",
            "Mathematics",
            "Engineering",
            "Religious Studies",
            "Education",
          ])
        }
      }
    } catch (error) {
      console.error("Error fetching departments:", error)
      // Set default departments on error
      setDepartments([
        "Computer Science",
        "Information Technology",
        "Business Administration",
        "Economics",
        "Mathematics",
        "Engineering",
        "Religious Studies",
        "Education",
      ])
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      // Validate role-specific fields
      if (newUser.role === "student" && !newUser.indexNumber) {
        toast.error("Index number is required for students")
        return
      }

      if (newUser.role === "supervisor" && !newUser.department) {
        toast.error("Department is required for supervisors")
        return
      }

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
      // Validate role-specific fields
      if (selectedUser.role === "student" && !selectedUser.indexNumber) {
        toast.error("Index number is required for students")
        return
      }

      if (selectedUser.role === "supervisor" && !selectedUser.department) {
        toast.error("Department is required for supervisors")
        return
      }

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
          indexNumber: selectedUser.indexNumber,
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
          body: JSON.stringify({
            role: selectedUser.role,
            department: selectedUser.department,
          }),
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

  const filteredUsers = users.filter(
    (user) =>
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.indexNumber && user.indexNumber.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Statistics
  const totalUsers = users.length
  const activeUsers = users.filter(user => user.isActive).length
  const inactiveUsers = users.filter(user => !user.isActive).length
  const studentCount = users.filter(user => user.role === "student").length
  const supervisorCount = users.filter(user => user.role === "supervisor").length
  const adminCount = users.filter(user => user.role === "admin").length

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <DashboardHeader />
        <div className="container mx-auto flex-1 items-center justify-center flex">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <DashboardHeader />
      <div className="container mx-auto py-6 px-4 md:px-6 max-w-6xl">
        <Card className="border-none shadow-lg bg-white dark:bg-gray-900 mb-6">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold text-primary">User Management</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400 mt-1">
                  Manage users, roles and permissions
                </CardDescription>
              </div>
              <Button 
                className="gap-1 bg-primary hover:bg-primary/90 text-white" 
                onClick={() => setIsAddUserOpen(true)}
              >
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Statistics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Users</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalUsers}</p>
                    <div className="flex mt-1 space-x-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        {activeUsers} Active
                      </Badge>
                      <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                        {inactiveUsers} Inactive
                      </Badge>
                    </div>
                  </div>
                  <Users className="h-10 w-10 text-blue-500 dark:text-blue-400" />
                </CardContent>
              </Card>

              <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-900">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">User Roles</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{studentCount + supervisorCount + adminCount}</p>
                    <div className="flex mt-1 space-x-2">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {studentCount} Students
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {supervisorCount} Supervisors
                      </Badge>
                    </div>
                  </div>
                  <Sliders className="h-10 w-10 text-purple-500 dark:text-purple-400" />
                </CardContent>
              </Card>

              <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900 lg:col-span-1 md:col-span-2">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Administrators</p>
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{adminCount}</p>
                    <div className="mt-1">
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                        System Management
                      </Badge>
                    </div>
                  </div>
                  <Sliders className="h-10 w-10 text-amber-500 dark:text-amber-400" />
                </CardContent>
              </Card>
            </div>

            {/* Search Section */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name, email, role, department or index number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>

            {/* User Table */}
            <Card className="border border-gray-200 dark:border-gray-800 overflow-hidden">
              <CardContent className="p-0">
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
                          variant={
                            info.getValue() === "admin"
                              ? "destructive"
                              : info.getValue() === "supervisor"
                                ? "default"
                                : "secondary"
                          }
                          className={
                            info.getValue() === "admin"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                              : info.getValue() === "supervisor"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }
                        >
                          {info.getValue()}
                        </Badge>
                      ),
                    },
                    {
                      header: "Index Number",
                      accessorKey: "indexNumber",
                      cell: (info) => info.getValue() || "N/A",
                    },
                    {
                      header: "Department",
                      accessorKey: "department",
                      cell: (info) => info.getValue() || "N/A",
                    },
                    {
                      header: "Status",
                      accessorKey: "isActive",
                      cell: (info) => (
                        <Badge 
                          variant={info.getValue() ? "success" : "outline"}
                          className={
                            info.getValue() 
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" 
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }
                        >
                          {info.getValue() ? "Active" : "Inactive"}
                        </Badge>
                      ),
                    },
                    {
                      header: "Actions",
                      cell: (info) => (
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-300"
                            onClick={() => {
                              setSelectedUser({
                                ...info.row.original,
                                originalRole: info.row.original.role,
                              })
                              setIsEditUserOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button
                            variant={info.row.original.isActive ? "destructive" : "outline"}
                            size="sm"
                            className={
                              info.row.original.isActive 
                                ? "bg-amber-500 hover:bg-amber-600 border-amber-600" 
                                : "border-green-200 bg-green-50 hover:bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-300"
                            }
                            onClick={() => handleToggleUserStatus(info.row.original.id, info.row.original.isActive)}
                          >
                            {info.row.original.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 border-red-600"
                            onClick={() => handleDeleteUser(info.row.original.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />

                {filteredUsers.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <Users className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No users found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-md">
                      {searchQuery 
                        ? "Try adjusting your search terms or filters" 
                        : "Get started by adding your first user"}
                    </p>
                    {!searchQuery && (
                      <Button
                        className="mt-4 gap-1"
                        onClick={() => setIsAddUserOpen(true)}
                      >
                        <UserPlus className="h-4 w-4" />
                        Add User
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Add User Dialog */}
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900 border-0">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-xl font-bold text-primary">Add New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">Username</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    required
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                <Input
                  id="fullName"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  required
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-gray-700 dark:text-gray-300">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
                  <Label htmlFor="department" className="text-gray-700 dark:text-gray-300">
                    Department {newUser.role === "supervisor" ? "*" : ""}
                  </Label>
                  <Select
                    value={newUser.department}
                    onValueChange={(value) => setNewUser({ ...newUser, department: value })}
                    required={newUser.role === "supervisor"}
                  >
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {newUser.role === "student" && (
                  <div className="space-y-2">
                    <Label htmlFor="indexNumber" className="text-gray-700 dark:text-gray-300">Index Number *</Label>
                    <Input
                      id="indexNumber"
                      value={newUser.indexNumber}
                      onChange={(e) => setNewUser({ ...newUser, indexNumber: e.target.value })}
                      required={newUser.role === "student"}
                      className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                  </div>
                )}
                <div className={newUser.role === "student" ? "" : "col-span-2"}>
                  <Label htmlFor="phoneNumber" className="text-gray-700 dark:text-gray-300">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={newUser.phoneNumber}
                    onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>
              <DialogFooter className="pt-4 border-t">
                <Button type="submit" className="bg-primary hover:bg-primary/90">Create User</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        {selectedUser && (
          <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
            <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900 border-0">
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="text-xl font-bold text-primary">Edit User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditUser} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-fullName" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                  <Input
                    id="edit-fullName"
                    value={selectedUser.fullName}
                    onChange={(e) => setSelectedUser({ ...selectedUser, fullName: e.target.value })}
                    required
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-role" className="text-gray-700 dark:text-gray-300">Role</Label>
                    <Select
                      value={selectedUser.role}
                      onValueChange={(value) => setSelectedUser({ ...selectedUser, role: value })}
                    >
                      <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
                    <Label htmlFor="edit-department" className="text-gray-700 dark:text-gray-300">
                      Department {selectedUser.role === "supervisor" ? "*" : ""}
                    </Label>
                    <Select
                      value={selectedUser.department || ""}
                      onValueChange={(value) => setSelectedUser({ ...selectedUser, department: value })}
                      required={selectedUser.role === "supervisor"}
                    >
                      <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department} value={department}>
                            {department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {selectedUser.role === "student" && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-indexNumber" className="text-gray-700 dark:text-gray-300">Index Number *</Label>
                      <Input
                        id="edit-indexNumber"
                        value={selectedUser.indexNumber || ""}
                        onChange={(e) => setSelectedUser({ ...selectedUser, indexNumber: e.target.value })}
                        required={selectedUser.role === "student"}
                        className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  )}
                  <div className={selectedUser.role === "student" ? "" : "col-span-2"}>
                    <Label htmlFor="edit-phoneNumber" className="text-gray-700 dark:text-gray-300">Phone Number</Label>
                    <Input
                      id="edit-phoneNumber"
                      value={selectedUser.phoneNumber || ""}
                      onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })}
                      className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                  </div>
                </div>
                <DialogFooter className="pt-4 border-t">
                  <Button type="submit" className="bg-primary hover:bg-primary/90">Update User</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}