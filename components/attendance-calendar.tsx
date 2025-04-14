import { useState } from "react"
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react"

// Indian holidays for 2025
const INDIAN_GOV_HOLIDAYS_2025 = [
  // January
  { date: "2025-01-01", name: "New Year's Day", type: "GOVERNMENT" },
  { date: "2025-01-13", name: "Bhogi", type: "GOVERNMENT" },
  { date: "2025-01-14", name: "Makar Sankranti / Pongal", type: "GOVERNMENT" },
  { date: "2025-01-15", name: "Mattu Pongal / Kanuma", type: "GOVERNMENT" },
  { date: "2025-01-26", name: "Republic Day", type: "NATIONAL" },
  // February
  { date: "2025-02-19", name: "Chhatrapati Shivaji Maharaj Jayanti", type: "GOVERNMENT" },
  // March
  { date: "2025-03-06", name: "Holi", type: "GOVERNMENT" },
  { date: "2025-03-17", name: "Ram Navami", type: "GOVERNMENT" },
  { date: "2025-03-25", name: "Ugadi / Gudi Padwa / Cheti Chand", type: "GOVERNMENT" },
  // April
  { date: "2025-04-02", name: "Mahavir Jayanti", type: "GOVERNMENT" },
  { date: "2025-04-05", name: "Good Friday", type: "GOVERNMENT" },
  { date: "2025-04-14", name: "Ambedkar Jayanti", type: "NATIONAL" },
  { date: "2025-04-14", name: "Vaisakhi / Vishu / Pohela Boishakh / Puthandu", type: "GOVERNMENT" },
  { date: "2025-04-21", name: "Hanuman Jayanti", type: "GOVERNMENT" },
  // May
  { date: "2025-05-01", name: "Labor Day / Maharashtra Day", type: "NATIONAL" },
  { date: "2025-05-03", name: "Buddha Purnima", type: "GOVERNMENT" },
  // June
  { date: "2025-06-15", name: "Eid al-Adha (Bakrid)", type: "GOVERNMENT" },
  // July
  { date: "2025-07-07", name: "Muharram", type: "GOVERNMENT" },
  // August
  { date: "2025-08-15", name: "Independence Day", type: "NATIONAL" },
  { date: "2025-08-19", name: "Raksha Bandhan", type: "GOVERNMENT" },
  { date: "2025-08-31", name: "Krishna Janmashtami", type: "GOVERNMENT" },
  // September
  { date: "2025-09-09", name: "Ganesh Chaturthi", type: "GOVERNMENT" },
  { date: "2025-09-23", name: "Onam", type: "GOVERNMENT" },
  { date: "2025-09-30", name: "Eid-e-Milad", type: "GOVERNMENT" },
  // October
  { date: "2025-10-02", name: "Gandhi Jayanti", type: "NATIONAL" },
  { date: "2025-10-12", name: "Dussehra / Vijayadashami", type: "GOVERNMENT" },
  { date: "2025-10-20", name: "Karva Chauth", type: "GOVERNMENT" },
  { date: "2025-10-31", name: "Diwali (Deepavali)", type: "GOVERNMENT" },
  // November
  { date: "2025-11-01", name: "Govardhan Puja", type: "GOVERNMENT" },
  { date: "2025-11-02", name: "Bhai Dooj", type: "GOVERNMENT" },
  { date: "2025-11-06", name: "Chhath Puja", type: "GOVERNMENT" },
  { date: "2025-11-15", name: "Guru Nanak Jayanti", type: "GOVERNMENT" },
  // December
  { date: "2025-12-25", name: "Christmas Day", type: "NATIONAL" }
];

const HolidayCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  // Create calendar days array
  const calendarDays = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ day: null })
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day)
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    
    // Check if it's a weekend
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    
    // Check for holidays
    const holiday = INDIAN_GOV_HOLIDAYS_2025.find(h => h.date === dateStr)
    const isHoliday = holiday || isWeekend
    
    calendarDays.push({
      day,
      isWeekend,
      holiday,
      isHoliday,
      date: dateStr
    })
  }

  // Day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Month name
  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" })

  // Handle navigation
  const goToPreviousMonth = () => {
    setIsAnimating(true)
    setTimeout(() => {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
      setSelectedDay(null)
      setTimeout(() => setIsAnimating(false), 300)
    }, 300)
  }

  const goToNextMonth = () => {
    setIsAnimating(true)
    setTimeout(() => {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
      setSelectedDay(null)
      setTimeout(() => setIsAnimating(false), 300)
    }, 300)
  }

  // Today indicator
  const today = new Date()
  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear
  const todayDate = today.getDate()

  // Selected day details
  const selectedDayData = selectedDay ? calendarDays.find(day => day.date === selectedDay) : null

  // Handle click outside to close the details
  const closeDetails = () => {
    setSelectedDay(null)
  }

  // Calculate statistics for the current month
  const daysWithData = calendarDays.filter(day => day.day)
  const totalDays = daysWithData.length
  const weekendDays = daysWithData.filter(day => day.isWeekend).length
  const govHolidays = daysWithData.filter(day => day.holiday && !day.isWeekend).length
  const totalHolidays = weekendDays + govHolidays
  const workingDays = totalDays - totalHolidays

  // Calculate total statistics for the year
  const monthsInYear = Array.from({ length: 12 }, (_, i) => i)
  let yearTotalDays = 0
  let yearWorkingDays = 0
  let yearHolidays = 0
  let yearWeekends = 0
  let yearGovHolidays = 0

  monthsInYear.forEach(month => {
    const daysInMonth = new Date(currentYear, month + 1, 0).getDate()
    yearTotalDays += daysInMonth
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, month, day)
      const dateStr = `${currentYear}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const isGovHoliday = INDIAN_GOV_HOLIDAYS_2025.some(h => h.date === dateStr)
      
      if (isWeekend) yearWeekends++
      if (isGovHoliday) yearGovHolidays++
      if (isWeekend || isGovHoliday) yearHolidays++
    }
  })
  
  yearWorkingDays = yearTotalDays - yearHolidays

  return (
    <div className="bg-black bg-opacity-40 backdrop-blur-xl rounded-xl p-6 border border-white/5 shadow-2xl transition-all duration-300 hover:shadow-2xl hover:border-white/10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Calendar className="w-5 h-5 text-white/70 mr-2" />
          <h3 className="text-white font-medium text-lg">
            {monthName} {currentYear}
          </h3>
        </div>
        <div className="flex space-x-1">
          <button 
            onClick={goToPreviousMonth} 
            className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4 text-white/70" />
          </button>
          <button 
            onClick={goToNextMonth} 
            className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all duration-300"
          >
            <ChevronRight className="w-4 h-4 text-white/70" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className={`grid grid-cols-7 gap-2 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        {/* Day headers */}
        {dayNames.map((day, index) => (
          <div 
            key={index} 
            className={`text-center text-xs font-medium py-2 ${index === 0 || index === 6 ? 'text-white/60' : 'text-white/50'}`}
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          const isToday = isCurrentMonth && day.day === todayDate
          const isSelected = selectedDay === day.date

          return (
            <div
              key={index}
              onClick={() => day.day && setSelectedDay(isSelected ? null : day.date)}
              className={`aspect-square flex items-center justify-center rounded-md text-sm transition-all duration-300
                ${day.day ? 'cursor-pointer' : 'text-transparent pointer-events-none'}
                ${day.isHoliday ? 'bg-red-500/10 text-red-400' : 'text-white/90'}
                ${isToday ? "ring-1 ring-blue-400/50" : ""}
                ${isSelected ? "ring-2 ring-white/30 bg-black bg-opacity-60" : ""}
                ${day.day ? "hover:bg-black hover:bg-opacity-60" : ""}
              `}
            >
              <div className="relative">
                {day.day}
                {day.holiday && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-red-500"></span>
                )}
                {day.isWeekend && !day.holiday && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-white/30"></span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Day Information */}
      {selectedDay && (
        <div className="mt-6 relative">
          <div className="p-4 bg-black bg-opacity-60 backdrop-blur-xl rounded-lg border border-white/10 transition-all duration-300">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-white font-medium">Holiday Details</h4>
              <button onClick={closeDetails} className="text-white/50 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <span className="text-white/60 w-20">Date:</span>
                <span className="text-white">{selectedDay}</span>
              </div>
              
              {selectedDayData?.holiday ? (
                <>
                  <div className="flex items-center">
                    <span className="text-white/60 w-20">Holiday:</span>
                    <span className="text-red-400">{selectedDayData.holiday.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-white/60 w-20">Type:</span>
                    <span className="text-white">{selectedDayData.holiday.type}</span>
                  </div>
                </>
              ) : selectedDayData?.isWeekend ? (
                <div className="flex items-center">
                  <span className="text-white/60 w-20">Holiday:</span>
                  <span className="text-white">Weekend ({dayNames[new Date(selectedDay).getDay()]})</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="text-white/60 w-20">Status:</span>
                  <span className="text-white/80">Working Day</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Statistics */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="bg-black bg-opacity-50 backdrop-blur-xl p-3 rounded-lg border border-white/10 transition-all duration-300 hover:bg-opacity-60">
          <div className="text-white/50 text-xs mb-1">Working Days</div>
          <div className="text-white font-medium text-lg">{workingDays}</div>
        </div>
        <div className="bg-black bg-opacity-50 backdrop-blur-xl p-3 rounded-lg border border-red-500/10 transition-all duration-300 hover:bg-opacity-60">
          <div className="text-red-400/70 text-xs mb-1">Holidays</div>
          <div className="text-red-400 font-medium text-lg">{totalHolidays}</div>
        </div>
        <div className="bg-black bg-opacity-50 backdrop-blur-xl p-3 rounded-lg border border-white/10 transition-all duration-300 hover:bg-opacity-60">
          <div className="text-white/50 text-xs mb-1">Total Days</div>
          <div className="text-white font-medium text-lg">{totalDays}</div>
        </div>
      </div>
      
      {/* Yearly Statistics */}
      <div className="mt-4 p-4 bg-black bg-opacity-50 backdrop-blur-xl rounded-lg border border-white/10">
        <h4 className="text-white/80 text-sm font-medium mb-3">Yearly Statistics ({currentYear})</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <span className="text-white/50 text-xs">Total Working Days</span>
            <span className="text-white font-medium">{yearWorkingDays}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-red-400/70 text-xs">Total Holidays</span>
            <span className="text-red-400 font-medium">{yearHolidays}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/50 text-xs">Weekends</span>
            <span className="text-white font-medium">{yearWeekends}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/50 text-xs">Gov. Holidays</span>
            <span className="text-white font-medium">{yearGovHolidays}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-white/5">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30 mr-2"></div>
            <span className="text-white/70 text-xs">Holiday</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-400/20 border border-blue-400/30 mr-2"></div>
            <span className="text-white/70 text-xs">Today</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HolidayCalendar