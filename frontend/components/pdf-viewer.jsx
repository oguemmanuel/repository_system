"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from "lucide-react"

export default function PdfViewer({ fileUrl }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pageNum, setPageNum] = useState(1)
  const [numPages, setNumPages] = useState(null)
  const [scale, setScale] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const canvasRef = useRef(null)
  const pdfDocRef = useRef(null)

  useEffect(() => {
    // Load PDF.js script dynamically
    const loadPdfJs = async () => {
      try {
        // Check if PDF.js is already loaded
        if (window.pdfjsLib) return window.pdfjsLib

        // Create script element for PDF.js
        const script = document.createElement("script")
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        script.async = true

        // Wait for script to load
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
          document.head.appendChild(script)
        })

        // Create script element for PDF.js worker
        const workerScript = document.createElement("script")
        workerScript.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
        workerScript.async = true

        // Wait for worker script to load
        await new Promise((resolve, reject) => {
          workerScript.onload = resolve
          workerScript.onerror = reject
          document.head.appendChild(workerScript)
        })

        return window.pdfjsLib
      } catch (error) {
        console.error("Failed to load PDF.js:", error)
        setError("Failed to load PDF viewer library")
        setLoading(false)
        return null
      }
    }

    const loadPdf = async () => {
      try {
        setLoading(true)

        // Load PDF.js library
        const pdfjsLib = await loadPdfJs()
        if (!pdfjsLib) return

        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument(fileUrl)
        const pdfDoc = await loadingTask.promise
        pdfDocRef.current = pdfDoc

        setNumPages(pdfDoc.numPages)
        setPageNum(1)

        // Render the first page
        await renderPage(1, pdfDoc)

        setLoading(false)
      } catch (error) {
        console.error("Error loading PDF:", error)
        setError(`Failed to load PDF: ${error.message}`)
        setLoading(false)
      }
    }

    if (fileUrl) {
      loadPdf()
    }

    return () => {
      // Cleanup
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy()
        pdfDocRef.current = null
      }
    }
  }, [fileUrl])

  // Effect to re-render when page, scale or rotation changes
  useEffect(() => {
    if (pdfDocRef.current && !loading) {
      renderPage(pageNum, pdfDocRef.current)
    }
  }, [pageNum, scale, rotation, loading])

  const renderPage = async (num, pdfDoc) => {
    try {
      if (!pdfDoc) return

      const page = await pdfDoc.getPage(num)
      const canvas = canvasRef.current

      if (!canvas) return

      const context = canvas.getContext("2d")

      // Calculate viewport with scale and rotation
      const viewport = page.getViewport({ scale, rotation: rotation })

      // Set canvas dimensions to match viewport
      canvas.height = viewport.height
      canvas.width = viewport.width

      // Render PDF page into canvas context
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      }

      await page.render(renderContext).promise
    } catch (error) {
      console.error("Error rendering PDF page:", error)
      setError(`Failed to render page ${num}: ${error.message}`)
    }
  }

  const prevPage = () => {
    if (pageNum <= 1) return
    setPageNum(pageNum - 1)
  }

  const nextPage = () => {
    if (pageNum >= numPages) return
    setPageNum(pageNum + 1)
  }

  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.25, 3.0))
  }

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.25, 0.5))
  }

  const rotate = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">PDF Preview Unavailable</h3>
            <p className="text-muted-foreground mt-2 mb-4">{error}</p>
            <Button onClick={() => window.open(fileUrl, "_blank")}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between bg-muted p-2 rounded-md">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={prevPage} disabled={pageNum <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {pageNum} of {numPages}
          </span>
          <Button variant="outline" size="icon" onClick={nextPage} disabled={pageNum >= numPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={zoomOut} disabled={scale <= 0.5}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm w-16 text-center">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="icon" onClick={zoomIn} disabled={scale >= 3.0}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={rotate}>
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open(fileUrl, "_blank")}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="border rounded-md overflow-auto bg-white" style={{ height: "70vh" }}>
        <div className="flex justify-center min-h-full p-4">
          <canvas ref={canvasRef} className="shadow-md" />
        </div>
      </div>
    </div>
  )
}
