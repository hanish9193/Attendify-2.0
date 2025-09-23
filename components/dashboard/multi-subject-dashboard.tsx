"use client"

import { useState, useEffect } from "react"
import { Plus, Camera, BarChart3, Calendar, Target, TrendingUp, BookOpen, AlertTriangle, CheckCircle } from "lucide-react"

interface Subject {
  id: number
  name: string
  targetAttendance: number
  totalClasses: number
  attendedClasses: number
  isActive: boolean
}

interface MultiSubjectDashboardProps {
  subjects: Subject[]
  onAddSubject: () => void
  onEditSubject: (subject: Subject) => void
  onUploadScreenshot: () => void
  splineObj: any
}

export default function MultiSubjectDashboard({ 
  subjects, 
  onAddSubject, 
  onEditSubject, 
  onUploadScreenshot,
  splineObj 
}: MultiSubjectDashboardProps) {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [overallStats, setOverallStats] = useState({
    totalClasses: 0,
    totalAttended: 0,
    overallPercentage: 0,
    subjectsOnTrack: 0,
    subjectsAtRisk: 0
  })

  // Calculate overall statistics
  useEffect(() => {
    if (subjects.length > 0) {
      const totalClasses = subjects.reduce((sum, subject) => sum + subject.totalClasses, 0)
      const totalAttended = subjects.reduce((sum, subject) => sum + subject.attendedClasses, 0)
      const overallPercentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0
      const subjectsOnTrack = subjects.filter(s => 
        s.totalClasses > 0 && (s.attendedClasses / s.totalClasses) * 100 >= s.targetAttendance
      ).length
      const subjectsAtRisk = subjects.filter(s => 
        s.totalClasses > 0 && (s.attendedClasses / s.totalClasses) * 100 < s.targetAttendance - 10
      ).length

      setOverallStats({
        totalClasses,
        totalAttended,
        overallPercentage: Number(overallPercentage.toFixed(1)),
        subjectsOnTrack,
        subjectsAtRisk
      })

      // Animate 3D model based on overall performance
      if (splineObj) {
        try {
          if (overallPercentage >= 75) {
            splineObj.playAnimation("Success")
          } else if (overallPercentage >= 65) {
            splineObj.playAnimation("Warning")
          } else {
            splineObj.playAnimation("Danger")
          }
        } catch (err) {
          console.log("Animation not found in the 3D model")
        }
      }
    }
  }, [subjects, splineObj])

  const calculateSubjectMetrics = (subject: Subject) => {
    if (subject.totalClasses === 0) {
      return {
        percentage: 0,
        canBunk: 0,
        needToAttend: 0,
        status: 'no-data' as const
      }
    }

    const percentage = (subject.attendedClasses / subject.totalClasses) * 100
    const targetDecimal = subject.targetAttendance / 100
    
    // Calculate how many classes can be bunked
    const maxAbsencesPossible = Math.floor(subject.attendedClasses / targetDecimal - subject.totalClasses)
    
    let canBunk = 0
    let needToAttend = 0
    let status: 'excellent' | 'good' | 'warning' | 'danger' = 'good'

    if (maxAbsencesPossible >= 0) {
      canBunk = maxAbsencesPossible
      needToAttend = 0
    } else {
      let additionalClasses = 0
      let newTotal = subject.totalClasses
      let newAttended = subject.attendedClasses

      while ((newAttended / newTotal) * 100 < subject.targetAttendance) {
        additionalClasses++
        newTotal++
        newAttended++
      }

      canBunk = 0
      needToAttend = additionalClasses
    }

    // Determine status
    if (percentage >= subject.targetAttendance + 10) {
      status = 'excellent'
    } else if (percentage >= subject.targetAttendance) {
      status = 'good'
    } else if (percentage >= subject.targetAttendance - 10) {
      status = 'warning'
    } else {
      status = 'danger'
    }

    return {
      percentage: Number(percentage.toFixed(1)),
      canBunk,
      needToAttend,
      status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'emerald-400'
      case 'good': return 'emerald-400'
      case 'warning': return 'yellow-400'
      case 'danger': return 'red-400'
      default: return 'gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />
      case 'good': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'danger': return <AlertTriangle className="w-4 h-4" />
      default: return <BarChart3 className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Statistics Card */}
      <div className="glass-panel rounded-xl p-6 border border-white/10 bg-white/5 backdrop-blur-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <BarChart3 className="w-6 h-6 mr-2" />
            Overall Performance
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={onUploadScreenshot}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white flex items-center space-x-2"
              title="Upload Screenshot for AI Analysis"
            >
              <Camera className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">AI Extract</span>
            </button>
            <button
              onClick={onAddSubject}
              className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 transition-all text-white flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Add Subject</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-lg border border-white/10">
            <div className="text-2xl font-bold text-emerald-400">{overallStats.overallPercentage}%</div>
            <div className="text-white/60 text-sm">Overall Attendance</div>
          </div>
          <div className="glass-panel p-4 rounded-lg border border-white/10">
            <div className="text-2xl font-bold text-white">{overallStats.totalAttended}/{overallStats.totalClasses}</div>
            <div className="text-white/60 text-sm">Classes Attended</div>
          </div>
          <div className="glass-panel p-4 rounded-lg border border-white/10">
            <div className="text-2xl font-bold text-emerald-400">{overallStats.subjectsOnTrack}</div>
            <div className="text-white/60 text-sm">On Track</div>
          </div>
          <div className="glass-panel p-4 rounded-lg border border-white/10">
            <div className="text-2xl font-bold text-red-400">{overallStats.subjectsAtRisk}</div>
            <div className="text-white/60 text-sm">At Risk</div>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => {
          const metrics = calculateSubjectMetrics(subject)
          const statusColor = getStatusColor(metrics.status)
          
          return (
            <div 
              key={subject.id}
              className="glass-panel rounded-xl p-4 border border-white/10 bg-white/5 backdrop-blur-lg hover:border-white/20 transition-all cursor-pointer"
              onClick={() => onEditSubject(subject)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {subject.name}
                </h3>
                <div className={`text-${statusColor}`}>
                  {getStatusIcon(metrics.status)}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative w-full h-3 bg-white/10 rounded-full mb-3 overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full bg-${statusColor}`}
                  style={{ width: `${Math.min(metrics.percentage, 100)}%` }}
                />
                <div 
                  className="absolute top-0 h-full border-r-2 border-white/70"
                  style={{ left: `${subject.targetAttendance}%` }}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="text-white/60">Current</div>
                  <div className={`font-bold text-${statusColor}`}>{metrics.percentage}%</div>
                </div>
                <div>
                  <div className="text-white/60">Target</div>
                  <div className="text-white font-bold">{subject.targetAttendance}%</div>
                </div>
                <div>
                  <div className="text-white/60">Classes</div>
                  <div className="text-white font-bold">{subject.attendedClasses}/{subject.totalClasses}</div>
                </div>
              </div>

              {/* Action Information */}
              <div className="mt-3 pt-3 border-t border-white/10">
                {metrics.canBunk > 0 ? (
                  <div className="text-emerald-400 text-xs text-center">
                    Can miss {metrics.canBunk} more classes
                  </div>
                ) : metrics.needToAttend > 0 ? (
                  <div className="text-red-400 text-xs text-center">
                    Need to attend {metrics.needToAttend} more classes
                  </div>
                ) : (
                  <div className="text-white/60 text-xs text-center">
                    Exactly on target
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Add Subject Card */}
        <div 
          className="glass-panel rounded-xl p-4 border border-white/20 border-dashed bg-white/5 backdrop-blur-lg hover:border-white/30 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
          onClick={onAddSubject}
        >
          <Plus className="w-8 h-8 text-white/60 mb-2" />
          <div className="text-white/60 text-sm text-center">Add New Subject</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-panel rounded-xl p-4 border border-white/10 bg-white/5 backdrop-blur-lg">
        <h3 className="text-white font-medium mb-3 flex items-center">
          <Target className="w-4 h-4 mr-2" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={onUploadScreenshot}
            className="flex items-center space-x-2 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
          >
            <Camera className="w-4 h-4" />
            <span className="text-sm">Upload Portal Screenshot</span>
          </button>
          <button className="flex items-center space-x-2 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">View Attendance Calendar</span>
          </button>
          <button className="flex items-center space-x-2 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Generate Report</span>
          </button>
        </div>
      </div>
    </div>
  )
}