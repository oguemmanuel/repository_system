"use client"

import React, { useState } from 'react'
import Link from "next/link"
import { BookOpen, FileText, Search, Users, Menu, X } from "lucide-react"

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-100 min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full bg-white/80 shadow-md backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-extrabold text-blue-800">CUG Repository</span>
            </div>
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-blue-600 hover:text-blue-800"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-col md:flex-row items-center gap-6">
            <Link href="/" className="text-blue-700 hover:text-blue-900 transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-blue-700 hover:text-blue-900 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-blue-700 hover:text-blue-900 transition-colors">
              Contact
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login" className="px-4  bg-blue-600 text-white rounded-lg hover:bg-blue-700 py-2 transition-colors">
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                Register
              </Link>
            </div>
          </nav>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <nav className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg">
              <div className="container mx-auto px-4 py-4 space-y-4">
                <Link 
                  href="/" 
                  className="block text-blue-700 hover:text-blue-900 transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Home
                </Link>
                <Link 
                  href="/about" 
                  className="block text-blue-700 hover:text-blue-900 transition-colors"
                  onClick={toggleMobileMenu}
                >
                  About
                </Link>
                <Link 
                  href="/contact" 
                  className="block text-blue-700 hover:text-blue-900 transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Contact
                </Link>
                <div className="flex flex-col gap-4">
                  <Link 
                    href="/login" 
                    className="block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={toggleMobileMenu}
                  >
                    Log in
                  </Link>
                  <Link 
                    href="/register" 
                    className="block text-center px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    onClick={toggleMobileMenu}
                  >
                    Register
                  </Link>
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Rest of the component remains the same as the original */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-900 leading-tight">
                Catholic University of Ghana Repository
              </h1>
              <p className="text-xl text-blue-700 opacity-80">
                A comprehensive platform for storing, organizing, and accessing academic resources efficiently.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/register" 
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Users className="h-5 w-5" />
                  Register Now
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-2xl p-8">
              <div className="space-y-6">
                {features.map((feature) => (
                  <div key={feature.title} className="flex items-center gap-4 bg-blue-50 p-4 rounded-lg">
                    <div className="bg-blue-200 p-3 rounded-full">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">{feature.title}</h3>
                      <p className="text-blue-700 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white py-8 border-t">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-blue-700 mb-4 md:mb-0">
            © 2024 Catholic University of Ghana. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: "Centralized Storage",
    description: "Store all academic resources in one secure location for easy access.",
    icon: <BookOpen className="h-6 w-6 text-blue-600" />,
  },
  {
    title: "Advanced Search",
    description: "Find resources quickly with our powerful search functionality.",
    icon: <Search className="h-6 w-6 text-blue-600" />,
  },
  {
    title: "User Management",
    description: "Role-based access control for students, faculty, and administrators.",
    icon: <Users className="h-6 w-6 text-blue-600" />,
  },
  {
    title: "File Management",
    description: "Upload, download, and organize files with ease.",
    icon: <FileText className="h-6 w-6 text-blue-600" />,
  }
]