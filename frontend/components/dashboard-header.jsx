"use client"

import Link from "next/link"
import { BookOpen } from "lucide-react"
import NotificationSystem from "./NotificationSystem"

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b px-4 bg-blue-700 text-white">
      <div className="flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <span className="font-bold">CUG Repository</span>
        </Link>
        <NotificationSystem />
      </div>
    </header>
  )
}