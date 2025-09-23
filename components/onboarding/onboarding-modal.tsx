"use client"

import { useState } from "react"
import { Calendar, BookOpen, Target, X, ChevronRight, ChevronLeft } from "lucide-react"

interface OnboardingData {
  semesterEndDate: string
  subjects: Array<{
    name: string
    totalClasses: number
    attendedClasses: number
    targetAttendance: number
  }>
}

interface OnboardingModalProps {
  isOpen: boolean
  onComplete: (data: OnboardingData) => void
  onClose: () => void
}

export default function OnboardingModal({ isOpen, onComplete, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(1)
  const [semesterEndDate, setSemesterEndDate] = useState("")
  const [numSubjects, setNumSubjects] = useState(5)
  const [subjects, setSubjects] = useState([
    { name: "Mathematics", totalClasses: 40, attendedClasses: 32, targetAttendance: 75 },
    { name: "Physics", totalClasses: 38, attendedClasses: 30, targetAttendance: 75 },
    { name: "Chemistry", totalClasses: 42, attendedClasses: 35, targetAttendance: 75 },
    { name: "Computer Science", totalClasses: 36, attendedClasses: 33, targetAttendance: 75 },
    { name: "English", totalClasses: 30, attendedClasses: 28, targetAttendance: 75 }
  ])

  if (!isOpen) return null

  const handleSubjectChange = (index: number, field: string, value: string | number) => {
    const newSubjects = [...subjects]
    newSubjects[index] = { ...newSubjects[index], [field]: value }
    setSubjects(newSubjects)
  }

  const addSubject = () => {
    setSubjects([...subjects, { name: "", totalClasses: 0, attendedClasses: 0, targetAttendance: 75 }])
  }

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index))
  }

  const handleComplete = () => {
    const validSubjects = subjects.filter(s => s.name.trim() !== "")
    onComplete({
      semesterEndDate,
      subjects: validSubjects
    })
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-auto p-6 glass-panel rounded-xl border border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Welcome! Let's set up your profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center space-x-2 mb-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
            step >= 1 ? 'bg-emerald-400 text-black' : 'bg-white/20 text-white/60'
          }`}>
            1
          </div>
          <div className={`flex-1 h-1 ${step > 1 ? 'bg-emerald-400' : 'bg-white/20'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
            step >= 2 ? 'bg-emerald-400 text-black' : 'bg-white/20 text-white/60'
          }`}>
            2
          </div>
          <div className={`flex-1 h-1 ${step > 2 ? 'bg-emerald-400' : 'bg-white/20'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
            step >= 3 ? 'bg-emerald-400 text-black' : 'bg-white/20 text-white/60'
          }`}>
            3
          </div>
        </div>

        {/* Step 1: Semester End Date */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">When does your semester end?</h3>
              <p className="text-white/60 text-sm">This helps us calculate your attendance timeline</p>
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <label className="block text-white/70 text-sm mb-2">Semester End Date</label>
              <input
                type="date"
                value={semesterEndDate}
                onChange={(e) => setSemesterEndDate(e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={nextStep}
                disabled={!semesterEndDate}
                className="flex items-center space-x-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Number of Subjects */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">How many subjects are you taking?</h3>
              <p className="text-white/60 text-sm">We'll help you track attendance for each subject</p>
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <label className="block text-white/70 text-sm mb-2">Number of Subjects</label>
              <input
                type="number"
                min="1"
                max="15"
                value={numSubjects}
                onChange={(e) => {
                  const num = parseInt(e.target.value) || 1
                  setNumSubjects(num)
                  // Adjust subjects array
                  if (num > subjects.length) {
                    const newSubjects = [...subjects]
                    for (let i = subjects.length; i < num; i++) {
                      newSubjects.push({ name: "", totalClasses: 0, attendedClasses: 0, targetAttendance: 75 })
                    }
                    setSubjects(newSubjects)
                  } else {
                    setSubjects(subjects.slice(0, num))
                  }
                }}
                className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="flex items-center space-x-2 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Subject Details */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Enter your current attendance</h3>
              <p className="text-white/60 text-sm">Fill in your current attendance for each subject</p>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {subjects.map((subject, index) => (
                <div key={index} className="bg-white/5 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium">Subject {index + 1}</h4>
                    {subjects.length > 1 && (
                      <button
                        onClick={() => removeSubject(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white/70 text-xs mb-1">Subject Name</label>
                      <input
                        type="text"
                        value={subject.name}
                        onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                        className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-400"
                        placeholder="e.g., Mathematics"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-xs mb-1">Target Attendance (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={subject.targetAttendance}
                        onChange={(e) => handleSubjectChange(index, 'targetAttendance', parseInt(e.target.value) || 75)}
                        className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-xs mb-1">Total Classes</label>
                      <input
                        type="number"
                        min="0"
                        value={subject.totalClasses}
                        onChange={(e) => handleSubjectChange(index, 'totalClasses', parseInt(e.target.value) || 0)}
                        className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-xs mb-1">Classes Attended</label>
                      <input
                        type="number"
                        min="0"
                        max={subject.totalClasses}
                        value={subject.attendedClasses}
                        onChange={(e) => handleSubjectChange(index, 'attendedClasses', parseInt(e.target.value) || 0)}
                        className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addSubject}
              className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm border border-white/20"
            >
              + Add Another Subject
            </button>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="flex items-center space-x-2 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={handleComplete}
                className="flex items-center space-x-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white"
              >
                <span>Complete Setup</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}