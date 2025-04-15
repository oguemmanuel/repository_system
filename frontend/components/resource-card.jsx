import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Calendar, User, BookOpen, Bookmark } from "lucide-react"

/**
 * ResourceCard component for displaying resource information
 * @param {Object} props - Component props
 * @param {Object} props.resource - Resource data object
 * @param {string} props.resource._id - Resource ID
 * @param {string} props.resource.title - Resource title
 * @param {string} props.resource.type - Resource type
 * @param {string} props.resource.department - Resource department
 * @param {string} [props.resource.uploadedBy] - Who uploaded the resource
 * @param {Object} [props.resource.student] - Student information
 * @param {string} [props.resource.student.fullName] - Student's full name
 * @param {string} [props.resource.supervisorName] - Supervisor's name
 * @param {string} props.resource.createdAt - Creation date
 * @param {string} [props.resource.updatedAt] - Last update date
 * @param {number} [props.resource.downloads] - Number of downloads
 * @param {string} [props.resource.status] - Resource status
 * @param {boolean} [props.showDownloads=false] - Whether to show download count
 * @returns {JSX.Element} ResourceCard component
 */
export default function ResourceCard({ resource, showDownloads = false }) {
  // Format the resource type for display
  const getFormattedType = (type) => {
    switch (type) {
      case "mini-project":
        return "Mini Project"
      case "final-project":
        return "Final Year Project"
      case "past-exam":
        return "Past Exam"
      case "thesis":
        return "Thesis"
      default:
        return type
    }
  }

  // Format the date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get the author name (either student name or uploadedBy)
  const getAuthorName = () => {
    if (resource.student?.fullName) {
      return resource.student.fullName
    }
    return resource.uploadedBy || "Unknown"
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-base">{resource.title}</CardTitle>
          <Badge variant="outline" className="shrink-0">
            {getFormattedType(resource.type)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Department:</span>
            <span className="ml-auto">{resource.department}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Author:</span>
            <span className="ml-auto">{getAuthorName()}</span>
          </div>
          {resource.supervisorName && (
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Supervisor:</span>
              <span className="ml-auto">{resource.supervisorName}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Date:</span>
            <span className="ml-auto">{formatDate(resource.createdAt)}</span>
          </div>
          {showDownloads && resource.downloads !== undefined && (
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Downloads:</span>
              <span className="ml-auto">{resource.downloads}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" className="gap-1">
          <Eye className="h-4 w-4" />
          View
        </Button>
        <Button size="sm" className="gap-1">
          <Download className="h-4 w-4" />
          Download
        </Button>
      </CardFooter>
    </Card>
  )
}
