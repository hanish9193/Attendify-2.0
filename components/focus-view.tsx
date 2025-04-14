"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { 
  Focus, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Trophy,
  Target,
  BarChart3,
  AlertCircle,
  LineChart,
  BookOpen
} from "lucide-react"

interface FocusViewProps {
  attendancePercentage: number
  targetPercentage: number
  canBunk: number
  needToAttend: number
  totalClasses: number
  attendedClasses: number
  subjectName?: string
  streakDays?: number
}

const FocusView: React.FC<FocusViewProps> = ({ 
  attendancePercentage, 
  targetPercentage, 
  canBunk, 
  needToAttend,
  totalClasses = 60,
  attendedClasses = 45,
  subjectName = "Overall",
  streakDays = 7
}) => {
  const [showStreak, setShowStreak] = useState<boolean>(true)
  const [activeFocus, setActiveFocus] = useState<string>("attendance")
  const [progressHistory, setProgressHistory] = useState<number[]>([])

  // Generate simulated progress history data
  useEffect(() => {
    // Create a simulated attendance history
    const history: number[] = []
    let currentPercentage = attendancePercentage - 10
    
    // Ensure starting point is not negative
    if (currentPercentage < 0) currentPercentage = 5
    
    // Generate 7 data points with a general upward trend
    for (let i = 0; i < 7; i++) {
      // Add some randomness but ensure general upward trend
      const change = Math.random() * 5 - 1 // Random change between -1 and 4
      currentPercentage += change
      
      // Keep within reasonable bounds
      if (currentPercentage > 100) currentPercentage = 100
      if (currentPercentage < 0) currentPercentage = 0
      
      history.push(Math.round(currentPercentage))
    }
    
    // Ensure the last point matches the current attendance percentage
    history[6] = attendancePercentage
    
    setProgressHistory(history)
  }, [attendancePercentage])

  // Get status based on attendance percentage
  const getAttendanceStatus = () => {
    if (attendancePercentage >= targetPercentage) {
      return {
        icon: <CheckCircle className="w-6 h-6 text-emerald-400" />,
        message: "You're on track!",
        description: `Your attendance is above the ${targetPercentage}% target.`,
        colorClass: "bg-emerald-400/20",
        textClass: "text-emerald-400"
      }
    } else if (attendancePercentage >= targetPercentage - 5) {
      return {
        icon: <Focus className="w-6 h-6 text-yellow-400" />,
        message: "Almost there!",
        description: `You're close to the ${targetPercentage}% target.`,
        colorClass: "bg-yellow-400/20",
        textClass: "text-yellow-400"
      }
    } else {
      return {
        icon: <XCircle className="w-6 h-6 text-red-400" />,
        message: "Needs improvement",
        description: `You're below the ${targetPercentage}% target.`,
        colorClass: "bg-red-400/20",
        textClass: "text-red-400"
      }
    }
  }

  // Calculate remaining classes to reach maximum
  const remainingClasses = totalClasses - attendedClasses

  // Calculate threshold for attendance warning
  const isAttendanceCritical = attendancePercentage < targetPercentage - 10

  const status = getAttendanceStatus()

  return (
    <div className="space-y-6">
      {/* Focus mode header */}
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${status.colorClass} mb-4`}>
          {status.icon}
        </div>
        <h3 className="text-xl font-bold text-white">{status.message}</h3>
        <p className="text-white/60 text-sm">{status.description}</p>
      </div>

      {/* Subject Stats */}
      <div className="bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-medium flex items-center">
            <BookOpen className="w-4 h-4 mr-2" /> {subjectName} Stats
          </h4>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.textClass} ${status.colorClass}`}>
            {attendancePercentage}%
          </span>
        </div>

        <div className="relative w-full h-3 bg-white/10 rounded-full mb-4 overflow-hidden">
          <div 
            className={`absolute top-0 left-0 h-full ${
              attendancePercentage >= targetPercentage 
                ? "bg-emerald-400" 
                : attendancePercentage >= targetPercentage - 10 
                  ? "bg-yellow-400" 
                  : "bg-red-400"
            }`}
            style={{ width: `${attendancePercentage}%` }}
          />
          <div 
            className="absolute top-0 h-full border-r-2 border-white/70"
            style={{ left: `${targetPercentage}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-white/70 text-xs mb-1">Attended</div>
            <div className="text-lg font-bold text-white">{attendedClasses}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-white/70 text-xs mb-1">Target</div>
            <div className="text-lg font-bold text-white">{Math.ceil((targetPercentage / 100) * totalClasses)}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-white/70 text-xs mb-1">Total</div>
            <div className="text-lg font-bold text-white">{totalClasses}</div>
          </div>
        </div>
      </div>

      {/* Focus Mode Tabs */}
      <div className="flex space-x-2 mb-2">
        <button 
          onClick={() => setActiveFocus("attendance")}
          className={`py-2 px-4 rounded-lg flex items-center ${
            activeFocus === "attendance" 
              ? "bg-white/20 text-white" 
              : "bg-white/5 text-white/60"
          }`}
        >
          <Calendar className="w-4 h-4 mr-1" />
          <span className="text-sm">Attendance</span>
        </button>
        <button 
          onClick={() => setActiveFocus("progress")}
          className={`py-2 px-4 rounded-lg flex items-center ${
            activeFocus === "progress" 
              ? "bg-white/20 text-white" 
              : "bg-white/5 text-white/60"
          }`}
        >
          <TrendingUp className="w-4 h-4 mr-1" />
          <span className="text-sm">Progress</span>
        </button>
      </div>

      {/* Attendance Panel */}
      {activeFocus === "attendance" && (
        <div className="bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10">
          <h4 className="text-white font-medium flex items-center mb-3">
            <Target className="w-4 h-4 mr-2" /> Attendance Insights
          </h4>

          {/* Attendance Status Detail */}
          {canBunk > 0 ? (
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white text-sm">
                  You can miss <span className="font-bold text-emerald-400">{canBunk}</span> more classes
                </p>
                <p className="text-white/60 text-xs">And still meet your target</p>
              </div>
            </div>
          ) : needToAttend > 0 ? (
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-400/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-white text-sm">
                  Attend <span className="font-bold text-red-400">{needToAttend}</span> more classes
                </p>
                <p className="text-white/60 text-xs">To reach your target attendance</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white text-sm">You're exactly at target!</p>
                <p className="text-white/60 text-xs">Keep up the good work</p>
              </div>
            </div>
          )}

          {/* Remaining Classes */}
          <div className="bg-white/10 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">Remaining Classes</span>
              <span className="text-white font-bold">{remainingClasses}</span>
            </div>
            <div className="relative w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-blue-400"
                style={{ width: `${(attendedClasses / totalClasses) * 100}%` }}
              />
            </div>
          </div>

          {/* Warning for Critical Attendance (if applicable) */}
          {isAttendanceCritical && (
            <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-3">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-red-400 text-sm font-medium">Critical Attendance Warning</p>
                  <p className="text-white/60 text-xs mt-1">
                    Your attendance is significantly below target. Missing more classes could affect your academic standing.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Panel */}
      {activeFocus === "progress" && (
        <div className="bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10">
          <h4 className="text-white font-medium flex items-center mb-3">
            <BarChart3 className="w-4 h-4 mr-2" /> Progress Tracker
          </h4>

          {/* Weekly Trend */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm">Weekly Trend</span>
              <span className={`text-xs font-medium ${
                progressHistory[6] > progressHistory[0] ? "text-emerald-400" : "text-red-400"
              }`}>
                {progressHistory[6] > progressHistory[0] ? "↑ Improving" : "↓ Declining"}
              </span>
            </div>
            
            <div className="h-24 flex items-end space-x-1">
              {progressHistory.map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className={`w-full rounded-t-sm ${
                      value >= targetPercentage ? "bg-emerald-400" : 
                      value >= targetPercentage - 10 ? "bg-yellow-400" : "bg-red-400"
                    }`}
                    style={{ height: `${(value / 100) * 80}px` }}
                  />
                  <span className="text-white/60 text-xs mt-1">{value}%</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-white/40 text-xs mt-1">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          {/* Attendance Streak */}
          <div 
            className="bg-white/10 rounded-lg p-3 cursor-pointer"
            onClick={() => setShowStreak(!showStreak)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                <span className="text-white text-sm">Attendance Streak</span>
              </div>
              <span className="text-white font-bold">{streakDays} days</span>
            </div>
            
            {showStreak && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex space-x-1">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <div 
                      key={index} 
                      className={`flex-1 h-2 rounded-full ${
                        index < streakDays % 7 ? "bg-yellow-400" : "bg-white/20"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-white/60 text-xs mt-2 text-center">
                  {streakDays > 0 
                    ? `Keep going! Your best streak is ${Math.max(streakDays, 14)} days.` 
                    : "Start attending classes to build your streak!"}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Focus mode recommendations */}
      <div className="bg-white/5 backdrop-blur-lg p-4 rounded-lg border border-white/10">
        <h4 className="text-white font-medium mb-3 flex items-center">
          <LineChart className="w-4 h-4 mr-2" /> Recommendations
        </h4>

        <ul className="space-y-2">
          {/* Dynamic recommendations based on attendance */}
          {attendancePercentage < targetPercentage && (
            <li className="text-white/80 text-sm flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-emerald-400" />
              <span>Attend the next {needToAttend} classes consistently to reach your target</span>
            </li>
          )}
          
          {canBunk > 2 && (
            <li className="text-white/80 text-sm flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-emerald-400" />
              <span>You're doing great! Consider using bunk allowance for important events only</span>
            </li>
          )}
          
          {attendancePercentage < 50 && (
            <li className="text-white/80 text-sm flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 text-red-400" />
              <span>Your attendance is concerning - speak with an advisor if you need help</span>
            </li>
          )}
          
          <li className="text-white/80 text-sm flex items-start">
            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-emerald-400" />
            <span>Track your attendance weekly for better results</span>
          </li>
          
          <li className="text-white/80 text-sm flex items-start">
            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-emerald-400" />
            <span>Set reminders the night before each class</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default FocusView