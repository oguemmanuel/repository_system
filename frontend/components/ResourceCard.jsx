// Import statements remain the same
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Eye } from "lucide-react";

// JavaScript doesn't have interface declarations, so we'll use JSDoc comments instead
/**
 * @typedef {Object} Resource
 * @property {number} id
 * @property {string} title
 * @property {string} type
 * @property {string} department
 * @property {string} uploadedBy
 * @property {string} uploadDate
 */

/**
 * @param {Object} props
 * @param {Resource} props.resource
 */
export default function ResourceCard({ resource }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{resource.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <div>
            <strong>Type:</strong> {resource.type}
          </div>
          <div>
            <strong>Department:</strong> {resource.department}
          </div>
          <div>
            <strong>Uploaded By:</strong> {resource.uploadedBy}
          </div>
          <div>
            <strong>Date:</strong> {resource.uploadDate}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">
          <Eye className="mr-2 h-4 w-4" />
          View
        </Button>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}