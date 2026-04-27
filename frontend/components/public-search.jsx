"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, FileText, GraduationCap, MessageCircle, Edit, Trash2, Send, X } from "lucide-react"
import Link from "next/link"
import AISummaryButton from "@/components/ai-summary-button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const PublicSearch = () => {
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [commentsByResource, setCommentsByResource] = useState({})
  const [newComments, setNewComments] = useState({})
  const [editingComment, setEditingComment] = useState(null)
  const [editContent, setEditContent] = useState("")
  const [activeCommentResource, setActiveCommentResource] = useState(null)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const commentSectionRef = useRef(null)

  // Fetch current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include",
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        }
      } catch (error) {
        console.error("Error fetching current user:", error)
      }
    }

    fetchCurrentUser()
  }, [])

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users/departments/all")
        if (response.ok) {
          const data = await response.json()
          setDepartments(data.departments || [])
        }
      } catch (error) {
        console.error("Error fetching departments:", error)
      }
    }

    fetchDepartments()
  }, [])

  // Fetch resources when search parameters change
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true)
      try {
        let url = `http://localhost:5000/api/resources/public?page=${page}&limit=6`

        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`
        }

        if (selectedDepartment) {
          url += `&department=${encodeURIComponent(selectedDepartment)}`
        }

        if (selectedType) {
          url += `&type=${encodeURIComponent(selectedType)}`
        }

        const response = await fetch(url)

        if (response.ok) {
          const data = await response.json()
          setResources(data.resources || [])
          setTotalPages(data.totalPages || 1)

          // Initialize comments state for each resource
          const newResourceIds = data.resources.map((resource) => resource.id)
          fetchCommentsForResources(newResourceIds)
        }
      } catch (error) {
        console.error("Error fetching resources:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [searchQuery, selectedDepartment, selectedType, page])

  // Fetch comments for all displayed resources
  const fetchCommentsForResources = async (resourceIds) => {
    try {
      const commentsData = {}

      // Fetch comments for each resource
      for (const resourceId of resourceIds) {
        const response = await fetch(`http://localhost:5000/api/comments/resource/${resourceId}`)
        if (response.ok) {
          const data = await response.json()
          commentsData[resourceId] = data.comments || []
        }
      }

      setCommentsByResource(commentsData)
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1) // Reset to first page on new search
  }

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

  const openComments = (resourceId) => {
    setActiveCommentResource(resourceId)
  }

  const closeComments = () => {
    setActiveCommentResource(null)
    setShowCommentForm(false)
  }

  const toggleCommentForm = () => {
    setShowCommentForm(!showCommentForm)
  }

  const handleCommentChange = (resourceId, content) => {
    setNewComments((prev) => ({
      ...prev,
      [resourceId]: content,
    }))
  }

  const submitComment = async (resourceId) => {
    const content = newComments[resourceId]
    if (!content?.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter some text for your comment",
        variant: "destructive",
      })
      return
    }

    try {
      // For anonymous users, prompt for a name
      let commentorName = "Anonymous"
      if (!user) {
        const nameInput = prompt("Enter your name (optional):", "Anonymous")
        if (nameInput) commentorName = nameInput
      }

      const response = await fetch("http://localhost:5000/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resourceId,
          content,
          name: user ? undefined : commentorName, // Only send name for anonymous users
        }),
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()

        // Update comments in state
        setCommentsByResource((prev) => ({
          ...prev,
          [resourceId]: [...(prev[resourceId] || []), data.comment],
        }))

        // Clear the comment input
        setNewComments((prev) => ({
          ...prev,
          [resourceId]: "",
        }))

        // Hide the comment form
        setShowCommentForm(false)

        toast({
          title: "Comment posted",
          description: "Your comment has been added successfully",
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to post comment")
      }
    } catch (error) {
      console.error("Error posting comment:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      })
    }
  }

  const startEditComment = (comment) => {
    setEditingComment(comment.id)
    setEditContent(comment.content)
  }

  const updateComment = async (commentId) => {
    if (!editContent?.trim()) {
      toast({
        title: "Empty comment",
        description: "Comment cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editContent,
        }),
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()

        // Update comments in state
        setCommentsByResource((prev) => {
          const newState = { ...prev }

          // Find which resource this comment belongs to
          for (const resourceId in newState) {
            newState[resourceId] = newState[resourceId].map((comment) =>
              comment.id === commentId ? data.comment : comment,
            )
          }

          return newState
        })

        // Reset editing state
        setEditingComment(null)
        setEditContent("")

        toast({
          title: "Comment updated",
          description: "Your comment has been updated successfully",
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to update comment")
      }
    } catch (error) {
      console.error("Error updating comment:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update comment",
        variant: "destructive",
      })
    }
  }

  const deleteComment = async (commentId, resourceId) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        // Remove comment from state
        setCommentsByResource((prev) => ({
          ...prev,
          [resourceId]: prev[resourceId].filter((comment) => comment.id !== commentId),
        }))

        toast({
          title: "Comment deleted",
          description: "Your comment has been deleted successfully",
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete comment")
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive",
      })
    }
  }

  // Check if the current user can edit/delete this comment
  const canModifyComment = (comment) => {
    if (!user) return false

    // User can modify if they are the author or an admin
    return comment.userId === user.id || user.role === "admin"
  }

  // Get the active resource title
  const getActiveResourceTitle = () => {
    if (!activeCommentResource) return ""
    const resource = resources.find((r) => r.id === activeCommentResource)
    return resource ? resource.title : ""
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent className="bg-blue-500 text-white cursor-pointer">
            <SelectItem value="all" className="cursor-pointer">
              All Departments
            </SelectItem>
            {departments.map((department) => (
              <SelectItem key={department} value={department}>
                {department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-blue-500 text-white cursor-pointer">
            <SelectItem className="cursor-pointer" value="all">
              All Types
            </SelectItem>
            <SelectItem className="cursor-pointer" value="past-exam">
              Past Exams
            </SelectItem>
            <SelectItem className="cursor-pointer" value="mini-project">
              Mini Projects
            </SelectItem>
            <SelectItem className="cursor-pointer" value="final-project">
              Final Year Projects
            </SelectItem>
            <SelectItem className="cursor-pointer" value="thesis">
              Theses
            </SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" className="bg-blue-600 text-white">
          Search
        </Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00447c]"></div>
        </div>
      ) : resources.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <Card key={resource.id} className="overflow-hidden bg-blue-800 shadow-md max-w-sm">
            <CardHeader className="pb-2 px-4 pt-4">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-base font-semibold line-clamp-2 text-white leading-tight">
                  {resource.title}
                </CardTitle>
                <div className="flex-shrink-0">
                  {getResourceTypeIcon(resource.type)}
                </div>
              </div>
            </CardHeader>
  
  <CardContent className="px-4 pb-2">
    <p className="text-xs text-white/80 line-clamp-2 leading-relaxed mb-3">
      {resource.description}
    </p>
    
    <div className="flex flex-wrap gap-1 mb-2">
      <Badge variant="outline" className="text-xs px-2 py-0.5 text-white border-white/30">
        {getResourceTypeName(resource.type)}
      </Badge>
      <Badge variant="outline" className="text-xs px-2 py-0.5 text-white border-white/30">
        {resource.department}
      </Badge>
      {resource.year && (
        <Badge variant="outline" className="text-xs px-2 py-0.5 text-white border-white/30">
          {resource.year}
        </Badge>
      )}
    </div>
  </CardContent>
  
  <CardFooter className="flex flex-col gap-2 border-t border-white/20 bg-blue-900/30 px-4 py-3">
    <div className="flex justify-between items-center w-full">
      <span className="text-xs text-white/70 truncate">
        By {resource.uploadedByName || "Unknown"}
      </span>
      <Link href={`/resources/${resource.id}`}>
        <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-white hover:bg-blue-700">
          View Details
        </Button>
      </Link>
    </div>
    
    <div className="flex gap-2 w-full">
      <div className="flex-1">
        <AISummaryButton resourceId={resource.id} title={resource.title} />
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-xs h-7 px-2 text-white hover:bg-blue-700 flex items-center gap-1"
        onClick={() => openComments(resource.id)}
      >
        <MessageCircle className="h-3 w-3" />
        <span>{commentsByResource[resource.id]?.length || 0}</span>
      </Button>
    </div>
  </CardFooter>
</Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-3">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>

          {/* Comments Dialog */}
          <Dialog open={activeCommentResource !== null} onOpenChange={(open) => !open && closeComments()}>
            <DialogContent className="sm:max-w-[500px] bg-blue-900 text-white border-blue-700">
              <DialogHeader>
                <DialogTitle className="text-white flex justify-between items-center">
                  <span>Comments for {getActiveResourceTitle()}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-white hover:bg-blue-800 rounded-full"
                    onClick={closeComments}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>

              {activeCommentResource && (
                <div className="mt-2" ref={commentSectionRef}>
                  {/* Comment list */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 mb-4">
                    {commentsByResource[activeCommentResource]?.length > 0 ? (
                      commentsByResource[activeCommentResource].map((comment) => (
                        <div key={comment.id} className="bg-blue-800 rounded-md p-3">
                          {editingComment === comment.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full min-h-[80px] text-sm bg-blue-950 text-white border-blue-700"
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-white h-8 px-3"
                                  onClick={() => setEditingComment(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-blue-600 text-white h-8 px-3 hover:bg-blue-700"
                                  onClick={() => updateComment(comment.id)}
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between items-start">
                                <div className="text-sm font-medium text-blue-300">
                                  {comment.fullName || "Anonymous"}
                                </div>
                                {canModifyComment(comment) && (
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-blue-300 hover:text-white hover:bg-blue-700"
                                      onClick={() => startEditComment(comment)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-blue-300 hover:text-white hover:bg-blue-700"
                                      onClick={() => deleteComment(comment.id, activeCommentResource)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-white mt-2">{comment.content}</p>
                              <div className="text-xs text-blue-400 mt-2">
                                {new Date(comment.createdAt).toLocaleString()}
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-blue-300 italic py-4">No comments yet</p>
                    )}
                  </div>

                  {/* Comment form toggle button */}
                  {!showCommentForm ? (
                    <Button className="w-full bg-blue-700 hover:bg-blue-600 text-white" onClick={toggleCommentForm}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Add a Comment
                    </Button>
                  ) : (
                    <AnimatePresence>
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3 mt-4"
                      >
                        <Textarea
                          placeholder="Write your comment here..."
                          className="w-full min-h-[100px] text-sm bg-blue-800 text-white border-blue-700"
                          value={newComments[activeCommentResource] || ""}
                          onChange={(e) => handleCommentChange(activeCommentResource, e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            className="border-blue-600 text-white hover:bg-blue-800"
                            onClick={toggleCommentForm}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => submitComment(activeCommentResource)}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Post Comment
                          </Button>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No resources found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  )
}

export default PublicSearch
