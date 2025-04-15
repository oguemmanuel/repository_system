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
import { Search, Plus, Pencil, Trash2 } from "lucide-react"
import DashboardNav from "@/components/dashboard-nav"
import DashboardHeader from "@/components/dashboard-header"
import DataTable from "@/components/data-table"

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

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <div className="container flex-1 items-center justify-center flex">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

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
              <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
              <p className="text-muted-foreground">Manage users, roles, and permissions.</p>
            </div>
          </div>

          <div className="my-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <Button className="gap-1" onClick={() => setIsAddUserOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
                <DialogContent className="sm:max-w-[600px]">
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
                        <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
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
                        <Label htmlFor="department">Department {newUser.role === "supervisor" ? "*" : ""}</Label>
                        <Select
                          value={newUser.department}
                          onValueChange={(value) => setNewUser({ ...newUser, department: value })}
                          required={newUser.role === "supervisor"}
                        >
                          <SelectTrigger>
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
                          <Label htmlFor="indexNumber">Index Number *</Label>
                          <Input
                            id="indexNumber"
                            value={newUser.indexNumber}
                            onChange={(e) => setNewUser({ ...newUser, indexNumber: e.target.value })}
                            required={newUser.role === "student"}
                          />
                        </div>
                      )}
                      <div className={newUser.role === "student" ? "" : "col-span-2"}>
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
                      <Button type="submit">Create User</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

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
                  <Badge variant={info.getValue() ? "success" : "outline"}>
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
                      onClick={() => handleToggleUserStatus(info.row.original.id, info.row.original.isActive)}
                    >
                      {info.row.original.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(info.row.original.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />

          {/* Edit User Dialog */}
          {selectedUser && (
            <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
              <DialogContent className="sm:max-w-[600px]">
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
                      <Label htmlFor="edit-department">
                        Department {selectedUser.role === "supervisor" ? "*" : ""}
                      </Label>
                      <Select
                        value={selectedUser.department || ""}
                        onValueChange={(value) => setSelectedUser({ ...selectedUser, department: value })}
                        required={selectedUser.role === "supervisor"}
                      >
                        <SelectTrigger>
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
                        <Label htmlFor="edit-indexNumber">Index Number *</Label>
                        <Input
                          id="edit-indexNumber"
                          value={selectedUser.indexNumber || ""}
                          onChange={(e) => setSelectedUser({ ...selectedUser, indexNumber: e.target.value })}
                          required={selectedUser.role === "student"}
                        />
                      </div>
                    )}
                    <div className={selectedUser.role === "student" ? "" : "col-span-2"}>
                      <Label htmlFor="edit-phoneNumber">Phone Number</Label>
                      <Input
                        id="edit-phoneNumber"
                        value={selectedUser.phoneNumber || ""}
                        onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Update User</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </main>
      </div>
    </div>
  )
}
