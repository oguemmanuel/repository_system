import Link from "next/link"
import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function DashboardHeader() {
  return (
    <header className="bg-blue-700 text-white py-4 px-6 flex items-center justify-between fixed top-0 left-0 w-full z-10 shadow-lg">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-xl font-bold text-white">
          CUG Portal
        </Link>
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300" />
          <Input 
            placeholder="Search anything..." 
            className="pl-10 bg-blue-600 text-white border-none focus:ring-2 focus:ring-blue-400 placeholder-blue-300"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="text-white hover:bg-blue-600">
          <Bell className="h-6 w-6" />
        </Button>
        <Avatar>
          {/* <AvatarImage src="/placeholder-avatar.jpg" /> */}
          <AvatarFallback className="bg-blue-600 text-white">AD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}