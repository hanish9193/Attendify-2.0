"use client"

import { useState, useRef } from "react"
import { Camera, Upload, X, Loader, CheckCircle, AlertTriangle } from "lucide-react"

interface ExtractedData {
  subjects: Array<{
    name: string
    totalClasses: number
    attendedClasses: number
    percentage: number
  }>
  extractedText: string
}

interface ScreenshotUploadProps {
  isOpen: boolean
  onClose: () => void
  onDataExtracted: (data: ExtractedData) => void
}

export default function ScreenshotUpload({ isOpen, onClose, onDataExtracted }: ScreenshotUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState("")
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError("")
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      setError("")
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  // Mock TrOCR processing - In production, this would call your Python backend
  const processImage = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setError("")

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Mock extracted text and parsing
      const mockExtractedText = `
        Subject: Mathematics
        Total Classes: 42
        Attended: 36
        Percentage: 85.7%
        
        Subject: Physics
        Total Classes: 38
        Attended: 31
        Percentage: 81.6%
        
        Subject: Chemistry
        Total Classes: 40
        Attended: 28
        Percentage: 70.0%
        
        Subject: Computer Science
        Total Classes: 36
        Attended: 34
        Percentage: 94.4%
      `

      setExtractedText(mockExtractedText)

      // Parse the text into structured data
      const mockData: ExtractedData = {
        subjects: [
          { name: "Mathematics", totalClasses: 42, attendedClasses: 36, percentage: 85.7 },
          { name: "Physics", totalClasses: 38, attendedClasses: 31, percentage: 81.6 },
          { name: "Chemistry", totalClasses: 40, attendedClasses: 28, percentage: 70.0 },
          { name: "Computer Science", totalClasses: 36, attendedClasses: 34, percentage: 94.4 },
        ],
        extractedText: mockExtractedText
      }

      onDataExtracted(mockData)
      
    } catch (err) {
      setError("Failed to process image. Please try again.")
      console.error("TrOCR processing error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const reset = () => {
    setSelectedFile(null)
    setPreview(null)
    setExtractedText("")
    setError("")
    setIsProcessing(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-auto p-6 glass-panel rounded-xl border border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Camera className="w-6 h-6 mr-2" />
            AI Attendance Extraction
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Upload Academic Portal Screenshot</h3>
            
            {!preview ? (
              <div
                className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-white/40 transition-all"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-white/60 mx-auto mb-4" />
                <p className="text-white/60 mb-2">Drop your screenshot here or click to browse</p>
                <p className="text-white/40 text-sm">Supports JPG, PNG, WebP images</p>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={preview} 
                  alt="Upload preview" 
                  className="w-full rounded-lg border border-white/10"
                />
                <button
                  onClick={reset}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile && !isProcessing && !extractedText && (
              <button
                onClick={processImage}
                className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white flex items-center justify-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Extract Attendance Data</span>
              </button>
            )}

            {isProcessing && (
              <div className="w-full px-4 py-2 bg-blue-500/20 rounded-lg text-blue-400 flex items-center justify-center space-x-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span>Processing with AI...</span>
              </div>
            )}

            {error && (
              <div className="w-full px-4 py-2 bg-red-500/20 rounded-lg text-red-400 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Extracted Data</h3>
            
            {extractedText ? (
              <div className="space-y-4">
                <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
                  <div className="flex items-center space-x-2 text-green-400 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Extraction Complete!</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    Successfully extracted attendance data for multiple subjects.
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-white font-medium mb-2">Raw Extracted Text:</h4>
                  <pre className="text-white/70 text-xs overflow-auto max-h-32 whitespace-pre-wrap">
                    {extractedText}
                  </pre>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-white font-medium mb-3">Parsed Subjects:</h4>
                  <div className="space-y-2">
                    {/* This would show the parsed data - simplified for demo */}
                    <div className="text-emerald-400 text-sm">
                      ✓ Found 4 subjects with attendance data
                    </div>
                    <div className="text-white/70 text-sm">
                      Data will be imported to your dashboard
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white"
                >
                  Import to Dashboard
                </button>
              </div>
            ) : (
              <div className="bg-white/5 rounded-lg p-8 border border-white/10 text-center">
                <Camera className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">Upload a screenshot to see extracted data here</p>
                <p className="text-white/40 text-sm mt-2">
                  AI will automatically detect and parse attendance information
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white/5 rounded-lg p-4 border border-white/10">
          <h4 className="text-white font-medium mb-2">Tips for Best Results:</h4>
          <ul className="text-white/70 text-sm space-y-1">
            <li>• Ensure the screenshot clearly shows subject names and attendance percentages</li>
            <li>• Make sure the image is not blurry or heavily compressed</li>
            <li>• Include the full attendance table/section in the screenshot</li>
            <li>• Screenshots from college portals, ERP systems work best</li>
          </ul>
        </div>
      </div>
    </div>
  )
}