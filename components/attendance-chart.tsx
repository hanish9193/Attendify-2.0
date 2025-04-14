"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { BarChart2, Calendar, PieChart, TrendingUp, Info, ChevronDown, ChevronUp, Plus, Check, X } from "lucide-react"

interface AttendanceChartProps {
  attendancePercentage: number
  targetPercentage: number
  totalClasses: number
  absences: number
  attendanceHistory: {
    date: string
    status: "present" | "absent"
  }[]
  onAddAttendance?: (date: string, status: "present" | "absent") => void
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({
  attendancePercentage,
  targetPercentage,
  totalClasses,
  absences,
  attendanceHistory,
  onAddAttendance,
}) => {
  const pieChartRef = useRef<HTMLCanvasElement>(null)
  const trendChartRef = useRef<HTMLCanvasElement>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "all">("month")
  const [showDetails, setShowDetails] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [selectedStatus, setSelectedStatus] = useState<"present" | "absent">("present")

  // Draw pie chart (same as before)
  useEffect(() => {
    if (!pieChartRef.current) return

    const ctx = pieChartRef.current.getContext("2d")
    if (!ctx) return

    const present = totalClasses - absences
    const absent = absences

    // Clear canvas
    ctx.clearRect(0, 0, pieChartRef.current.width, pieChartRef.current.height)

    // Draw pie chart
    const centerX = pieChartRef.current.width / 2
    const centerY = pieChartRef.current.height / 2
    const radius = Math.min(centerX, centerY) - 10

    // Present slice
    const presentAngle = (present / totalClasses) * 2 * Math.PI

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, 0, presentAngle)
    ctx.fillStyle = "rgba(52, 211, 153, 0.8)" // emerald-400
    ctx.fill()

    // Absent slice
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, presentAngle, 2 * Math.PI)
    ctx.fillStyle = "rgba(248, 113, 113, 0.8)" // red-400
    ctx.fill()

    // Inner circle for donut chart
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI)
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.fill()

