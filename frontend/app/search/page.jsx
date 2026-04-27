"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { SearchIcon, Filter, BookOpen, FileText, GraduationCap } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import ResourceCard from "@/components/resource-card"
import DashboardNav from "@/components/dashboard-nav"

// Mock data for resources
const allResources = [
  {
    id: 1,
    title: "Introduction to Computer Science - Final Exam 2023",
    type: "Past Exam",
    department: "Computer Science",
    uploadedBy: "Dr. John Smith",
    uploadDate: "2023-12-15",
    year: "2023",
    semester: "First",
    tags: ["Programming", "Algorithms", "Data Structures"],
  },
  {
    id: 2,
    title: "Data Structures and Algorithms - Midterm 2023",
    type: "Past Exam",
    department: "Computer Science",
    uploadedBy: "Dr. Sarah Johnson",
    uploadDate: "2023-10-20",
    year: "2023",
    semester: "First",
    tags: ["Algorithms", "Data Structures"],
  },
  {
    id: 3,
    title: "Database Management Systems - Final Exam 2023",
    type: "Past Exam",
    department: "Computer Science",
    uploadedBy: "Prof. Michael Brown",
    uploadDate: "2023-12-10",
    year: "2023",
    semester: "First",
    tags: ["Database", "SQL", "Normalization"],
  },
  {
    id: 4,
    title: "Development of a Smart Attendance System using Facial Recognition",
    type: "Final Year Project",
    department: "Computer Science",
    uploadedBy: "James Wilson",
    uploadDate: "2023-06-15",
    year: "2023",
    semester: "Second",
    tags: ["Facial Recognition", "AI", "Computer Vision"],
  },
  {
    id: 5,
    title: "Blockchain-based Secure Voting System",
    type: "Final Year Project",
    department: "Computer Science",
    uploadedBy: "Emily Davis",
    uploadDate: "2023-06-10",
    year: "2023",
    semester: "Second",
    tags: ["Blockchain", "Security", "Voting Systems"],
  },
  {
    id: 6,
    title: "Machine Learning Approach to Predict Student Performance",
    type: "Thesis",
    department: "Computer Science",
    uploadedBy: "Robert Johnson",
    uploadDate: "2023-05-28",
    year: "2023",
    semester: "Second",
    tags: ["Machine Learning", "Education", "Predictive Analytics"],
  },
  {
    id: 7,
    title: "Calculus I - Final Exam 2023",
    type: "Past Exam",
    department: "Mathematics",
    uploadedBy: "Dr. Lisa Wong",
    uploadDate: "2023-12-18",
    year: "2023",
    semester: "First",
    tags: ["Calculus", "Differentiation", "Integration"],
  },
  {
    id: 8,
    title: "Digital Signal Processing - Midterm 2023",
    type: "Past Exam",
    department: "Engineering",
    uploadedBy: "Prof. David Chen",
    uploadDate: "2023-10-25",
    year: "2023",
    semester: "First",
    tags: ["Signal Processing", "Fourier Transform", "Filters"],
  },
]

// Suggestions based on popular searches
const searchSuggestions = [
  "Machine Learning",
  "Database",
  "Final Exam",
  "Computer Vision",
  "Blockchain",
  "Algorithms",
  "2023",
  "Computer Science",
]

const AdvancedSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState(allResources)
  const [activeTab, setActiveTab] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    department: "",
    type: "",
    year: "",
    semester: "",
    tags: [],
  })
  const [suggestions, setSuggestions] = useState([])

  // Get unique values for filter options
  const departments = Array.from(new Set(allResources.map((r) => r.department)))
  const resourceTypes = Array.from(new Set(allResources.map((r) => r.type)))
  const years = Array.from(new Set(allResources.map((r) => r.year)))
  const semesters = Array.from(new Set(allResources.map((r) => r.semester)))
  const allTags = Array.from(new Set(allResources.flatMap((r) => r.tags)))

  // Update search results when search query or filters change
  useEffect(() => {
    let results = allResources

    // Filter by search query
    if (searchQuery) {
      results = results.filter(
        (resource) =>
          resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Filter by tab
    if (activeTab !== "all") {
      results = results.filter((resource) =>
        activeTab === "exams"
          ? resource.type.includes("Exam")
          : activeTab === "projects"
            ? resource.type.includes("Project")
            : activeTab === "theses"
              ? resource.type.includes("Thesis")
              : true,
      )
    }

    // Apply additional filters
    if (filters.department) {
      results = results.filter((resource) => resource.department === filters.department)
    }
    if (filters.type) {
      results = results.filter((resource) => resource.type === filters.type)
    }
    if (filters.year) {
      results = results.filter((resource) => resource.year === filters.year)
    }
    if (filters.semester) {
      results = results.filter((resource) => resource.semester === filters.semester)
    }
    if (filters.tags.length > 0) {
      results = results.filter((resource) => filters.tags.some((tag) => resource.tags.includes(tag)))
    }

    setSearchResults(results)
  }, [searchQuery, activeTab, filters])

  // Update suggestions when search query changes
  useEffect(() => {
    if (searchQuery.length > 1) {
      const matchedSuggestions = searchSuggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setSuggestions(matchedSuggestions.slice(0, 5))
    } else {
      setSuggestions([])
    }
  }, [searchQuery])

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion)
    setSuggestions([])
  }

  const handleTagToggle = (tag) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const clearFilters = () => {
    setFilters({
      department: "",
      type: "",
      year: "",
      semester: "",
      tags: [],
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <DashboardNav />
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Advanced Search</h1>
              <p className="text-muted-foreground">Find resources using our powerful search and filtering options</p>
            </div>
            <Button variant="outline" className="gap-1" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="flex items-center">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for resources..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
                {suggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
                    <ul className="py-1">
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="cursor-pointer px-4 py-2 hover:bg-muted"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <Button className="ml-2">Search</Button>
            </div>

            {/* Popular tags */}
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Popular:</span>
              {searchSuggestions.slice(0, 5).map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSuggestionClick(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={filters.department}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, department: value }))}
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map((dept, index) => (
                          <SelectItem key={index} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Resource Type</Label>
                    <Select
                      value={filters.type}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {resourceTypes.map((type, index) => (
                          <SelectItem key={index} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select
                      value={filters.year}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, year: value }))}
                    >
                      <SelectTrigger id="year">
                        <SelectValue placeholder="All Years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {years.map((year, index) => (
                          <SelectItem key={index} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select
                      value={filters.semester}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, semester: value }))}
                    >
                      <SelectTrigger id="semester">
                        <SelectValue placeholder="All Semesters" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Semesters</SelectItem>
                        {semesters.map((semester, index) => (
                          <SelectItem key={index} value={semester}>
                            {semester}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="mb-2 block">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant={filters.tags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all" className="gap-1">
                <BookOpen className="h-4 w-4" />
                All Resources
              </TabsTrigger>
              <TabsTrigger value="exams" className="gap-1">
                <FileText className="h-4 w-4" />
                Past Exams
              </TabsTrigger>
              <TabsTrigger value="projects" className="gap-1">
                <GraduationCap className="h-4 w-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="theses" className="gap-1">
                <BookOpen className="h-4 w-4" />
                Theses
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.length > 0 ? (
                  searchResults.map((resource) => (
                    <Link key={resource.id} href={`/resources/${resource.id}`}>
                      <ResourceCard resource={resource} />
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No resources found matching your search criteria.</p>
                    <Button variant="link" onClick={clearFilters}>
                      Clear filters and try again
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="exams" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.length > 0 ? (
                  searchResults.map((resource) => (
                    <Link key={resource.id} href={`/resources/${resource.id}`}>
                      <ResourceCard resource={resource} />
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No past exams found matching your search criteria.</p>
                    <Button variant="link" onClick={clearFilters}>
                      Clear filters and try again
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="projects" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.length > 0 ? (
                  searchResults.map((resource) => (
                    <Link key={resource.id} href={`/resources/${resource.id}`}>
                      <ResourceCard resource={resource} />
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No projects found matching your search criteria.</p>
                    <Button variant="link" onClick={clearFilters}>
                      Clear filters and try again
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="theses" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.length > 0 ? (
                  searchResults.map((resource) => (
                    <Link key={resource.id} href={`/resources/${resource.id}`}>
                      <ResourceCard resource={resource} />
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No theses found matching your search criteria.</p>
                    <Button variant="link" onClick={clearFilters}>
                      Clear filters and try again
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

export default AdvancedSearchPage