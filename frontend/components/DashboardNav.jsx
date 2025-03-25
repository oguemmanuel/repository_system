import Link from "next/link"
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Settings, 
  FileText, 
  HelpCircle, 
  Upload
} from "lucide-react"

export function DashboardNav({ isAdmin = false }) {
  const adminMenuItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      label: "Resources",
      href: "/admin/resources",
      icon: BookOpen,
    },
    {
      label: "Approvals",
      href: "/admin/approvals",
      icon: FileText,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  const studentMenuItems = [
    {
      label: "Dashboard",
      href: "/student/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Courses",
      href: "/student/courses",
      icon: BookOpen,
    },
    {
      label: "Resources",
      href: "/student/resources",
      icon: FileText,
    },
    {
      label: "Upload",
      href: "/student/uploads",
      icon: Upload,
    }
  ]

  const menuItems = isAdmin ? adminMenuItems : studentMenuItems

  return (
    <nav className="bg-blue-800 text-white h-full px-4 pt-4 rounded-lg shadow-lg">
      <div className="space-y-2">
        {menuItems.map((item) => (
          <Link 
            key={item.label}
            href={item.href}
            className="flex items-center p-3 rounded-lg hover:bg-blue-700 transition-colors group"
          >
            <item.icon 
              className="mr-3 h-6 w-6 text-white group-hover:scale-110 transition-transform" 
            />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}