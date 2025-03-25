"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, ArrowLeft, CheckCircle2, User, Mail, Phone, Lock, School, Briefcase, Shield, Key } from "lucide-react"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    index_number: "",
    phone_number: "",
    password: "",
    confirm_password: "",
    user_type: "student",
    registration_code: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showRegistrationCode, setShowRegistrationCode] = useState(false)

  // Show registration code field when admin or supervisor is selected
  useEffect(() => {
    setShowRegistrationCode(formData.user_type === "admin" || formData.user_type === "supervisor")
  }, [formData.user_type])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    if (name === "password") {
      // Calculate password strength
      let strength = 0
      if (value.length > 8) strength += 1
      if (/[A-Z]/.test(value)) strength += 1
      if (/[0-9]/.test(value)) strength += 1
      if (/[^A-Za-z0-9]/.test(value)) strength += 1
      setPasswordStrength(strength)
    }
  }

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, user_type: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Client-side validations
    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match", {
        description: "Please ensure both passwords are the same.",
      })
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      toast.error("Weak Password", {
        description: "Password must be at least 8 characters long.",
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          index_number: formData.index_number,
          phone_number: formData.phone_number,
          password: formData.password,
          user_type: formData.user_type,
          registration_code: formData.registration_code
        }),
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      // Registration successful
      toast.success("Registration Successful", {
        description: data.message || "Account created successfully.",
      })
      
      // Redirect to login page
      router.push("/login")
    } catch (error) {
      toast.error("Registration Failed", {
        description: error.message || "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getUserIcon = () => {
    switch(formData.user_type) {
      case "student": return <School className="h-5 w-5 text-blue-500" />
      case "admin": return <Shield className="h-5 w-5 text-red-500" />
      case "supervisor": return <Briefcase className="h-5 w-5 text-green-500" />
      default: return <User className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container flex flex-col items-center justify-center px-4">
        <Link
          href="/"
          className="mb-8 inline-flex items-center justify-center rounded-full bg-white p-2 text-sm font-medium shadow-sm transition-all hover:bg-gray-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
        
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 text-center">
            <p className="mt-2 text-gray-600">Create an account to access all features</p>
          </div>
          
          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
              <CardDescription className="text-blue-100">Enter your details below to get started</CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="grid gap-4 pt-6">
                <div className="grid gap-2">
                  <Label htmlFor="full_name" className="flex items-center text-sm font-medium text-gray-700">
                    <User className="mr-2 h-4 w-4 text-gray-400" />
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700">
                    <Mail className="mr-2 h-4 w-4 text-gray-400" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m.example@cug.edu.gh"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="index_number" className="flex items-center text-sm font-medium text-gray-700">
                      <School className="mr-2 h-4 w-4 text-gray-400" />
                      Index Number
                    </Label>
                    <Input
                      id="index_number"
                      name="index_number"
                      placeholder="UGR0202020XXX"
                      value={formData.index_number}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phone_number" className="flex items-center text-sm font-medium text-gray-700">
                      <Phone className="mr-2 h-4 w-4 text-gray-400" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      placeholder="+233 XX XXX XXXX"
                      value={formData.phone_number}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="user_type" className="flex items-center text-sm font-medium text-gray-700">
                    {getUserIcon()}
                    <span className="ml-2">User Type</span>
                  </Label>
                  <Select value={formData.user_type} onValueChange={handleSelectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent className={"bg-slate-800 text-white px-4 py-3 rounded-md shadow-lg cursor-pointer"}>
                      <SelectItem className={"text-white cursor-pointer"} value="student">Student</SelectItem>
                      <SelectItem className={"text-white cursor-pointer"} value="admin">Admin</SelectItem>
                      <SelectItem className={"text-white cursor-pointer"} value="supervisor">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {showRegistrationCode && (
                  <div className="grid gap-2">
                    <Label htmlFor="registration_code" className="flex items-center text-sm font-medium text-gray-700">
                      <Key className="mr-2 h-4 w-4 text-gray-400" />
                      Registration Code
                    </Label>
                    <Input
                      id="registration_code"
                      name="registration_code"
                      type="password"
                      placeholder={`Enter ${formData.user_type} registration code`}
                      value={formData.registration_code}
                      onChange={handleChange}
                      required={showRegistrationCode}
                    />
                  </div>
                )}
                
                <div className="grid gap-2">
                  <Label htmlFor="password" className="flex items-center text-sm font-medium text-gray-700">
                    <Lock className="mr-2 h-4 w-4 text-gray-400" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  
                  {formData.password && (
                    <div className="mt-1">
                      <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div 
                          className={`${
                            passwordStrength === 0 ? "bg-red-500" : 
                            passwordStrength === 1 ? "bg-orange-500" : 
                            passwordStrength === 2 ? "bg-yellow-500" : 
                            passwordStrength === 3 ? "bg-green-500" : "bg-emerald-500"
                          } transition-all duration-300`}
                          style={{ width: `${(passwordStrength / 4) * 100}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {passwordStrength === 0 && "Very weak password"}
                        {passwordStrength === 1 && "Weak password"}
                        {passwordStrength === 2 && "Medium strength password"}
                        {passwordStrength === 3 && "Strong password"}
                        {passwordStrength === 4 && "Very strong password"}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="confirm_password" className="flex items-center text-sm font-medium text-gray-700">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-gray-400" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                  />
                  
                  {formData.password && formData.confirm_password && (
                    <div className="mt-1 flex items-center">
                      {formData.password === formData.confirm_password ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                          <span className="text-xs text-green-500">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                          <span className="text-xs text-red-500">Passwords don't match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-6 text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 text-white cursor-pointer mt-4" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}