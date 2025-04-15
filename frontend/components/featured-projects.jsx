"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, GraduationCap } from "lucide-react"

const FeaturedProjects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/resources/featured")
        if (response.ok) {
          const data = await response.json()
          setProjects(data.resources || [])
        }
      } catch (error) {
        console.error("Error fetching featured projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProjects()
  }, [])

  const getResourceTypeIcon = (type) => {
    switch (type) {
      case "past-exam":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "mini-project":
      case "final-project":
        return <GraduationCap className="h-4 w-4 text-green-500" />
      case "thesis":
        return <BookOpen className="h-4 w-4 text-purple-500" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getResourceTypeName = (type) => {
    switch (type) {
      case "past-exam":
        return "Past Exam"
      case "mini-project":
        return "Mini Project"
      case "final-project":
        return "Final Year Project"
      case "thesis":
        return "Thesis"
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00447c]"></div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No featured projects yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Check back later for featured academic projects and resources.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
              {getResourceTypeIcon(project.type)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline">{getResourceTypeName(project.type)}</Badge>
              <Badge variant="outline">{project.department}</Badge>
              {project.year && <Badge variant="outline">{project.year}</Badge>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-3">
            <div className="text-xs text-muted-foreground">
              By {project.uploadedByName || project.studentName || "Unknown"}
            </div>
            <Link href={`/resources/${project.id}`}>
              <Button variant="ghost" size="sm">
                View Details
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export default FeaturedProjects
