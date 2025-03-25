"use client"

import React, { useState } from 'react'
import Link from "next/link"
import { BookOpen, Mail, Phone, MapPin, Send } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Implement form submission logic
    console.log('Form submitted:', formData)
    // Could add toast notification or modal for success
    alert('Message sent successfully!')
    
    // Reset form after submission
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    })
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-100 min-h-screen flex flex-col">
      {/* Header - Same as Previous Pages */}
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
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information Section */}
          <div className="bg-white rounded-xl shadow-2xl p-8 h-fit">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Address</h3>
                  <p className="text-blue-700">
                    Catholic University of Ghana, 
                    Fiapre Campus, Sunyani, 
                    Bono Region, Ghana
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Phone</h3>
                  <p className="text-blue-700">
                    +233 (0) 54 123 4567
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Email</h3>
                  <p className="text-blue-700">
                    repository@cug.edu.gh
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-blue-900 mb-2">Full Name</label>
                <input 
                  type="text" 
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-blue-900 mb-2">Email Address</label>
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email address"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-blue-900 mb-2">Subject</label>
                <input 
                  type="text" 
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter message subject"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-blue-900 mb-2">Message</label>
                <textarea 
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your message here"
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Send className="h-5 w-5" />
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Location Section */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-blue-900 text-center mb-8">Our Location</h2>
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.2412195160235!2d-2.3329367!3d7.3584653!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sCatholic%20University%20of%20Ghana!5e0!3m2!1sen!2sgh!4v1683900000000!5m2!1sen!2sgh" 
              width="100%" 
              height="450" 
              style={{ border: 0 }}
              allowFullScreen 
              loading="lazy"
            ></iframe>
          </div>
        </section>
      </main>

      {/* Footer - Same as Previous Pages */}
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