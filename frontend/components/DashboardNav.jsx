import Link from "next/link"
import { FileText, GraduationCap, Home, Settings, Upload, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export function DashboardNav({ isAdmin, isSupervisor }) {
  const baseItems = [
    {
      title: "Dashboard",
      href: isAdmin ? "/dashboard/admin" : isSupervisor ? "/dashboard/supervisor" : "/dashboard/student",
      icon: <Home className="mr-2 h-4 w-4" />,
    },
    {
      title: "Past Exams",
      href: "/past-exams",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      title: "Projects & Theses",
      href: "/projects",
      icon: <GraduationCap className="mr-2 h-4 w-4" />,
    },
    {
      title: "Upload",
      href: "/upload",
      icon: <Upload className="mr-2 h-4 w-4" />,
    },
  ]
  
  const adminItems = [
    {
      title: "User Management",
      href: "/users",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ]
  
  const supervisorItems = [
    {
      title: "Pending Approvals",
      href: "/approvals",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
  ]
  
  const items = isAdmin ? [...baseItems, ...adminItems] : isSupervisor ? [...baseItems, ...supervisorItems] : baseItems
  
  return (
    <nav className="grid items-start gap-2">
      {items.map((item, index) => (
        <Link key={index} href={item.href} className={cn(buttonVariants({ variant: "ghost" }), "justify-start")}>
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  )
}