    // Text in center
    ctx.font = "bold 16px sans-serif"
    ctx.fillStyle = "white"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`${attendancePercentage}%`, centerX, centerY)
  }, [attendancePercentage, totalClasses, absences])

  // Draw trend chart or show quick add interface
  useEffect(() => {
    if (!trendChartRef.current) return

    const ctx = trendChartRef.current.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, trendChartRef.current.width, trendChartRef.current.height)

    const chartWidth = trendChartRef.current.width
    const chartHeight = trendChartRef.current.height
    const padding = 30

    // If there's no attendance data, show a simplified interface
    if (attendanceHistory.length === 0 || !attendanceHistory.some(entry => 
      selectedPeriod === "all" || 
      (selectedPeriod === "week" && new Date(entry.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (selectedPeriod === "month" && new Date(entry.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    )) {
      if (!showQuickAdd) {
        // Draw empty state with CTA
        ctx.font = "16px sans-serif"
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("No attendance data to display", chartWidth / 2, chartHeight / 2 - 15)
        
        ctx.font = "14px sans-serif"
        ctx.fillStyle = "rgba(52, 211, 153, 0.8)"
        ctx.fillText("Click to record your attendance", chartWidth / 2, chartHeight / 2 + 15)
        
        // Draw a plus icon
        const iconSize = 24;
        const iconX = chartWidth / 2;
        const iconY = chartHeight / 2 + 50;
        const halfSize = iconSize / 2;
        
        ctx.beginPath();
        ctx.arc(iconX, iconY, halfSize, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(52, 211, 153, 0.8)";
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(iconX - halfSize/2, iconY);
        ctx.lineTo(iconX + halfSize/2, iconY);
        ctx.moveTo(iconX, iconY - halfSize/2);
        ctx.lineTo(iconX, iconY + halfSize/2);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add click handler
        const handleClick = (e: MouseEvent) => {
          const rect = trendChartRef.current!.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const distance = Math.sqrt(
            Math.pow(x - iconX, 2) + 
            Math.pow(y - iconY, 2)
          );
          
          if (distance <= halfSize) {
            setShowQuickAdd(true);
          }
        };
        
        trendChartRef.current.addEventListener("click", handleClick);
        
        return () => {
          trendChartRef.current?.removeEventListener("click", handleClick);
        };
      }
    } else {
      // Draw regular chart with data (similar to your previous implementation)
      // Draw axes
      ctx.beginPath()
      ctx.moveTo(padding, padding)
      ctx.lineTo(padding, chartHeight - padding)
      ctx.lineTo(chartWidth - padding, chartHeight - padding)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
      ctx.stroke()

      // Draw target line
      const availableHeight = chartHeight - padding * 2
      const targetY = chartHeight - padding - availableHeight * (targetPercentage / 100)
      ctx.beginPath()
      ctx.moveTo(padding, targetY)
      ctx.lineTo(chartWidth - padding, targetY)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
      ctx.setLineDash([5, 5])
      ctx.stroke()
      ctx.setLineDash([])

      // Target label
      ctx.font = "10px sans-serif"
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
      ctx.textAlign = "left"
      ctx.fillText(`Target ${targetPercentage}%`, padding + 5, targetY - 5)
      
      // Filter data based on selected period
      let filteredHistory = [...attendanceHistory]
      
      if (selectedPeriod === "week") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filteredHistory = attendanceHistory.filter(entry => 
          new Date(entry.date) >= oneWeekAgo
        );
      } else if (selectedPeriod === "month") {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        filteredHistory = attendanceHistory.filter(entry => 
          new Date(entry.date) >= oneMonthAgo
        );
      }
      
      // Sort by date
      filteredHistory = filteredHistory.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Calculate running attendance percentage
      const dataPoints: Array<{date: string, percentage: number}> = [];
      let present = 0;
      let total = 0;
      
      filteredHistory.forEach(entry => {
        if (entry.status === "present") present += 1;
        total += 1;
        const percentage = (present / total) * 100;
        dataPoints.push({
          date: entry.date,
          percentage
        });
      });
      
      // Draw the trend line
      const availableWidth = chartWidth - padding * 2;
      const pointWidth = availableWidth / (dataPoints.length - 1 || 1);
      
      // Grid lines
      for (let i = 25; i <= 100; i += 25) {
        const y = chartHeight - padding - availableHeight * (i / 100);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(chartWidth - padding, y);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.stroke();
        
        // Grid labels
        ctx.font = "10px sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.textAlign = "right";
        ctx.fillText(`${i}%`, padding - 5, y);
      }
      
      // If we have enough data points, draw the line
      if (dataPoints.length > 1) {
        ctx.beginPath();
        
        // Move to first point
        const firstY = chartHeight - padding - availableHeight * (dataPoints[0].percentage / 100);
        ctx.moveTo(padding, firstY);
        
        // Draw line to other points
        dataPoints.forEach((point, index) => {
          if (index === 0) return; // Skip first point as we've already moved to it
          
          const x = padding + index * pointWidth;
          const y = chartHeight - padding - availableHeight * (point.percentage / 100);
          ctx.lineTo(x, y);
        });
        
        ctx.strokeStyle = "rgba(52, 211, 153, 0.8)"; // emerald color
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw points
        dataPoints.forEach((point, index) => {
          const x = padding + index * pointWidth;
          const y = chartHeight - padding - availableHeight * (point.percentage / 100);
          
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(52, 211, 153, 0.8)";
          ctx.fill();
          ctx.strokeStyle = "white";
          ctx.lineWidth = 1;
          ctx.stroke();
        });
        
        // Add date labels for first and last point
        if (dataPoints.length >= 2) {
          const formatDate = (dateStr: string) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          };
          
          // First date
          ctx.font = "10px sans-serif";
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
          ctx.textAlign = "left";
          ctx.fillText(formatDate(dataPoints[0].date), padding, chartHeight - padding + 15);
          
          // Last date
          ctx.textAlign = "right";
          ctx.fillText(
            formatDate(dataPoints[dataPoints.length - 1].date), 
            chartWidth - padding, 
            chartHeight - padding + 15
          );
        }
      } else if (dataPoints.length === 1) {
        // Single data point
        const x = chartWidth / 2;
        const y = chartHeight - padding - availableHeight * (dataPoints[0].percentage / 100);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(52, 211, 153, 0.8)";
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Date label
        const formatDate = (dateStr: string) => {
          const date = new Date(dateStr);
          return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        };
        
        ctx.font = "10px sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.textAlign = "center";
        ctx.fillText(formatDate(dataPoints[0].date), x, chartHeight - padding + 15);
        
        // Current percentage label
        ctx.font = "bold 10px sans-serif";
        ctx.fillStyle = "rgba(52, 211, 153, 1)";
        ctx.textAlign = "left";
        ctx.fillText(`${dataPoints[0].percentage.toFixed(1)}%`, x + 10, y);
      }
    }
  }, [targetPercentage, attendanceHistory, selectedPeriod, showQuickAdd]);

  // Calculate statistics
  const presentDays = attendanceHistory.filter((day) => day.status === "present").length
  const absentDays = attendanceHistory.filter((day) => day.status === "absent").length
  const totalDays = presentDays + absentDays
  
  // For the new Quick Add attendance feature
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };
  
  const handleSubmit = () => {
    if (onAddAttendance && selectedDate) {
      onAddAttendance(selectedDate, selectedStatus);
      setShowQuickAdd(false);
    }
  };
  
  const handleCancel = () => {
    setShowQuickAdd(false);
  };

  // Calculate classes needed to reach target
  const calculateClassesNeeded = () => {
    if (attendancePercentage >= targetPercentage) return 0;
    
    const present = totalClasses - absences;
    let totalNeeded = totalClasses;
    let presentNeeded = present;
    
    while ((presentNeeded / totalNeeded) * 100 < targetPercentage) {
      presentNeeded++;
      totalNeeded++;
    }
    
    return presentNeeded - present;
  };
  
  const classesNeededForTarget = calculateClassesNeeded();

  return (
    <div className="space-y-6">
      {/* Attendance overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-4 rounded-lg border border-white/10 transition-all duration-200 hover:border-white/20">
          <h4 className="text-white/70 text-sm mb-2 flex items-center">
            <PieChart className="w-4 h-4 mr-1" /> Current Attendance
          </h4>
          <div className="flex justify-center">
            <canvas ref={pieChartRef} width={150} height={150}></canvas>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-lg border border-white/10 transition-all duration-200 hover:border-white/20">
          <h4 className="text-white/70 text-sm mb-2">Statistics</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-xs">Total Classes</span>
              <span className="text-white font-medium">{totalClasses}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-xs">Classes Attended</span>
              <span className="text-emerald-400 font-medium">{totalClasses - absences}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-xs">Classes Missed</span>
              <span className="text-red-400 font-medium">{absences}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-xs">Target</span>
              <span className="text-white font-medium">{targetPercentage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-xs">Current</span>
              <span
                className={`font-medium ${
                  attendancePercentage >= targetPercentage
                    ? "text-emerald-400"
                    : attendancePercentage >= targetPercentage - 5
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}
              >
                {attendancePercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trend chart with Quick Add feature */}
      <div className="glass-panel p-4 rounded-lg border border-white/10 transition-all duration-200 hover:border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-white/70 text-sm flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" /> Attendance Trend
          </h4>
          <div className="flex space-x-2 text-xs">
            <button 
              onClick={() => setSelectedPeriod("week")}
              className={`px-2 py-1 rounded ${
                selectedPeriod === "week" 
                  ? "bg-white/20 text-white" 
                  : "text-white/70 hover:bg-white/10"
              }`}
            >
              Week
            </button>
            <button 
              onClick={() => setSelectedPeriod("month")}
              className={`px-2 py-1 rounded ${
                selectedPeriod === "month" 
                  ? "bg-white/20 text-white" 
                  : "text-white/70 hover:bg-white/10"
              }`}
            >
              Month
            </button>
            <button 
              onClick={() => setSelectedPeriod("all")}
              className={`px-2 py-1 rounded ${
                selectedPeriod === "all" 
                  ? "bg-white/20 text-white" 
                  : "text-white/70 hover:bg-white/10"
              }`}
            >
              All
            </button>
          </div>
        </div>
        
        {showQuickAdd ? (
          <div className="bg-white/5 p-4 rounded-lg mb-2">
            <h3 className="text-white text-sm font-medium mb-3">Record Attendance</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-xs mb-1">Date</label>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>
              
              <div>
                <label className="block text-white/70 text-xs mb-1">Status</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedStatus("present")}
                    className={`flex-1 py-2 rounded text-sm ${
                      selectedStatus === "present"
                        ? "bg-emerald-400/20 text-emerald-400 border border-emerald-400/50"
                        : "bg-black/20 text-white/70 border border-white/10 hover:bg-white/5"
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => setSelectedStatus("absent")}
                    className={`flex-1 py-2 rounded text-sm ${
                      selectedStatus === "absent"
                        ? "bg-red-400/20 text-red-400 border border-red-400/50"
                        : "bg-black/20 text-white/70 border border-white/10 hover:bg-white/5"
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded text-sm flex items-center justify-center"
                >
                  <Check className="w-4 h-4 mr-1" /> Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded text-sm flex items-center justify-center"
                >
                  <X className="w-4 h-4 mr-1" /> Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <canvas 
              ref={trendChartRef} 
              width={400} 
              height={200}
              onClick={() => {
                if (attendanceHistory.length === 0 || !attendanceHistory.some(entry => 
                  selectedPeriod === "all" || 
                  (selectedPeriod === "week" && new Date(entry.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
                  (selectedPeriod === "month" && new Date(entry.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                )) {
                  setShowQuickAdd(true);
                }
              }}
              style={{ cursor: attendanceHistory.length === 0 ? 'pointer' : 'default' }}
            ></canvas>
          </div>
        )}
        
        <div className="flex justify-center space-x-4 text-xs mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-emerald-400/80 mr-1"></div>
            <span className="text-white/70">Present</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-400/80 mr-1"></div>
            <span className="text-white/70">Absent</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 border border-dashed border-white/50 mr-1"></div>
            <span className="text-white/70">Target</span>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="glass-panel p-4 rounded-lg border border-white/10 transition-all duration-200 hover:border-white/20">
        <h4 className="text-white font-medium mb-3 flex items-center justify-between cursor-pointer" 
          onClick={() => setShowDetails(!showDetails)}>
          <div className="flex items-center">
            <BarChart2 className="w-4 h-4 mr-2" /> Insights
          </div>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </h4>
        <div className="space-y-3 text-sm">
          {attendancePercentage < targetPercentage ? (
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-white/80">
                You need to improve your attendance by{" "}
                <span className="text-yellow-400 font-medium">
                  {(targetPercentage - attendancePercentage).toFixed(1)}%
                </span>{" "}
                to reach your target.
                {classesNeededForTarget > 0 && (
                  <span> Attend <span className="text-yellow-400 font-medium">{classesNeededForTarget}</span> more consecutive classes to meet your target.</span>
                )}
              </p>
            </div>
          ) : (
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <p className="text-white/80">
                Great job! You're{" "}
                <span className="text-emerald-400 font-medium">
                  {(attendancePercentage - targetPercentage).toFixed(1)}%
                </span>{" "}
                above your target attendance.
              </p>
            </div>
          )}

          {totalDays === 0 && !showQuickAdd && (
            <div className="flex items-center justify-center mt-4">
              <button 
                onClick={() => setShowQuickAdd(true)} 
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Record Your First Attendance</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick reference calendar */}
      {totalClasses > 0 && (
        <div className="glass-panel p-4 rounded-lg border border-white/10 transition-all duration-200 hover:border-white/20">
          <h4 className="text-white font-medium mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2" /> 
            Attendance Forecast
          </h4>
          <div className="space-y-3">
            <div className="p-3 bg-white/5 rounded-lg">
              <h5 className="text-xs text-white/70 mb-2">If you continue with current rate...</h5>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80 text-sm">Final attendance:</span>
                <span className={`text-sm font-medium ${
                  attendancePercentage >= targetPercentage
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}>
                  {attendancePercentage}%
                </span>
              </div>
              
              {attendancePercentage < targetPercentage && (
                <div className="bg-yellow-400/10 border border-yellow-400/20 p-3 rounded-lg">
                  <div className="flex items-start">
                    <div className="rounded-full bg-yellow-400/20 p-1 mr-2">
                      <Info className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-white text-xs">
                        To reach your target, you need to attend <strong>{classesNeededForTarget}</strong> more 
                        {classesNeededForTarget === 1 ? ' class' : ' classes'} without any absences.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {attendancePercentage >= targetPercentage && totalDays > 0 && (
                <div className="bg-emerald-400/10 border border-emerald-400/20 p-3 rounded-lg">
                  <div className="flex items-start">
                    <div className="rounded-full bg-emerald-400/20 p-1 mr-2">
                      <Info className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white text-xs">
                        You're on track to exceed your target! You can miss up to{" "}
                        <strong>{Math.floor(totalClasses * (1 - targetPercentage/100) - absences)}</strong>
                        {Math.floor(totalClasses * (1 - targetPercentage/100) - absences) === 1 ? ' more class' : ' more classes'} and still meet your target.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-3 flex justify-center">
              <button 
                onClick={() => setShowQuickAdd(true)}
                className="flex items-center justify-center space-x-1 text-emerald-400 hover:text-emerald-300 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Attendance Record</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceChart