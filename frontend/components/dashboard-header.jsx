"use client"

import Link from "next/link"
import { BookOpen } from "lucide-react"

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#00447c] text-white">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <span className="font-bold">CUG Repository</span>
        </Link>
      </div>
    </header>
  )
}
