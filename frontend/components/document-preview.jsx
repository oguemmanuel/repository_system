"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function DocumentPreview({ resourceId, title }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex cursor-pointer items-center gap-1 text-xs bg-white text-blue-500 hover:bg-blue-50"
        >
          <FileText className="h-3 w-3" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 h-full">
          <iframe
            src={`http://localhost:5000/api/resources/${resourceId}/preview`}
            className="w-full h-full border rounded-md"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false)
              setError("Failed to load document preview")
            }}
          />

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="text-center p-4 bg-destructive/10 rounded-md">
                <p className="text-destructive">{error}</p>
                <p className="text-sm text-muted-foreground mt-2">Try downloading the document instead.</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
