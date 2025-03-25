import React from 'react'
import Link from "next/link"
import { BookOpen, Target, Users, Shield, Globe, Award } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-100 min-h-screen flex flex-col">
      {/* Header - Same as Homepage */}
      <header className="sticky top-0 z-50 w-full bg-white/80 shadow-md backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-extrabold text-blue-800">CUG Repository</span>
          </div>
          <nav className="flex flex-col md:flex-row items-center gap-6">
            <Link href="/" className="text-blue-700 hover:text-blue-900 transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-blue-700 hover:text-blue-900 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-blue-700 hover:text-blue-900 transition-colors">
              Contact
            </Link>
            <div className="flex gap-4">
              <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Log in
              </Link>
              <Link href="/register" className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                Register
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16 lg:py-24">
        {/* Mission & Vision Section */}
        <section className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h1 className="text-4xl font-bold text-blue-900 mb-6">About CUG Repository</h1>
            <p className="text-xl text-blue-700 mb-6">
              A digital platform dedicated to preserving, organizing, and democratizing academic knowledge at the Catholic University of Ghana.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Target className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">Our Mission</h3>
                  <p className="text-blue-700">
                    To provide a comprehensive, secure, and accessible digital repository that supports academic research, learning, and knowledge sharing.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Globe className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">Our Vision</h3>
                  <p className="text-blue-700">
                    To become a leading digital academic platform that empowers researchers, students, and educators through seamless knowledge access and collaboration.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">Key Statistics</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <h3 className="text-4xl font-extrabold text-blue-600">500+</h3>
                <p className="text-blue-700">Research Papers</p>
              </div>
              <div className="text-center">
                <h3 className="text-4xl font-extrabold text-blue-600">50+</h3>
                <p className="text-blue-700">Academic Departments</p>
              </div>
              <div className="text-center">
                <h3 className="text-4xl font-extrabold text-blue-600">1000+</h3>
                <p className="text-blue-700">Registered Users</p>
              </div>
              <div className="text-center">
                <h3 className="text-4xl font-extrabold text-blue-600">10+</h3>
                <p className="text-blue-700">Years of Academic Content</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white rounded-xl shadow-xl p-12 mb-16">
          <h2 className="text-3xl font-bold text-blue-900 text-center mb-12">Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-6 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Secure Storage</h3>
              <p className="text-blue-700">Advanced security protocols ensure the protection of sensitive academic resources and user data.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Collaborative Environment</h3>
              <p className="text-blue-700">Facilitate academic collaboration through easy resource sharing and community interaction.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Award className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Quality Assurance</h3>
              <p className="text-blue-700">Rigorous review processes ensure the academic integrity and relevance of repository content.</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-blue-600 text-white rounded-xl py-16 px-6">
          <h2 className="text-3xl font-bold mb-6">Join Our Academic Community</h2>
          <p className="text-xl mb-8">
            Discover, share, and collaborate on groundbreaking academic research and resources.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/register" 
              className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
            >
              Register Now
            </Link>
            <Link 
              href="/contact" 
              className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/20 transition-colors font-semibold"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </main>

      {/* Footer - Same as Homepage */}
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