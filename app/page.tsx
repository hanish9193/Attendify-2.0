"use client"

import { useState, useEffect, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import {
  BarChart2,
  Calendar,
  Book,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  RefreshCw,
  Focus,
  PieChart,
  LogOut,
  User,
  Calculator,
} from "lucide-react"
import Spline from "@splinetool/react-spline"
import FocusView from "@/components/focus-view"
import AttendanceChart from "@/components/attendance-chart"
import AuthModal from "@/components/auth/auth-modal"
import OnboardingModal from "@/components/onboarding/onboarding-modal"
import MultiSubjectDashboard from "@/components/dashboard/multi-subject-dashboard"
import ScreenshotUpload from "@/components/trocr/screenshot-upload"

// Define CSS styles
const globalStyles = `
  .glass-panel {
    backdrop-filter: blur(12px);
    background: rgba(255, 255, 255, 0.05);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  
  .glass-input {
    backdrop-filter: blur(4px);
    background: rgba(255, 255, 255, 0.03);
  }
  
  @keyframes slide-up {
    from { transform: translateY(40px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes slide-down {
    from { transform: translateY(-40px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes expand {
    0% { width: 0%; }
    100% { width: 100%; }
  }
  
  .animate-slide-up {
    animation: slide-up 0.8s ease-out forwards;
  }
  
  .animate-slide-down {
    animation: slide-down 0.8s ease-out forwards;
  }
  
  .animate-expand {
    animation: expand 1.5s ease-out forwards;
  }
  
  .watermark-cover {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.7));
    z-index: 1;
  }
  
  .modal-content {
    max-height: 80vh;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  }
  
  .modal-content::-webkit-scrollbar {
    width: 6px;
  }
  
  .modal-content::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .modal-content::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
  }
`

interface Subject {
  id: number
  name: string
  targetAttendance: number
  totalClasses: number
  attendedClasses: number
  isActive: boolean
}

export default function App() {
  // Temporarily remove session until SessionProvider is working
  // const { data: session, status } = useSession()
  
  // State management
  const [show3DBackground, setShow3DBackground] = useState(true)
  const [showContent, setShowContent] = useState(false)
  const [totalClasses, setTotalClasses] = useState<number>(0)
  const [absences, setAbsences] = useState<number | null>(null)
  const [targetPercentage, setTargetPercentage] = useState<number>(75)
  const [attendancePercentage, setAttendancePercentage] = useState<number>(0)
  const [canBunk, setCanBunk] = useState<number>(0)
  const [needToAttend, setNeedToAttend] = useState<number>(0)
  const [hasCalculated, setHasCalculated] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [splineObj, setSplineObj] = useState<any>(null)
  const [theme, setTheme] = useState<"default" | "success" | "warning" | "danger">("default")
  const [showSettings, setShowSettings] = useState(false)
  const [animateChart, setAnimateChart] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showFocusView, setShowFocusView] = useState(false)
  const [showAttendanceChart, setShowAttendanceChart] = useState(false)
  const [attendanceHistory, setAttendanceHistory] = useState<{ date: string; status: "present" | "absent" }[]>([])

  // Enhanced app states
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showScreenshotUpload, setShowScreenshotUpload] = useState(false)
  const [isGuestMode, setIsGuestMode] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(true)
  const [viewMode, setViewMode] = useState<"simple" | "dashboard">("simple")
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)

  // 3D model interaction references
  const splineRef = useRef(null)

  // Initialize app with 2-second 3D background, then show login/dashboard
  useEffect(() => {
    // Show 3D background for 2 seconds
    setTimeout(() => {
      setShow3DBackground(false)
      setShowContent(true)
      
      // Check authentication and show appropriate screen
      if (isGuestMode) {
        // Guest mode - directly show dashboard (or onboarding if first time)
        if (isFirstTime && subjects.length === 0) {
          setShowOnboarding(true)
        } else {
          setViewMode("dashboard")
        }
      } else {
        // Not logged in - show auth modal
        setShowAuthModal(true)
      }
    }, 2000)

    // Initialize with empty attendance history
    setAttendanceHistory([])
  }, [])

  // Handle 3D model loading
  const onSplineLoad = (spline: any) => {
    setSplineObj(spline)
    // Initial animation for 3D model
    try {
      spline.playAnimation("Initial")
    } catch (err) {
      console.log("Animation not found in the 3D model")
    }
  }

  // Calculate attendance metrics
  useEffect(() => {
    if (totalClasses > 0 && absences !== null) {
      const attendedClasses = totalClasses - absences
      const percentage = (attendedClasses / totalClasses) * 100
      setAttendancePercentage(Number(percentage.toFixed(2)))

      const targetDecimal = targetPercentage / 100
      const currentAttended = totalClasses - absences

      const maxAbsencesPossible = Math.floor(currentAttended / targetDecimal - totalClasses)

      if (maxAbsencesPossible >= 0) {
        setCanBunk(maxAbsencesPossible)
        setNeedToAttend(0)
      } else {
        let additionalClasses = 0
        let newTotal = totalClasses
        let newAttended = attendedClasses

        while ((newAttended / newTotal) * 100 < targetPercentage) {
          additionalClasses++
          newTotal++
          newAttended++
        }

        setCanBunk(0)
        setNeedToAttend(additionalClasses)
      }

      setHasCalculated(true)
      setShowResults(true)

      // Set theme based on attendance percentage
      if (percentage < targetPercentage - 10) {
        setTheme("danger")
        // Trigger 3D model animation for low attendance
        animateModel("Danger")
      } else if (percentage < targetPercentage) {
        setTheme("warning")
        // Trigger 3D model animation for borderline attendance
        animateModel("Warning")
      } else {
        setTheme("success")
        // Trigger 3D model animation for good attendance
        animateModel("Success")
      }

      // Trigger chart animation
      setAnimateChart(true)
      setTimeout(() => setAnimateChart(false), 1500)
    } else {
      setHasCalculated(false)
      setShowResults(false)
      setTheme("default")
    }
  }, [totalClasses, absences, targetPercentage])

  // Function to animate the 3D model based on attendance status
  const animateModel = (animationName: string) => {
    if (splineObj) {
      try {
        splineObj.playAnimation(animationName)
      } catch (err) {
        console.log(`Animation '${animationName}' not found in the 3D model`)
      }
    }
  }

  // Interactive functions for 3D model
  const handleModelInteraction = (type: string) => {
    if (splineObj) {
      try {
        splineObj.playAnimation(type)
      } catch (err) {
        console.log(`Animation '${type}' not found in the 3D model`)
      }
    }

    // Handle view changes
    if (type === "Calendar") {
      setShowCalendar(true)
      setShowFocusView(false)
      setShowAttendanceChart(false)
    } else if (type === "Focus") {
      setShowFocusView(true)
      setShowCalendar(false)
      setShowAttendanceChart(false)
    } else if (type === "Chart") {
      setShowAttendanceChart(true)
      setShowCalendar(false)
      setShowFocusView(false)
    }
  }

  // Helper functions for UI components
  const getAttendanceColor = (percentage: number): string => {
    if (percentage < targetPercentage - 10) return "text-red-400"
    if (percentage < targetPercentage) return "text-yellow-400"
    return "text-emerald-400"
  }

  const getStatusMessage = (percentage: number): string => {
    if (percentage < targetPercentage - 10) return "Critical - Attendance below requirement"
    if (percentage < targetPercentage) return "Warning - Attendance needs improvement"
    return "Good - Attendance above target"
  }

  const getThemeColors = () => {
    switch (theme) {
      case "success":
        return {
          primary: "emerald-400",
          bg: "emerald-400/10",
          border: "emerald-400/30",
        }
      case "warning":
        return {
          primary: "yellow-400",
          bg: "yellow-400/10",
          border: "yellow-400/30",
        }
      case "danger":
        return {
          primary: "red-400",
          bg: "red-400/10",
          border: "red-400/30",
        }
      default:
        return {
          primary: "white",
          bg: "white/5",
          border: "white/20",
        }
    }
  }

  const colors = getThemeColors()

  // Reset all form fields
  const resetForm = () => {
    setTotalClasses(0)
    setAbsences(null)
    setTargetPercentage(75)
    setHasCalculated(false)
    setShowResults(false)
    setTheme("default")
    setShowCalendar(false)
    setShowFocusView(false)
    setShowAttendanceChart(false)

    // Reset 3D model to initial state
    if (splineObj) {
      try {
        splineObj.playAnimation("Reset")
      } catch (err) {
        console.log("Reset animation not found in the 3D model")
      }
    }
  }

  // Close modal views
  const closeModalViews = () => {
    setShowCalendar(false)
    setShowFocusView(false)
    setShowAttendanceChart(false)
  }

  // Enhanced app handlers
  const handleGuestLogin = () => {
    setIsGuestMode(true)
    setShowAuthModal(false)
    // Directly show dashboard for guest mode
    if (isFirstTime && subjects.length === 0) {
      setShowOnboarding(true)
    } else {
      setViewMode("dashboard")
    }
  }

  const handleOnboardingComplete = (data: any) => {
    const newSubjects: Subject[] = data.subjects.map((subject: any, index: number) => ({
      id: index + 1,
      name: subject.name,
      targetAttendance: subject.targetAttendance,
      totalClasses: subject.totalClasses,
      attendedClasses: subject.attendedClasses,
      isActive: true
    }))
    
    setSubjects(newSubjects)
    setShowOnboarding(false)
    setIsFirstTime(false)
    setViewMode("dashboard")
  }

  const handleAddSubject = () => {
    const newSubject: Subject = {
      id: subjects.length + 1,
      name: `Subject ${subjects.length + 1}`,
      targetAttendance: 75,
      totalClasses: 0,
      attendedClasses: 0,
      isActive: true
    }
    setSubjects([...subjects, newSubject])
  }

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject)
    // You could open an edit modal here
  }

  const handleScreenshotUpload = () => {
    setShowScreenshotUpload(true)
  }

  const handleDataExtracted = (data: any) => {
    const extractedSubjects: Subject[] = data.subjects.map((subject: any, index: number) => ({
      id: subjects.length + index + 1,
      name: subject.name,
      targetAttendance: 75, // Default target
      totalClasses: subject.totalClasses,
      attendedClasses: subject.attendedClasses,
      isActive: true
    }))
    
    setSubjects([...subjects, ...extractedSubjects])
    setShowScreenshotUpload(false)
  }

  const handleSignOut = () => {
    // Temporarily simplified sign out
    setIsGuestMode(false)
    setViewMode("simple")
    setSubjects([])
    setShowAuthModal(true)
  }

  const switchToSimpleMode = () => {
    setViewMode("simple")
    setSelectedSubject(null)
  }

  const switchToDashboardMode = () => {
    if (subjects.length === 0) {
      setShowOnboarding(true)
    } else {
      setViewMode("dashboard")
    }
  }

  // Attendance improvement tips
  const tips = [
    "Set reminders 30 minutes before each class",
    "Find a study buddy who can share notes if you miss a class",
    "Speak with professors if you have legitimate reasons for absence",
    "Use the 'can bunk' feature strategically for emergencies only",
    "Track your attendance weekly rather than waiting until the end of term",
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-gray-900 to-black">
      {/* Add global styles correctly */}
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

      {/* Interactive 3D Background */}
      <div className="absolute inset-0 z-0 opacity-60">
        <Spline
          scene="https://prod.spline.design/27aB7rP4Ulb4gr8R/scene.splinecode"
          onLoad={onSplineLoad}
          ref={splineRef}
        />
      </div>

      {/* Watermark cover */}
      <div className="absolute inset-0 z-1 bg-gradient-to-b from-transparent to-black/40" />

      {/* Interactive Element Controls */}
      {showContent && !show3DBackground && (
        <div className="fixed bottom-4 left-4 z-50 flex space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={resetForm}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            title="Reset"
          >
            <RefreshCw className="w-5 h-5 text-white" />
          </button>
          {(isGuestMode || subjects.length > 0) && (
            <button
              onClick={viewMode === "simple" ? switchToDashboardMode : switchToSimpleMode}
              className="p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-all"
              title={viewMode === "simple" ? "Switch to Dashboard" : "Switch to Simple Mode"}
            >
              {viewMode === "simple" ? <BarChart2 className="w-5 h-5 text-white" /> : <Calculator className="w-5 h-5 text-white" />}
            </button>
          )}
        </div>
      )}

      {/* User Controls */}
      {showContent && !show3DBackground && (isGuestMode || subjects.length > 0) && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={handleSignOut}
            className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-all border border-red-500/30"
            title={isGuestMode ? "Exit Guest Mode" : "Sign Out"}
          >
            <LogOut className="w-5 h-5 text-red-400" />
          </button>
        </div>
      )}

      {/* Watermark cover box - increased width and height */}
      {showContent && !show3DBackground && <div className="fixed bottom-0 right-0 z-10 w-48 h-48 bg-black"></div>}

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-xl glass-panel bg-black/60 backdrop-blur-lg border border-white/10 w-64">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-medium">Settings</h3>
            <button onClick={() => setShowSettings(false)} className="text-white/60 hover:text-white">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setShowTips(!showTips)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm flex items-center justify-between"
            >
              <span>Attendance Tips</span>
              {showTips ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            </button>
            <button
              onClick={resetForm}
              className="w-full px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm flex items-center justify-between"
            >
              <span>Reset Calculator</span>
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleModelInteraction("Chart")}
              className="w-full px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm flex items-center justify-between"
            >
              <span>Attendance Chart</span>
              <PieChart className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3D Background Display Only (No Loading Screen) */}
      {show3DBackground && (
        <div className="fixed inset-0 z-20 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-4xl font-bold text-white tracking-wide mb-2">Attendify</h1>
            <p className="text-white/60">Smart Attendance Tracker</p>
          </div>
        </div>
      )}

      {/* Modal Views with scrollable content */}
      {showCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl mx-auto p-6 glass-panel rounded-xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2" /> Attendance Calendar
              </h2>
              <button
                onClick={closeModalViews}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-content pr-2">
              <div className="glass-panel rounded-xl p-4 border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-medium">Calendar View</h3>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                    <div key={index} className="text-center text-white/50 text-xs py-2">
                      {day}
                    </div>
                  ))}

                  {/* Empty calendar grid */}
                  {Array.from({ length: 35 }).map((_, index) => (
                    <div
                      key={index}
                      className="aspect-square flex items-center justify-center rounded-md text-sm text-white"
                    >
                      {index % 7 === 0 || index < 7 ? "" : index - 6}
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional calendar content to demonstrate scrolling */}
              <div className="glass-panel rounded-xl p-4 border border-white/10 mt-4">
                <h3 className="text-white font-medium mb-3">Monthly Overview</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Total Classes:</span>
                    <span className="text-white">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Classes Attended:</span>
                    <span className="text-emerald-400">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Classes Missed:</span>
                    <span className="text-red-400">0</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-xl p-4 border border-white/10 mt-4">
                <h3 className="text-white font-medium mb-3">Calendar Instructions</h3>
                <p className="text-white/70 text-sm">
                  This calendar will display your attendance records once you start tracking your classes. You'll be
                  able to see which days you were present or absent, helping you monitor your attendance patterns over
                  time.
                </p>
                <p className="text-white/70 text-sm mt-2">
                  To begin tracking, enter your class details and attendance information in the main calculator.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFocusView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl mx-auto p-6 glass-panel rounded-xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Focus className="w-5 h-5 mr-2" /> Focus Mode
              </h2>
              <button
                onClick={closeModalViews}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-content pr-2">
              <FocusView
                attendancePercentage={attendancePercentage}
                targetPercentage={targetPercentage}
                canBunk={canBunk}
                needToAttend={needToAttend}
                totalClasses={totalClasses}
                attendedClasses={totalClasses - (absences || 0)}
              />
            </div>
          </div>
        </div>
      )}

      {showAttendanceChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl mx-auto p-6 glass-panel rounded-xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <PieChart className="w-5 h-5 mr-2" /> Attendance Analytics
              </h2>
              <button
                onClick={closeModalViews}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-content pr-2">
              <AttendanceChart
                attendancePercentage={attendancePercentage}
                targetPercentage={targetPercentage}
                totalClasses={totalClasses}
                absences={absences || 0}
                attendanceHistory={[]}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`relative z-10 transition-opacity duration-700 ${showContent ? "opacity-100" : "opacity-0"}`}>
        {/* Header */}
        <div className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col items-center justify-center min-h-[20vh]">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart2 className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-${colors.primary}`} />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-wide">Attendify</h1>
          </div>
          <p className="text-white/60 text-center max-w-lg">
            {viewMode === "dashboard" 
              ? "Smart attendance tracking with AI-powered data extraction and multi-subject management."
              : "Calculate your attendance percentage, find out how many classes you can skip, or determine how many more you need to attend to reach your target."
            }
          </p>
        </div>

        {/* Dashboard Content */}
        {viewMode === "dashboard" ? (
          <div className="max-w-6xl mx-auto p-4 sm:p-6 relative">
            <MultiSubjectDashboard
              subjects={subjects}
              onAddSubject={handleAddSubject}
              onEditSubject={handleEditSubject}
              onUploadScreenshot={handleScreenshotUpload}
              splineObj={splineObj}
            />
          </div>
        ) : (
          <div className="max-w-md mx-auto p-4 sm:p-6 relative">
          {/* Attendance Tips */}
          {showTips && (
            <div
              className={`glass-panel rounded-xl p-6 mb-6 border border-${colors.border} bg-${colors.bg} backdrop-blur-lg transition-all duration-800 ease-out transform animate-slide-down`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium flex items-center">
                  <Book className="w-4 h-4 mr-2" /> Attendance Tips
                </h3>
                <button onClick={() => setShowTips(false)} className="text-white/60 hover:text-white">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <ul className="space-y-2">
                {tips.map((tip, index) => (
                  <li key={index} className="text-white text-sm flex items-start">
                    <CheckCircle className={`w-4 h-4 mr-2 mt-0.5 text-${colors.primary}`} />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Results Card */}
          {hasCalculated && showResults && (
            <div
              className={`glass-panel rounded-xl p-6 sm:p-8 transition-all duration-800 ease-out transform animate-slide-up mb-8 border border-${colors.border} bg-${colors.bg} backdrop-blur-lg`}
            >
              <div className="text-center mb-6">
                <div
                  className={`text-5xl font-bold mb-2 ${getAttendanceColor(attendancePercentage)} ${animateChart ? "animate-pulse" : ""}`}
                >
                  {attendancePercentage}%
                </div>
                <div className="text-sm text-white/60">Current Attendance</div>
                <div className="mt-4 text-sm font-medium text-white flex items-center justify-center">
                  {attendancePercentage < targetPercentage - 10 ? (
                    <AlertTriangle className="w-4 h-4 mr-2 text-red-400" />
                  ) : attendancePercentage < targetPercentage ? (
                    <AlertTriangle className="w-4 h-4 mr-2 text-yellow-400" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" />
                  )}
                  {getStatusMessage(attendancePercentage)}
                </div>
              </div>

              <div className="space-y-4">
                <div className={`glass-panel p-4 rounded-lg border border-${colors.border}/30`}>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-white/60 text-sm">Total Classes</p>
                      <p className="text-white font-bold">{totalClasses}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Absences</p>
                      <p className="text-white font-bold">{absences}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Target</p>
                      <p className="text-white font-bold">{targetPercentage}%</p>
                    </div>
                  </div>
                </div>

                <div
                  className={`glass-panel p-4 rounded-lg transform transition-all duration-300 hover:scale-105 border border-${colors.border}/30`}
                >
                  {canBunk > 0 ? (
                    <p className="text-white text-center flex flex-col items-center justify-center">
                      <span className="mb-2">You can safely miss</span>
                      <span className={`text-${colors.primary} text-2xl font-bold`}>{canBunk} more classes</span>
                      <span className="mt-2">while maintaining {targetPercentage}% attendance</span>
                    </p>
                  ) : needToAttend > 0 ? (
                    <p className="text-white text-center flex flex-col items-center justify-center">
                      <span className="mb-2">You need to attend</span>
                      <span className={`text-${colors.primary} text-2xl font-bold`}>{needToAttend} more classes</span>
                      <span className="mt-2">to reach {targetPercentage}% attendance</span>
                    </p>
                  ) : (
                    <p className="text-white text-center">You're exactly at the target percentage</p>
                  )}
                </div>

                {/* Visual attendance chart */}
                <div className={`glass-panel p-4 rounded-lg border border-${colors.border}/30`}>
                  <p className="text-white/70 text-sm mb-2 text-center">Attendance Visualization</p>
                  <div className="h-6 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getAttendanceColor(attendancePercentage).replace("text-", "bg-")} transition-all duration-1500 ${animateChart ? "animate-expand" : ""}`}
                      style={{ width: `${Math.min(100, attendancePercentage)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-white/50">
                    <span>0%</span>
                    <span
                      className={`${attendancePercentage >= targetPercentage ? "text-emerald-400" : "text-white/70"}`}
                    >
                      {targetPercentage}%
                    </span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleModelInteraction("Calendar")}
                  className={`flex items-center justify-center space-x-1 px-3 py-2 rounded-lg border border-${colors.border} text-${colors.primary} hover:bg-${colors.primary}/10 transition-all duration-300`}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">Calendar</span>
                </button>
                <button
                  onClick={() => handleModelInteraction("Focus")}
                  className={`flex items-center justify-center space-x-1 px-3 py-2 rounded-lg border border-${colors.border} text-${colors.primary} hover:bg-${colors.primary}/10 transition-all duration-300`}
                >
                  <Focus className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">Focus</span>
                </button>
                <button
                  onClick={() => handleModelInteraction("Chart")}
                  className={`flex items-center justify-center space-x-1 px-3 py-2 rounded-lg border border-${colors.border} text-${colors.primary} hover:bg-${colors.primary}/10 transition-all duration-300`}
                >
                  <PieChart className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">Analytics</span>
                </button>
              </div>
            </div>
          )}

          {/* Input Card */}
          <div
            className={`glass-panel rounded-xl p-6 sm:p-8 transition-all duration-800 border border-white/10 backdrop-blur-lg ${
              hasCalculated && showResults ? "animate-slide-down" : ""
            }`}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Total Classes
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={totalClasses || ""}
                  onChange={(e) => {
                    const value = e.target.value
                    const numValue = value === "" ? 0 : Number(value)
                    setTotalClasses(numValue)
                    if (absences !== null && numValue < absences) {
                      setAbsences(numValue)
                    }
                  }}
                  className="w-full px-4 py-3 rounded-lg glass-input text-white focus:outline-none focus:ring-1 focus:ring-white/20 bg-white/5 border border-white/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="Enter total number of classes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 flex items-center">
                  <XCircle className="w-4 h-4 mr-2" />
                  Classes Missed
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={absences === null ? "" : absences.toString()}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === "") {
                      setAbsences(null)
                    } else {
                      const numValue = Number(value)
                      if (!isNaN(numValue)) {
                        setAbsences(Math.min(totalClasses, numValue))
                      }
                    }
                  }}
                  className="w-full px-4 py-3 rounded-lg glass-input text-white focus:outline-none focus:ring-1 focus:ring-white/20 bg-white/5 border border-white/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="Enter number of classes missed"
                />
                {absences !== null && absences > totalClasses && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Absences cannot exceed total classes
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 flex items-center">
                  <BarChart2 className="w-4 h-4 mr-2" />
                  Target Percentage
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={targetPercentage || ""}
                  onChange={(e) => {
                    const value = e.target.value
                    const numValue = value === "" ? 0 : Math.min(100, Math.max(0, Number(value)))
                    setTargetPercentage(numValue)
                  }}
                  className="w-full px-4 py-3 rounded-lg glass-input text-white focus:outline-none focus:ring-1 focus:ring-white/20 bg-white/5 border border-white/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="Enter target attendance percentage"
                />
              </div>

              {/* Interactive buttons for model control */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => handleModelInteraction("Focus")}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors flex items-center justify-center"
                >
                  <Focus className="w-4 h-4 mr-2" />
                  <span>Focus View</span>
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-white/40 text-xs">
            <p>Attendify • Smart Attendance Calculator</p>
          </div>
          </div>
        )}
      </div>

      {/* Enhanced Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onGuestLogin={handleGuestLogin}
      />

      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        onClose={() => setShowOnboarding(false)}
      />

      <ScreenshotUpload
        isOpen={showScreenshotUpload}
        onClose={() => setShowScreenshotUpload(false)}
        onDataExtracted={handleDataExtracted}
      />
    </div>
  )
}
