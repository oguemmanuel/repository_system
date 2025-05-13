"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function AISummaryButton({ resourceId, title }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [open, setOpen] = useState(false)

  const fetchSummary = async () => {
    if (summary) return // Don't fetch again if we already have a summary
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`http://localhost:5000/api/ai/cached-summary/${resourceId}`, {
        credentials: "include",
      })
      if (!response.ok) {
        throw new Error("Failed to generate summary")
      }
      const data = await response.json()
      setSummary(data.summary)
    } catch (err) {
      setError("Failed to generate AI summary. Please try again later.")
      console.error("Error fetching AI summary:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = (isOpen) => {
    setOpen(isOpen)
    if (isOpen) {
      fetchSummary()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen} className="py-16">
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200 text-blue-600 hover:text-blue-700 shadow-sm"
        >
          <Sparkles className="mr-2 h-4 w-4 cursor-pointer" />
          AI Summary
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-white rounded-lg shadow-xl">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-blue-500 cursor-pointer" />
            AI Summary: {title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 px-1 max-h-[70vh] overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
              <p className="text-gray-600">Generating AI summary...</p>
              <p className="text-sm text-gray-400 mt-2">This may take a moment</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
              <p>{error}</p>
              <Button variant="ghost" className="mt-2 text-red-600 hover:bg-red-100" onClick={fetchSummary}>
                Retry
              </Button>
            </div>
          )}

          {summary && !loading && (
            <div className="prose prose-sm max-w-none">
              {summary.split("\n").map((paragraph, i) =>
                paragraph.trim() ? (
                  <p key={i} className="text-gray-700 mb-3 leading-relaxed">
                    {paragraph}
                  </p>
                ) : null,
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-gray-300 hover:bg-gray-50 cursor-pointer"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
