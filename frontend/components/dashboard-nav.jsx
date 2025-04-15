"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Users, BookOpen, FileText, Upload, Settings, User, LogOut } from "lucide-react"

export default function DashboardNav({ isAdmin, isSupervisor, isStudent }) {
  const pathname = usePathname()

  const adminNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard/admin",
      icon: Home,
    },
    {
      title: "Users",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      title: "Resources",
      href: "/dashboard/admin/resources",
      icon: BookOpen,
    },
    {
      title: "Pending Approvals",
      href: "/dashboard/admin/pending",
      icon: FileText,
    },
    {
      title: "Upload Resource",
      href: "/upload",
      icon: Upload,
    },
    {
      title: "Settings",
      href: "/dashboard/admin/settings",
      icon: Settings,
    },
    {
      title: "My Profile",
      href: "/dashboard/admin/profile",
      icon: User,
    },
  ]

  const supervisorNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard/supervisor",
      icon: Home,
    },
    {
      title: "Pending Approvals",
      href: "/dashboard/supervisor/pending",
      icon: FileText,
    },
    {
      title: "Approved Projects",
      href: "/dashboard/supervisor/approved",
      icon: BookOpen,
    },
    {
      title: "Upload Resource",
      href: "/upload",
      icon: Upload,
    },
    {
      title: "Settings",
      href: "/dashboard/supervisor/settings",
      icon: Settings,
    },
    {
      title: "My Profile",
      href: "/dashboard/supervisor/profile",
      icon: User,
    },
  ]

  const studentNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard/student",
      icon: Home,
    },
    {
      title: "My Resources",
      href: "/dashboard/student/resources",
      icon: BookOpen,
    },
    {
      title: "Upload Resource",
      href: "/upload",
      icon: Upload,
    },
    {
      title: "Settings",
      href: "/dashboard/student/settings",
      icon: Settings,
    },
    {
      title: "My Profile",
      href: "/dashboard/student/profile",
      icon: User,
    },
  ]

  const navItems = isAdmin ? adminNavItems : isSupervisor ? supervisorNavItems : studentNavItems

  return (
    <nav className="grid items-start gap-2 py-4">
      {navItems.map((item, index) => (
        <Link key={index} href={item.href}>
          <Button
            variant={pathname === item.href ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              pathname === item.href ? "bg-[#00447c] text-white hover:bg-[#003366] hover:text-white" : "",
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Button>
        </Link>
      ))}

      <Link href="/logout">
        <Button variant="ghost" className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 mt-4">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </Link>
    </nav>
  )
}
