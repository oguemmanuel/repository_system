import Link from "next/link"
import { BookOpen } from "lucide-react"
import { MobileNav } from "./MobileNav"


export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="font-bold">CUG Repository</span>
          </Link>
        </div>
        <MobileNav />
      </div>
    </header>
  )
}

